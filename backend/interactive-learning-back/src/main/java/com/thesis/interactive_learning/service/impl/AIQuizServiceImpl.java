package com.thesis.interactive_learning.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatCompletionResult;
import com.theokanning.openai.completion.chat.ChatMessage;
import com.theokanning.openai.service.OpenAiService;
import com.thesis.interactive_learning.model.Question;
import com.thesis.interactive_learning.service.AIQuizService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
public class AIQuizServiceImpl implements AIQuizService {

    private static final Logger logger = LoggerFactory.getLogger(AIQuizServiceImpl.class);

    @Value("${openai.api.key}")
    private String openAiApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public List<Question> generateAIQuestions(String documentText, int numberOfQuestions,
                                              String questionType, int difficulty, boolean microbitCompatible) {

        OpenAiService service = new OpenAiService(openAiApiKey);

        String prompt = buildQuizGenerationPrompt(documentText, numberOfQuestions,
                questionType, difficulty, microbitCompatible);

        try {
            ChatCompletionRequest completionRequest = ChatCompletionRequest.builder()
                    .model("gpt-3.5-turbo")
                    .messages(Arrays.asList(
                            new ChatMessage("system", getSystemPrompt(questionType)),
                            new ChatMessage("user", prompt)
                    ))
                    .maxTokens(2000)
                    .temperature(0.7)
                    .build();

            ChatCompletionResult completion = service.createChatCompletion(completionRequest);
            String aiResponse = completion.getChoices().get(0).getMessage().getContent();

            return parseAIResponse(aiResponse, questionType, documentText);

        } catch (Exception e) {
            logger.error("Error generating AI questions: " + e.getMessage(), e);
            throw new RuntimeException("Failed to generate AI questions", e);
        }
    }

    @Override
    public List<Question> generateTopicQuestions(String documentText, String topic,
                                                 int numberOfQuestions, String questionType,
                                                 int difficulty, boolean microbitCompatible) {

        String focusedText = extractTopicRelevantText(documentText, topic);
        return generateAIQuestions(focusedText, numberOfQuestions, questionType, difficulty, microbitCompatible);
    }

    @Override
    public List<Question> improveQuestions(List<Question> questions, String documentText) {
        // Implementation for improving existing questions
        OpenAiService service = new OpenAiService(openAiApiKey);

        String prompt = buildQuestionImprovementPrompt(questions, documentText);

        try {
            ChatCompletionRequest completionRequest = ChatCompletionRequest.builder()
                    .model("gpt-3.5-turbo")
                    .messages(Arrays.asList(
                            new ChatMessage("system", getImprovementSystemPrompt()),
                            new ChatMessage("user", prompt)
                    ))
                    .maxTokens(2000)
                    .temperature(0.5)
                    .build();

            ChatCompletionResult completion = service.createChatCompletion(completionRequest);
            String aiResponse = completion.getChoices().get(0).getMessage().getContent();

            return parseAIResponseForImprovement(aiResponse);

        } catch (Exception e) {
            logger.error("Error improving questions: {}", e.getMessage(), e);
            return questions;
        }
    }


