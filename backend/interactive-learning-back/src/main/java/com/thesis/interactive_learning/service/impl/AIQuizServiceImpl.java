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

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AIQuizServiceImpl implements AIQuizService {

    private static final Logger logger = LoggerFactory.getLogger(AIQuizServiceImpl.class);

    // Configuration
    private static final int MAX_RETRIES = 2;
    private static final int MAX_TEXT_LENGTH = 3000;
    private static final String GPT_MODEL = "gpt-3.5-turbo";
    private static final int TIMEOUT_SECONDS = 60;
    private static final int RETRY_DELAY_MS = 1000;

    // OpenAI Parameters
    private static final double TEMPERATURE = 0.7;
    private static final double TOP_P = 0.9;
    private static final double FREQUENCY_PENALTY = 0.3;
    private static final double PRESENCE_PENALTY = 0.1;

    @Value("${openai.api.key}")
    private String openAiApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ========== PUBLIC INTERFACE METHODS ==========

    @Override
    public List<Question> generateAIQuestions(String documentText, int numberOfQuestions,
                                              String questionType, int difficulty, boolean microbitCompatible) {

        logger.info("Starting AI question generation: {} {} questions, difficulty: {}",
                numberOfQuestions, questionType, difficulty);

        if (documentText == null || documentText.trim().length() < 100) {
            throw new RuntimeException("Document text is too short for question generation");
        }

        List<Question> validQuestions = new ArrayList<>();
        int attempts = 0;

        while (validQuestions.size() < numberOfQuestions && attempts < MAX_RETRIES) {
            attempts++;
            int questionsNeeded = numberOfQuestions - validQuestions.size();
            // Request exactly what we need + small buffer (not double)
            int questionsToRequest = Math.min(questionsNeeded + 2, numberOfQuestions + 3);

            try {
                logger.info("Attempt {}/{}: Requesting {} questions, need {} more",
                        attempts, MAX_RETRIES, questionsToRequest, questionsNeeded);

                List<Question> newQuestions = generateQuestionsWithOpenAI(
                        documentText, questionsToRequest, questionType, difficulty, attempts
                );

                List<Question> validatedQuestions = validateAndFilterQuestions(newQuestions, questionType);
                validQuestions.addAll(validatedQuestions);

                logger.info("Attempt {}: Generated {} valid questions. Total valid: {}",
                        attempts, validatedQuestions.size(), validQuestions.size());

                if (validQuestions.size() >= numberOfQuestions) {
                    break;
                }

                if (attempts < MAX_RETRIES) {
                    Thread.sleep(RETRY_DELAY_MS);
                }

            } catch (Exception e) {
                logger.error("Error in attempt {} to generate questions: {}", attempts, e.getMessage());

                if (attempts == MAX_RETRIES) {
                    if (!validQuestions.isEmpty()) {
                        logger.warn("Returning {} questions instead of requested {} due to failures",
                                validQuestions.size(), numberOfQuestions);
                        break;
                    }
                    throw new RuntimeException("Failed to generate questions after " + MAX_RETRIES + " attempts", e);
                }
            }
        }

        List<Question> finalQuestions = validQuestions.stream()
                .limit(numberOfQuestions)
                .collect(Collectors.toList());

        logGenerationSummary(finalQuestions, numberOfQuestions);
        return finalQuestions;
    }

    @Override
    public List<Question> generateTopicQuestions(String documentText, String topic,
                                                 int numberOfQuestions, String questionType,
                                                 int difficulty, boolean microbitCompatible) {
        String focusedText = extractTopicRelevantContent(documentText, topic);
        return generateAIQuestions(focusedText, numberOfQuestions, questionType, difficulty, microbitCompatible);
    }

    @Override
    public List<Question> improveQuestions(List<Question> questions, String documentText) {
        try {
            OpenAiService service = createOpenAiService();
            String prompt = buildImprovementPrompt(questions, documentText);

            ChatCompletionRequest request = ChatCompletionRequest.builder()
                    .model(GPT_MODEL)
                    .messages(Arrays.asList(
                            new ChatMessage("system", getImprovementSystemPrompt()),
                            new ChatMessage("user", prompt)
                    ))
                    .maxTokens(2000)
                    .temperature(TEMPERATURE)
                    .topP(TOP_P)
                    .frequencyPenalty(FREQUENCY_PENALTY)
                    .presencePenalty(PRESENCE_PENALTY)
                    .build();

            ChatCompletionResult result = service.createChatCompletion(request);
            String response = result.getChoices().get(0).getMessage().getContent();

            List<Question> improvedQuestions = parseAIResponse(response);
            return improvedQuestions.isEmpty() ? questions : improvedQuestions;

        } catch (Exception e) {
            logger.error("Error improving questions: {}", e.getMessage());
            return questions;
        }
    }

    // ========== CORE GENERATION METHODS ==========

    private List<Question> generateQuestionsWithOpenAI(String documentText, int numberOfQuestions,
                                                       String questionType, int difficulty, int attempt) {
        try {
            OpenAiService service = createOpenAiService();

            String systemPrompt = getSystemPrompt();
            String userPrompt = buildUserPrompt(documentText, numberOfQuestions, questionType, difficulty);

            int maxTokens = Math.max(1500 - (attempt * 200), 800);

            ChatCompletionRequest request = ChatCompletionRequest.builder()
                    .model(GPT_MODEL)
                    .messages(Arrays.asList(
                            new ChatMessage("system", systemPrompt),
                            new ChatMessage("user", userPrompt)
                    ))
                    .maxTokens(maxTokens)
                    .temperature(TEMPERATURE)
                    .topP(TOP_P)
                    .frequencyPenalty(FREQUENCY_PENALTY)
                    .presencePenalty(PRESENCE_PENALTY)
                    .build();

            logger.debug("Sending request to OpenAI with {} max tokens", maxTokens);

            ChatCompletionResult result = service.createChatCompletion(request);
            String response = result.getChoices().get(0).getMessage().getContent();

            logger.debug("Received OpenAI response: {} characters", response.length());

            return parseAIResponse(response);

        } catch (Exception e) {
            logger.error("OpenAI API call failed on attempt {}: {}", attempt, e.getMessage());
            throw new RuntimeException("OpenAI API error: " + e.getMessage(), e);
        }
    }

    // ========== PROMPT ENGINEERING ==========

    private String getSystemPrompt() {
        return """
            You are an expert educational quiz creator. Your task is to generate high-quality quiz questions 
            that test understanding and knowledge comprehension.

            CRITICAL REQUIREMENTS:
            - ALL questions and answers MUST be in ENGLISH only
            - Focus on key concepts and important information
            - Questions should test understanding, not memorization
            - Use clear, professional language
            - Avoid trivial details or trick questions
            
            QUESTION QUALITY STANDARDS:
            ✅ Clear and unambiguous wording
            ✅ Educationally valuable content
            ✅ Proper difficulty level
            ✅ Realistic and balanced answer choices
            ✅ Focus on core concepts
            
            AVOID:
            ❌ Questions starting with "According to the text"
            ❌ Trivial details or obscure facts
            ❌ Obvious or implausible answer choices
            ❌ Any non-English text
            ❌ Overly complex or confusing language
            """;
    }

    private String buildUserPrompt(String documentText, int numberOfQuestions, String questionType, int difficulty) {
        String preprocessedText = preprocessText(documentText);
        String truncatedText = truncateText(preprocessedText, MAX_TEXT_LENGTH);

        if ("MULTIPLE_CHOICE".equals(questionType)) {
            return buildMultipleChoicePrompt(truncatedText, numberOfQuestions);
        } else if ("TRUE_FALSE".equals(questionType)) {
            return buildTrueFalsePrompt(truncatedText, numberOfQuestions);
        }

        return buildMultipleChoicePrompt(truncatedText, numberOfQuestions);
    }

    private String buildMultipleChoicePrompt(String documentText, int numberOfQuestions) {
        return String.format("""
            Create exactly %d high-quality multiple-choice questions based on this document:
            
            DOCUMENT:
            %s
            
            REQUIREMENTS:
            - Questions in perfect English only
            - Test understanding of key concepts
            - Each question has exactly 4 options (A, B, C, D)
            - One clearly correct answer
            - Three plausible but incorrect options
            - Focus on WHY, HOW, and WHAT concepts
            
            RETURN FORMAT - ONLY valid JSON array:
            [
              {
                "questionText": "What is the main concept of...?",
                "questionType": "MULTIPLE_CHOICE",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctOptionIndex": 0,
                "explanation": "Brief explanation of correct answer",
                "difficultyLevel": 2,
                "sourceText": "Relevant source excerpt"
              }
            ]
            
            IMPORTANT: Return ONLY the JSON array, no markdown, no extra text.
            """, numberOfQuestions, truncateText(documentText, 2500));
    }

    private String buildTrueFalsePrompt(String documentText, int numberOfQuestions) {
        return String.format("""
            Create exactly %d high-quality true/false questions based on this document:
            
            DOCUMENT:
            %s
            
            REQUIREMENTS:
            - Statements in perfect English only
            - Test understanding of key facts and concepts
            - Clear true or false answers
            - Focus on important information
            
            RETURN FORMAT - ONLY valid JSON array:
            [
              {
                "questionText": "The main principle states that...",
                "questionType": "TRUE_FALSE",
                "options": ["True", "False"],
                "correctOptionIndex": 0,
                "explanation": "Brief explanation",
                "difficultyLevel": 2,
                "sourceText": "Relevant source excerpt"
              }
            ]
            
            IMPORTANT: Return ONLY the JSON array, no markdown, no extra text.
            """, numberOfQuestions, truncateText(documentText, 2500));
    }

    private String getImprovementSystemPrompt() {
        return """
            You are an expert quiz question reviewer. Your job is to improve quiz questions 
            for better educational value and clarity.
            
            IMPROVEMENT FOCUS:
            - Ensure perfect English language
            - Enhance question clarity
            - Improve answer option balance
            - Strengthen educational value
            - Remove any reference to "the text" or "the document"
            """;
    }

    private String buildImprovementPrompt(List<Question> questions, String documentText) {
        try {
            String questionsJson = objectMapper.writeValueAsString(questions);
            return String.format("""
                Improve these quiz questions for better educational quality:
                
                DOCUMENT CONTEXT:
                %s
                
                CURRENT QUESTIONS:
                %s
                
                IMPROVEMENTS NEEDED:
                - Convert to perfect English if needed
                - Enhance question clarity
                - Balance answer choices
                - Focus on understanding over memorization
                - Remove text references
                
                Return improved questions in the same JSON format.
                """, truncateText(documentText, 1500), questionsJson);
        } catch (Exception e) {
            logger.error("Error building improvement prompt", e);
            return "Improve the provided questions for better educational value.";
        }
    }

    // ========== RESPONSE PARSING ==========

    private List<Question> parseAIResponse(String response) {
        try {
            if (response == null || response.trim().isEmpty()) {
                logger.warn("Empty AI response received");
                return new ArrayList<>();
            }

            String jsonContent = extractJsonFromResponse(response);

            List<Map<String, Object>> questionMaps = objectMapper.readValue(
                    jsonContent, new TypeReference<List<Map<String, Object>>>() {}
            );

            List<Question> questions = questionMaps.stream()
                    .map(this::convertMapToQuestion)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            logger.info("Successfully parsed {} questions from AI response", questions.size());
            return questions;

        } catch (Exception e) {
            logger.error("JSON parsing failed: {}", e.getMessage());
            return fallbackQuestionExtraction(response);
        }
    }

    private String extractJsonFromResponse(String response) {
        // Remove markdown formatting
        response = response.replaceAll("```json\\s*", "").replaceAll("```\\s*", "");

        // Find JSON array bounds
        int startIndex = response.indexOf('[');
        int endIndex = response.lastIndexOf(']');

        if (startIndex >= 0 && endIndex > startIndex) {
            String jsonContent = response.substring(startIndex, endIndex + 1);
            return cleanJsonContent(jsonContent);
        }

        throw new RuntimeException("No valid JSON array found in AI response");
    }

    private String cleanJsonContent(String jsonContent) {
        // Fix common JSON issues
        jsonContent = jsonContent.replaceAll(",\\s*}", "}"); // Remove trailing commas
        jsonContent = jsonContent.replaceAll(",\\s*]", "]");

        // Fix quote issues
        jsonContent = jsonContent.replaceAll("'([^']*)'\\s*:", "\"$1\":");
        jsonContent = jsonContent.replaceAll(":\\s*'([^']*)'", ": \"$1\"");

        return jsonContent.trim();
    }

    private List<Question> fallbackQuestionExtraction(String response) {
        logger.info("Attempting fallback question extraction");
        List<Question> questions = new ArrayList<>();

        try {
            Pattern questionPattern = Pattern.compile("\"questionText\"\\s*:\\s*\"([^\"]+)\"");
            Pattern optionsPattern = Pattern.compile("\"options\"\\s*:\\s*\\[([^\\]]+)\\]");
            Pattern correctIndexPattern = Pattern.compile("\"correctOptionIndex\"\\s*:\\s*(\\d+)");

            Matcher questionMatcher = questionPattern.matcher(response);
            Matcher optionsMatcher = optionsPattern.matcher(response);
            Matcher correctMatcher = correctIndexPattern.matcher(response);

            while (questionMatcher.find() && optionsMatcher.find() && correctMatcher.find()) {
                try {
                    Question question = new Question();
                    question.setQuestionText(questionMatcher.group(1));
                    question.setQuestionType("MULTIPLE_CHOICE");

                    String optionsStr = optionsMatcher.group(1);
                    String[] optionsArray = optionsStr.split("\",\\s*\"");
                    List<String> options = Arrays.stream(optionsArray)
                            .map(opt -> opt.replaceAll("^\"|\"$", ""))
                            .collect(Collectors.toList());

                    if (options.size() >= 2) {
                        question.setOptions(options);
                        question.setCorrectOptionIndex(Integer.parseInt(correctMatcher.group(1)));
                        question.setExplanation("AI-generated explanation");
                        question.setDifficultyLevel(2);
                        question.setSourceText("Extracted from document");
                        questions.add(question);
                    }

                    if (questions.size() >= 3) break; // Limit fallback questions

                } catch (Exception e) {
                    logger.debug("Error in fallback extraction: {}", e.getMessage());
                }
            }

            logger.info("Fallback extraction generated {} questions", questions.size());
        } catch (Exception e) {
            logger.error("Fallback extraction failed: {}", e.getMessage());
        }

        return questions;
    }

    private Question convertMapToQuestion(Map<String, Object> questionMap) {
        try {
            Question question = new Question();

            String questionText = getString(questionMap, "questionText");
            if (questionText == null || questionText.trim().isEmpty()) {
                return null;
            }

            question.setQuestionText(questionText.trim());
            question.setQuestionType(getString(questionMap, "questionType"));
            question.setExplanation(getString(questionMap, "explanation"));
            question.setSourceText(getString(questionMap, "sourceText"));

            // Handle options
            @SuppressWarnings("unchecked")
            List<String> options = (List<String>) questionMap.get("options");
            if (options == null || options.isEmpty()) {
                return null;
            }

            // Clean up options
            List<String> cleanedOptions = options.stream()
                    .map(option -> option.replaceAll("^[A-D]\\)\\s*", "").trim())
                    .collect(Collectors.toList());

            question.setOptions(cleanedOptions);

            // Handle correct answer index
            Integer correctIndex = getInteger(questionMap, "correctOptionIndex");
            if (correctIndex == null || correctIndex < 0 || correctIndex >= cleanedOptions.size()) {
                correctIndex = 0;
            }
            question.setCorrectOptionIndex(correctIndex);

            // Handle difficulty
            Integer difficulty = getInteger(questionMap, "difficultyLevel");
            question.setDifficultyLevel(difficulty != null ? difficulty : 2);

            return question;

        } catch (Exception e) {
            logger.error("Error converting map to question: {}", e.getMessage());
            return null;
        }
    }

    // ========== VALIDATION METHODS ==========

    private List<Question> validateAndFilterQuestions(List<Question> questions, String expectedType) {
        return questions.stream()
                .filter(q -> isValidQuestion(q, expectedType))
                .collect(Collectors.toList());
    }

    private boolean isValidQuestion(Question question, String expectedType) {
        if (question == null || question.getQuestionText() == null) {
            return false;
        }

        // Basic validation
        if (!isEnglishText(question.getQuestionText())) {
            logger.debug("Question rejected - not English: {}", question.getQuestionText());
            return false;
        }

        // Check forbidden patterns (relaxed)
        String text = question.getQuestionText().toLowerCase();
        if (text.contains("according to the text") || text.contains("the document states")) {
            logger.debug("Question rejected - forbidden pattern: {}", question.getQuestionText());
            return false;
        }

        // Type-specific validation
        if ("MULTIPLE_CHOICE".equals(expectedType)) {
            return validateMultipleChoice(question);
        } else if ("TRUE_FALSE".equals(expectedType)) {
            return validateTrueFalse(question);
        }

        return true;
    }

    private boolean validateMultipleChoice(Question question) {
        // Must have 4 options
        if (question.getOptions() == null || question.getOptions().size() != 4) {
            logger.debug("Multiple choice rejected - wrong option count: {}",
                    question.getOptions() != null ? question.getOptions().size() : 0);
            return false;
        }

        // All options should be in English
        for (String option : question.getOptions()) {
            if (!isEnglishText(option)) {
                logger.debug("Multiple choice rejected - non-English option: {}", option);
                return false;
            }
        }

        return true;
    }

    private boolean validateTrueFalse(Question question) {
        List<String> options = question.getOptions();
        if (options == null || options.size() != 2) {
            return false;
        }

        return (options.get(0).equalsIgnoreCase("True") && options.get(1).equalsIgnoreCase("False")) ||
                (options.get(0).equalsIgnoreCase("False") && options.get(1).equalsIgnoreCase("True"));
    }

    private boolean isEnglishText(String text) {
        if (text == null || text.trim().isEmpty()) {
            return false;
        }

        // Relaxed English validation - check for basic English words
        String lowerText = text.toLowerCase();
        String[] commonEnglishWords = {
                "the", "and", "or", "but", "in", "on", "at", "to", "for", "with", "by", "of", "from",
                "what", "why", "how", "which", "when", "where", "who", "is", "are", "was", "were",
                "this", "that", "can", "will", "would", "should", "could"
        };

        // Check if text contains at least one common English word
        for (String word : commonEnglishWords) {
            if (lowerText.contains(" " + word + " ") || lowerText.startsWith(word + " ") ||
                    lowerText.endsWith(" " + word) || lowerText.equals(word)) {
                return true;
            }
        }

        // Additional check for basic English structure
        return text.matches(".*[a-zA-Z].*") && text.length() > 5;
    }

    // ========== UTILITY METHODS ==========

    private OpenAiService createOpenAiService() {
        return new OpenAiService(openAiApiKey, java.time.Duration.ofSeconds(TIMEOUT_SECONDS));
    }

    private String preprocessText(String rawText) {
        if (rawText == null || rawText.trim().isEmpty()) {
            return rawText;
        }

        return rawText.replaceAll("\\s+", " ")
                .replaceAll("[^\u0000-\u007F]+", " ") // Remove non-ASCII characters
                .trim();
    }

    private String truncateText(String text, int maxLength) {
        if (text == null || text.length() <= maxLength) {
            return text;
        }

        String truncated = text.substring(0, maxLength);
        int lastSentenceEnd = Math.max(
                Math.max(truncated.lastIndexOf('.'), truncated.lastIndexOf('!')),
                truncated.lastIndexOf('?')
        );

        if (lastSentenceEnd > maxLength * 0.8) {
            return truncated.substring(0, lastSentenceEnd + 1);
        }

        return truncated + "...";
    }

    private String extractTopicRelevantContent(String documentText, String topic) {
        String[] paragraphs = documentText.split("\n\n");
        StringBuilder relevantContent = new StringBuilder();

        for (String paragraph : paragraphs) {
            if (paragraph.toLowerCase().contains(topic.toLowerCase())) {
                relevantContent.append(paragraph).append("\n\n");
            }
        }

        String result = relevantContent.toString().trim();
        return result.isEmpty() ? documentText : result;
    }

    private String getString(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : null;
    }

    private Integer getInteger(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof Integer) {
            return (Integer) value;
        } else if (value instanceof String) {
            try {
                return Integer.parseInt((String) value);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    private void logGenerationSummary(List<Question> questions, int requested) {
        if (questions.isEmpty()) {
            logger.warn("No questions were generated successfully");
            return;
        }

        logger.info("AI question generation summary: {}/{} questions generated",
                questions.size(), requested);

        Map<String, Long> typeCount = questions.stream()
                .collect(Collectors.groupingBy(Question::getQuestionType, Collectors.counting()));

        typeCount.forEach((type, count) ->
                logger.info("  - {}: {} questions", type, count));

        long questionsWithExplanations = questions.stream()
                .filter(q -> q.getExplanation() != null && !q.getExplanation().trim().isEmpty())
                .count();

        logger.info("  - Questions with explanations: {}/{}", questionsWithExplanations, questions.size());

        double avgQuestionLength = questions.stream()
                .mapToInt(q -> q.getQuestionText().length())
                .average()
                .orElse(0);

        logger.info("  - Average question length: {:.1f} characters", avgQuestionLength);
    }
}