    private String getSystemPrompt(String questionType) {
        String specificInstructions = "";

        if ("MULTIPLE_CHOICE".equals(questionType)) {
            specificInstructions = """
            MULTIPLE CHOICE REQUIREMENTS:
            - Generate ONLY multiple choice questions that test UNDERSTANDING, not word recognition
            - Ask about concepts, relationships, causes, effects, purposes, meanings
            - NEVER create "fill in the blank" questions
            - NEVER ask "which word appears in the text"
            - Each question must have exactly 4 options
            - All options should be similar length and plausible
            - Test comprehension: "Why does X happen?", "What is the purpose of Y?", "How does Z work?"
            - Focus on ideas, not specific words
            """;
        } else if ("TRUE_FALSE".equals(questionType)) {
            specificInstructions = """
            TRUE/FALSE REQUIREMENTS:
            - Generate ONLY true/false questions that test COMPREHENSION
            - Ask about relationships, consequences, purposes, meanings
            - Test understanding of concepts, not memorization of exact words
            - Each question must have exactly 2 options: ["True", "False"] for English or ["E vërtetë", "E gabuar"] for Albanian
            - Make statements about ideas and concepts, not word matching
            """;
        }

        return String.format("""
        You are an expert educational content creator who creates questions that test DEEP UNDERSTANDING.
        
        CRITICAL: Your questions must test COMPREHENSION and CRITICAL THINKING, not word recognition.
        
        FORBIDDEN QUESTION TYPES:
        - Fill in the blank questions
        - "Which word appears in the text"
        - "Complete the sentence"
        - Simple word matching
        
        REQUIRED QUESTION TYPES:
        - Why does something happen?
        - What is the purpose/goal of something?
        - How does something work?
        - What are the consequences of something?
        - What is the main idea/concept?
        - How are concepts related?
        - What can be concluded from the information?
        
        LANGUAGE DETECTION: 
        - If you see Albanian words like: është, janë, dhe, në, për, nga, që, me, si, do, të, ka, kam, kemi, kanë, ishte, qe, por, ose, edhe, vetëm, gjithashtu, kur, ku, çfarë, si, pse, kush
        - Generate ALL content in Albanian
        - Otherwise generate in English
        
        %s
        
        QUALITY REQUIREMENTS:
        1. Test understanding of main concepts and ideas
        2. Focus on comprehension, analysis, and application
        3. Create questions that require thinking, not just text scanning
        4. Make all answer options equally plausible and similar in style
        5. Ensure questions could be answered by someone who understands the topic, even without the exact text
        
        Response format: Valid JSON array of question objects with these fields:
        - questionText: The question (testing understanding, not word recognition)
        - questionType: "%s"
        - options: Array of answer choices (similar length, all plausible)
        - correctOptionIndex: Index of correct answer (0-based)
        - explanation: Why this answer is correct (explains the concept)
        - difficultyLevel: 1, 2, or 3
        - sourceText: Relevant excerpt from original text
        """, specificInstructions, questionType);
    }

    private String getImprovementSystemPrompt() {
        return """
            You are an expert at improving educational quiz questions.
            Analyze the provided questions and enhance them while maintaining their core learning objectives.
            
            CRITICAL: Maintain the SAME LANGUAGE as the original questions and source document.
            Do not translate or change the language - only improve the quality within the same language.
            
            Improvements to make:
            1. Clarify ambiguous wording
            2. Enhance distractors (wrong answers) to be more plausible
            3. Improve explanations
            4. Ensure questions test deeper understanding
            5. Fix any factual errors
            6. Improve grammar and clarity while maintaining the original language
            
            Return improved questions in the same JSON format and language.
            """;
    }

    private String buildQuizGenerationPrompt(String documentText, int numberOfQuestions,
                                             String questionType, int difficulty, boolean microbitCompatible) {

        String difficultyText = switch (difficulty) {
            case 1 -> "Easy (basic concepts and main ideas)";
            case 2 -> "Medium (relationships and applications)";
            case 3 -> "Hard (analysis and critical thinking)";
            default -> "Medium";
        };

        String questionTypeText = "MULTIPLE_CHOICE".equals(questionType) ?
                "multiple choice questions with 4 options each" :
                "true/false questions";

        return String.format("""
                        Create %d intelligent %s that test UNDERSTANDING of this educational content.
                        
                        Question Type: %s
                        Difficulty Level: %s
                        
                        CRITICAL INSTRUCTIONS:
                        1. Read and UNDERSTAND the content first
                        2. Identify the main concepts, ideas, and relationships
                        3. Create questions about WHY, HOW, WHAT PURPOSE, WHAT EFFECT
                        4. NEVER ask students to fill in blanks or identify specific words
                        5. Test if students understand the IDEAS and CONCEPTS
                        
                        EXAMPLES OF GOOD QUESTIONS:
                        - "What is the main purpose of [concept mentioned in text]?"
                        - "Why does [process/phenomenon] occur according to the text?"
                        - "How does [concept A] relate to [concept B]?"
                        - "What can be concluded about [topic] from the information provided?"
                        - "What would happen if [condition] changed?"
                        
                        EXAMPLES OF BAD QUESTIONS (DO NOT CREATE):
                        - "Fill in the blank: _______ is mentioned in the text"
                        - "Which word appears in the document?"
                        - "Complete the sentence: [exact sentence from text]"
                        
                        Document Content:
                        %s
                        
                        Create questions that test whether students UNDERSTAND the material, not whether they can scan text for words.
                        Focus on comprehension, reasoning, and application of knowledge.
                        
                        Return as a JSON array of question objects.
                        """,
                numberOfQuestions, questionTypeText, questionType, difficultyText,
                truncateText(documentText, 3000)
        );
    }

    private String buildQuestionImprovementPrompt(List<Question> questions, String documentText) {
        StringBuilder questionsJson = new StringBuilder();
        try {
            questionsJson.append(objectMapper.writeValueAsString(questions));
        } catch (Exception e) {
            logger.error("Error serializing questions", e);
            return "";
        }

        return String.format("""
            Improve these quiz questions based on the original document content.
            
            Original Document:
            %s
            
            Current Questions:
            %s
            
            Please improve these questions and return them in the same JSON format.
            """,
                truncateText(documentText, 2000), questionsJson.toString()
        );
    }

    private List<Question> parseAIResponse(String aiResponse, String expectedQuestionType, String documentText) {
        try {
            // Clean the response to extract JSON
            String jsonResponse = extractJsonFromResponse(aiResponse);

            // Parse JSON to List of Maps
            List<Map<String, Object>> questionMaps = objectMapper.readValue(
                    jsonResponse, new TypeReference<List<Map<String, Object>>>() {}
            );

            List<Question> questions = new ArrayList<>();

            for (Map<String, Object> questionMap : questionMaps) {
                Question question = new Question();

                question.setQuestionText((String) questionMap.get("questionText"));

                // Ensure question type matches expected type
                String questionType = (String) questionMap.get("questionType");
                if (!expectedQuestionType.equals(questionType)) {
                    logger.warn("Question type mismatch. Expected: " + expectedQuestionType + ", Got: " + questionType);
                    question.setQuestionType(expectedQuestionType); // Force correct type
                } else {
                    question.setQuestionType(questionType);
                }

                question.setExplanation((String) questionMap.get("explanation"));
                question.setSourceText((String) questionMap.get("sourceText"));

                // Handle options
                @SuppressWarnings("unchecked")
                List<String> options = (List<String>) questionMap.get("options");

                // Validate options based on question type
                if ("MULTIPLE_CHOICE".equals(expectedQuestionType) && options.size() != 4) {
                    logger.warn("Multiple choice question doesn't have 4 options. Fixing...");
                    options = ensureFourOptions(options);
                } else if ("TRUE_FALSE".equals(expectedQuestionType) && options.size() != 2) {
                    logger.warn("True/false question doesn't have 2 options. Fixing...");
                    // Try to preserve language-appropriate true/false options
                    options = ensureTrueFalseOptions(options, documentText);
                }

                question.setOptions(options);

                // Handle correctOptionIndex
                Object correctIndex = questionMap.get("correctOptionIndex");
                if (correctIndex instanceof Integer) {
                    question.setCorrectOptionIndex((Integer) correctIndex);
                } else if (correctIndex instanceof String) {
                    question.setCorrectOptionIndex(Integer.parseInt((String) correctIndex));
                }

                // Validate correct index
                if (question.getCorrectOptionIndex() >= options.size()) {
                    logger.warn("Correct option index out of bounds. Setting to 0.");
                    question.setCorrectOptionIndex(0);
                }

                // Handle difficulty level
                Object difficulty = questionMap.get("difficultyLevel");
                if (difficulty instanceof Integer) {
                    question.setDifficultyLevel((Integer) difficulty);
                } else if (difficulty instanceof String) {
                    question.setDifficultyLevel(Integer.parseInt((String) difficulty));
                } else {
                    question.setDifficultyLevel(2); // Default to medium
                }

                questions.add(question);
            }

            return questions;

        } catch (Exception e) {
            logger.error("Error parsing AI response: " + e.getMessage(), e);
            logger.error("AI Response was: " + aiResponse);
            throw new RuntimeException("Failed to parse AI response", e);
        }
    }

    private List<String> ensureFourOptions(List<String> originalOptions) {
        List<String> fixedOptions = new ArrayList<>(originalOptions);

        // If less than 4 options, add generic ones
        while (fixedOptions.size() < 4) {
            fixedOptions.add("Option " + (fixedOptions.size() + 1));
        }

        // If more than 4 options, keep only first 4
        if (fixedOptions.size() > 4) {
            fixedOptions = fixedOptions.subList(0, 4);
        }

        return fixedOptions;
    }

    private List<String> ensureTrueFalseOptions(List<String> originalOptions, String documentText) {
        // Try to detect language and provide appropriate True/False options
        if (originalOptions != null && !originalOptions.isEmpty()) {
            // If we have some options, try to use them if they look like true/false
            String first = originalOptions.get(0).toLowerCase();
            if (first.contains("true") || first.contains("false") ||
                    first.contains("e vërtetë") || first.contains("e gabuar") ||
                    first.contains("saktë") || first.contains("gabim")) {
                // Keep original if they seem language-appropriate
                if (originalOptions.size() >= 2) {
                    return Arrays.asList(originalOptions.get(0), originalOptions.get(1));
                }
            }
        }

        // Detect document language and provide appropriate options
        String docLowerCase = documentText.toLowerCase();

        // Albanian detection - common Albanian words and patterns
        if (docLowerCase.contains(" është ") || docLowerCase.contains(" janë ") ||
                docLowerCase.contains(" dhe ") || docLowerCase.contains(" në ") ||
                docLowerCase.contains(" për ") || docLowerCase.contains(" nga ") ||
                docLowerCase.contains(" që ") || docLowerCase.contains(" me ") ||
                docLowerCase.contains("shqip") || docLowerCase.contains("shqiptar")) {
            return Arrays.asList("E vërtetë", "E gabuar");
        }

        // English (default)
        return Arrays.asList("True", "False");
    }

    private List<Question> parseAIResponseForImprovement(String aiResponse) {
        try {
            // Clean the response to extract JSON
            String jsonResponse = extractJsonFromResponse(aiResponse);

            // Parse JSON to List of Maps
            List<Map<String, Object>> questionMaps = objectMapper.readValue(
                    jsonResponse, new TypeReference<List<Map<String, Object>>>() {}
            );

            List<Question> questions = new ArrayList<>();

            for (Map<String, Object> questionMap : questionMaps) {
                Question question = new Question();

                question.setQuestionText((String) questionMap.get("questionText"));
                question.setQuestionType((String) questionMap.get("questionType"));
                question.setExplanation((String) questionMap.get("explanation"));
                question.setSourceText((String) questionMap.get("sourceText"));

                // Handle options (no strict validation for improvement)
                @SuppressWarnings("unchecked")
                List<String> options = (List<String>) questionMap.get("options");
                question.setOptions(options);

                // Handle correctOptionIndex
                Object correctIndex = questionMap.get("correctOptionIndex");
                if (correctIndex instanceof Integer) {
                    question.setCorrectOptionIndex((Integer) correctIndex);
                } else if (correctIndex instanceof String) {
                    question.setCorrectOptionIndex(Integer.parseInt((String) correctIndex));
                }

                // Validate correct index
                if (question.getCorrectOptionIndex() >= options.size()) {
                    logger.warn("Correct option index out of bounds. Setting to 0.");
                    question.setCorrectOptionIndex(0);
                }

                // Handle difficulty level
                Object difficulty = questionMap.get("difficultyLevel");
                if (difficulty instanceof Integer) {
                    question.setDifficultyLevel((Integer) difficulty);
                } else if (difficulty instanceof String) {
                    question.setDifficultyLevel(Integer.parseInt((String) difficulty));
                } else {
                    question.setDifficultyLevel(2); // Default to medium
                }

                questions.add(question);
            }

            return questions;

        } catch (Exception e) {
            logger.error("Error parsing AI improvement response: " + e.getMessage(), e);
            logger.error("AI Response was: " + aiResponse);
            throw new RuntimeException("Failed to parse AI improvement response", e);
        }
    }

    private String extractJsonFromResponse(String response) {
        // Remove markdown code blocks if present
        response = response.replaceAll("```json", "").replaceAll("```", "");

        // Find the JSON array
        int startIndex = response.indexOf('[');
        int endIndex = response.lastIndexOf(']') + 1;

        if (startIndex >= 0 && endIndex > startIndex) {
            return response.substring(startIndex, endIndex);
        }

        throw new RuntimeException("No valid JSON array found in AI response");
    }

    private String extractTopicRelevantText(String documentText, String topic) {
        // Simple implementation: find paragraphs containing the topic
        String[] paragraphs = documentText.split("\n\n");
        StringBuilder relevantText = new StringBuilder();

        for (String paragraph : paragraphs) {
            if (paragraph.toLowerCase().contains(topic.toLowerCase())) {
                relevantText.append(paragraph).append("\n\n");
            }
        }

        return !relevantText.isEmpty() ? relevantText.toString() : documentText;
    }

    private String truncateText(String text, int maxLength) {
        if (text.length() <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + "...";
    }
}