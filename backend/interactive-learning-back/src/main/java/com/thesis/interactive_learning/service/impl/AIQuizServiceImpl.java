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
import java.util.stream.Collectors;

@Service
public class AIQuizServiceImpl implements AIQuizService {

    private static final Logger logger = LoggerFactory.getLogger(AIQuizServiceImpl.class);
    private static final int MAX_RETRIES = 3;
    private static final int MAX_TEXT_LENGTH = 3500; // Reduced for better performance
    private static final String GPT_MODEL = "gpt-3.5-turbo"; // More reliable for this use case
    private static final int TIMEOUT_SECONDS = 120; // 2 minutes timeout
    private static final int RETRY_DELAY_MS = 2000; // 2 seconds between retries

    @Value("${openai.api.key}")
    private String openAiApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public List<Question> generateAIQuestions(String documentText, int numberOfQuestions,
                                              String questionType, int difficulty, boolean microbitCompatible) {

        List<Question> validQuestions = new ArrayList<>();
        int attempts = 0;

        while (validQuestions.size() < numberOfQuestions && attempts < MAX_RETRIES) {
            attempts++;
            int questionsNeeded = numberOfQuestions - validQuestions.size();
            int questionsToRequest = Math.min(questionsNeeded * 2, 15); // Cap to prevent timeouts

            try {
                logger.info("Attempt {}/{}: Requesting {} questions, need {} more",
                        attempts, MAX_RETRIES, questionsToRequest, questionsNeeded);

                List<Question> newQuestions = generateQuestionsAttempt(
                        documentText, questionsToRequest, questionType, difficulty, attempts
                );

                List<Question> validatedQuestions = validateQuestions(newQuestions, questionType);
                validQuestions.addAll(validatedQuestions);

                logger.info("Attempt {}: Generated {} valid questions out of {} requested. Total valid: {}",
                        attempts, validatedQuestions.size(), questionsToRequest, validQuestions.size());

                // If we have enough questions, break the loop
                if (validQuestions.size() >= numberOfQuestions) {
                    break;
                }

                // Add delay between retries to avoid rate limiting
                if (attempts < MAX_RETRIES && validQuestions.size() < numberOfQuestions) {
                    Thread.sleep(RETRY_DELAY_MS);
                }

            } catch (Exception e) {
                logger.error("Error in attempt {} to generate questions: {}", attempts, e.getMessage());

                // If it's a timeout, try with a simpler approach
                if (isTimeoutException(e) && attempts < MAX_RETRIES) {
                    logger.warn("Timeout detected, will retry with simplified prompt");
                    try {
                        Thread.sleep(RETRY_DELAY_MS * attempts); // Exponential backoff
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                    continue;
                }

                if (attempts == MAX_RETRIES) {
                    // If we have some questions but not enough, return what we have
                    if (!validQuestions.isEmpty()) {
                        logger.warn("Returning {} questions instead of requested {} due to failures",
                                validQuestions.size(), numberOfQuestions);
                        return validQuestions.stream()
                                .limit(numberOfQuestions)
                                .collect(Collectors.toList());
                    }
                    throw new RuntimeException("Failed to generate any questions after " + MAX_RETRIES + " attempts", e);
                }
            }
        }

        List<Question> finalQuestions = validQuestions.stream()
                .limit(numberOfQuestions)
                .collect(Collectors.toList());

        logQuestionGenerationSummary(finalQuestions, numberOfQuestions);
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
                    .maxTokens(2000) // Reduced for reliability
                    .temperature(0.3)
                    .build();

            ChatCompletionResult result = service.createChatCompletion(request);
            String response = result.getChoices().get(0).getMessage().getContent();

            List<Question> improvedQuestions = parseAIResponse(response);
            return improvedQuestions.isEmpty() ? questions : improvedQuestions;

        } catch (Exception e) {
            logger.error("Error improving questions (will return original): {}", e.getMessage());
            return questions; // Return original questions if improvement fails
        }
    }

    private List<Question> generateQuestionsAttempt(String documentText, int numberOfQuestions,
                                                    String questionType, int difficulty, int attempt) {
        try {
            OpenAiService service = createOpenAiService();
            String systemPrompt = getSystemPrompt(questionType, difficulty);
            String userPrompt = buildUserPrompt(documentText, numberOfQuestions, questionType, difficulty, attempt);

            // Reduce token limits based on attempt to avoid timeouts
            int maxTokens = Math.max(1500 - (attempt * 200), 800);
            double temperature = Math.min(0.3 + (attempt * 0.1), 0.7);

            ChatCompletionRequest request = ChatCompletionRequest.builder()
                    .model(GPT_MODEL)
                    .messages(Arrays.asList(
                            new ChatMessage("system", systemPrompt),
                            new ChatMessage("user", userPrompt)
                    ))
                    .maxTokens(maxTokens)
                    .temperature(temperature)
                    .build();

            logger.debug("Sending request to OpenAI with {} max tokens and {} temperature", maxTokens, temperature);

            ChatCompletionResult result = service.createChatCompletion(request);
            String response = result.getChoices().get(0).getMessage().getContent();

            logger.debug("Received response from OpenAI: {} characters", response.length());

            return parseAIResponse(response);

        } catch (Exception e) {
            logger.error("OpenAI API call failed on attempt {}: {}", attempt, e.getMessage());

            // Re-wrap timeouts with more specific information
            if (isTimeoutException(e)) {
                throw new RuntimeException("OpenAI API timeout on attempt " + attempt +
                        " (try reducing document length or question count)", e);
            }

            throw new RuntimeException("OpenAI API error on attempt " + attempt + ": " + e.getMessage(), e);
        }
    }

    private OpenAiService createOpenAiService() {
        // Create service with custom timeout settings
        return new OpenAiService(openAiApiKey, java.time.Duration.ofSeconds(TIMEOUT_SECONDS));
    }

    private boolean isTimeoutException(Exception e) {
        return e.getMessage() != null &&
                (e.getMessage().contains("timeout") ||
                        e.getMessage().contains("SocketTimeoutException") ||
                        e.getCause() instanceof java.net.SocketTimeoutException ||
                        (e.getCause() != null && e.getCause().getMessage() != null &&
                                e.getCause().getMessage().contains("timeout")));
    }

    private String getSystemPrompt(String questionType, int difficulty) {
        String basePrompt = """
            You are an expert educational assessment designer with 20+ years of experience creating 
            high-quality exam questions. Your questions are used in professional certification exams 
            and university assessments.
            
            🌍 CRITICAL LANGUAGE REQUIREMENT:
            ALL QUESTIONS AND ANSWERS MUST BE IN ENGLISH ONLY, regardless of the source document language.
            If the source document is in Albanian or any other language, you must:
            1. Understand the content in its original language
            2. Generate questions that test the same concepts but in perfect English
            3. Ensure all answer choices are in proper English
            4. Never mix languages or include foreign language text
            
            CORE PRINCIPLES:
            1. Test UNDERSTANDING and APPLICATION, never simple recall
            2. Create questions that distinguish between students who truly understand vs. those who memorized
            3. Every question must have clear educational value
            4. Avoid any hint-giving in question structure or answer choices
            
            ABSOLUTELY FORBIDDEN:
            ❌ "According to the text/document" phrases
            ❌ Fill-in-the-blank questions
            ❌ Questions answerable without understanding the content
            ❌ Obvious answer patterns (length, complexity differences)
            ❌ Questions about specific quotes or exact wording
            ❌ "Which of the following is mentioned" type questions
            ❌ Any non-English text in questions or answers
            ❌ Transliterated words or foreign language terms without English explanation
            
            QUESTION QUALITY STANDARDS:
            ✅ Test WHY, HOW, WHAT IF, WHAT PURPOSE, IMPLICATIONS
            ✅ Require analysis, synthesis, or application of concepts
            ✅ Focus on relationships between ideas
            ✅ Challenge common misconceptions
            ✅ Assess deeper comprehension
            ✅ Use clear, professional English throughout
            """;

        if ("MULTIPLE_CHOICE".equals(questionType)) {
            return basePrompt + """
                
                MULTIPLE CHOICE SPECIFIC REQUIREMENTS:
                
                QUESTION STRUCTURE:
                - Always end with a clear question mark
                - Focus on conceptual understanding: "Why does X cause Y?", "What would happen if...?", "How does A relate to B?"
                - Test application: "In what scenario would this principle apply?"
                - Assess analysis: "What can be concluded from this information?"
                
                ANSWER CHOICES REQUIREMENTS:
                - Exactly 4 options, all grammatically parallel
                - Same approximate length (±20% word count)
                - Same level of technical detail
                - Same grammatical structure (all nouns, all phrases, all complete sentences)
                - All options must be plausible to someone with partial knowledge
                - Incorrect options should represent logical misconceptions, not random information
                - No obvious outliers in complexity, style, or format
                
                CONTENT BALANCE:
                - All options should belong to the same conceptual category
                - If correct answer is a process, all options should be processes
                - If correct answer is a cause, all options should be potential causes
                - Maintain consistent terminology and abstraction level
                """;
        } else {
            return basePrompt + """
                
                TRUE/FALSE SPECIFIC REQUIREMENTS:
                
                STATEMENT STRUCTURE:
                - Clear, unambiguous declarative statements
                - Focus on cause-effect relationships, implications, or conceptual connections
                - Test understanding of principles: "X leads to Y because of Z"
                - Assess comprehension of relationships: "A and B are related through C"
                
                CONTENT REQUIREMENTS:
                - Each statement tests one clear concept
                - Avoid compound statements with multiple testable claims
                - Truth value should not be obvious without understanding the material
                - False statements should represent plausible misconceptions
                - Statements should require reasoning about the content, not recognition
                
                STATEMENT QUALITY:
                - No ambiguous language or edge cases
                - Avoid absolute terms unless clearly supported (always, never, all, none)
                - Focus on principles and relationships rather than specific facts
                """;
        }
    }

    private String buildUserPrompt(String documentText, int numberOfQuestions, String questionType,
                                   int difficulty, int attempt) {
        String difficultyDescription = getDifficultyDescription(difficulty);
        String attemptGuidance = getAttemptSpecificGuidance(attempt);

        // Reduce text length more aggressively on later attempts to avoid timeouts
        int maxLength = Math.max(MAX_TEXT_LENGTH - (attempt * 500), 1500);
        String truncatedText = truncateText(documentText, maxLength);
        String detectedLanguage = detectDocumentLanguage(truncatedText);

        // Simplify prompt on later attempts
        if (attempt >= 2) {
            return buildSimplifiedPrompt(truncatedText, numberOfQuestions, questionType, difficulty, detectedLanguage);
        }

        return String.format("""
            Create %d high-quality %s questions in ENGLISH ONLY from this content.
            
            Source Language: %s → Generate questions in: ENGLISH
            Difficulty: %s
            
            %s
            
            CONTENT:
            %s
            
            REQUIREMENTS:
            1. All questions and answers must be in perfect English
            2. Test understanding of concepts, not text recognition
            3. Create balanced, professional answer choices
            4. No "according to the text" phrases
            5. Focus on WHY, HOW, and WHAT IF scenarios
            
            Return as JSON array:
            [{"questionText": "...", "questionType": "%s", "options": [...], "correctOptionIndex": 0, "explanation": "...", "difficultyLevel": %d, "sourceText": "..."}]
            """,
                numberOfQuestions,
                questionType.toLowerCase().replace("_", " "),
                detectedLanguage,
                difficultyDescription,
                attemptGuidance,
                truncatedText,
                questionType,
                difficulty
        );
    }

    private String buildSimplifiedPrompt(String text, int numberOfQuestions, String questionType,
                                         int difficulty, String detectedLanguage) {
        return String.format("""
            Create %d %s questions in ENGLISH from this %s content:
            
            %s
            
            Rules:
            - English questions only
            - Test understanding, not memorization  
            - Balanced answer choices for multiple choice
            - Clear true/false statements
            
            JSON format: [{"questionText":"...", "questionType":"%s", "options":[...], "correctOptionIndex":0, "explanation":"...", "difficultyLevel":%d, "sourceText":"..."}]
            """,
                numberOfQuestions,
                questionType.toLowerCase().replace("_", " "),
                detectedLanguage.toLowerCase(),
                truncateText(text, 2000),
                questionType,
                difficulty
        );
    }

    private String getDifficultyDescription(int difficulty) {
        return switch (difficulty) {
            case 1 -> "EASY - Test basic understanding of core concepts and main ideas";
            case 2 -> "MEDIUM - Test application of concepts and understanding of relationships";
            case 3 -> "HARD - Test analysis, evaluation, synthesis, and critical thinking";
            default -> "MEDIUM - Test application of concepts and understanding of relationships";
        };
    }

    private String getAttemptSpecificGuidance(int attempt) {
        return switch (attempt) {
            case 1 -> "Focus on the most important concepts and create clear, unambiguous questions.";
            case 2 -> "Previous attempt may have been too simple. Create more nuanced questions that require deeper analysis.";
            case 3 -> "Focus on practical applications and implications. Avoid questions that might be too theoretical.";
            default -> "";
        };
    }

    private String getImprovementSystemPrompt() {
        return """
            You are an expert question reviewer specializing in educational assessment quality.
            
            🌍 CRITICAL LANGUAGE REQUIREMENT:
            ALL QUESTIONS AND ANSWERS MUST BE IN ENGLISH ONLY, regardless of source document language.
            If you encounter any Albanian text or non-English content in the questions, convert it to proper English.
            
            Your task is to improve existing quiz questions by:
            1. Converting any non-English text to proper English
            2. Eliminating any "according to the text" or similar phrases
            3. Ensuring answer choices are balanced in length and complexity
            4. Making questions test understanding rather than recall
            5. Clarifying ambiguous wording
            6. Improving explanations to be more educational
            7. Ensuring all options are plausible and well-constructed
            8. Maintaining professional English grammar and vocabulary throughout
            
            Maintain the original learning objectives while significantly improving question quality.
            Return the improved questions in the same JSON format with perfect English content.
            """;
    }

    private String buildImprovementPrompt(List<Question> questions, String documentText) {
        try {
            String questionsJson = objectMapper.writeValueAsString(questions);
            String detectedLanguage = detectDocumentLanguage(documentText);

            return String.format("""
                Improve these quiz questions based on professional assessment standards.
                
                🌍 LANGUAGE REQUIREMENT: All improved questions must be in ENGLISH ONLY!
                The original document is in %s, but all questions and answers should be in proper English.
                
                ORIGINAL CONTENT:
                %s
                
                CURRENT QUESTIONS:
                %s
                
                IMPROVEMENT TASKS:
                1. Convert any non-English text to proper English
                2. Ensure questions test conceptual understanding, not text recognition
                3. Balance all answer choices in length and complexity
                4. Remove any reference to "the text" or "the document"
                5. Make all content professional and educationally valuable
                6. Maintain correct English grammar and vocabulary throughout
                
                Please enhance these questions while maintaining their core learning objectives.
                Focus on making them more professional, balanced, and educationally valuable IN ENGLISH.
                """,
                    detectedLanguage,
                    truncateText(documentText, 2000),
                    questionsJson
            );
        } catch (Exception e) {
            logger.error("Error building improvement prompt", e);
            return "Improve the provided questions for better educational value in English only.";
        }
    }

    private List<Question> parseAIResponse(String response) {
        try {
            String jsonContent = extractJsonFromResponse(response);
            List<Map<String, Object>> questionMaps = objectMapper.readValue(
                    jsonContent, new TypeReference<List<Map<String, Object>>>() {}
            );

            return questionMaps.stream()
                    .map(this::convertMapToQuestion)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            logger.error("Error parsing AI response: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    private Question convertMapToQuestion(Map<String, Object> questionMap) {
        try {
            Question question = new Question();

            String questionText = getString(questionMap, "questionText");
            if (questionText == null || questionText.trim().isEmpty() || !isValidEnglishText(questionText)) {
                return null;
            }

            question.setQuestionText(questionText.trim());
            question.setQuestionType(getString(questionMap, "questionType"));
            question.setExplanation(getString(questionMap, "explanation"));
            question.setSourceText(getString(questionMap, "sourceText"));

            // Handle options
            @SuppressWarnings("unchecked")
            List<String> options = (List<String>) questionMap.get("options");
            if (options == null) {
                return null;
            }

            // Ensure proper options for question type
            if ("TRUE_FALSE".equals(question.getQuestionType())) {
                question.setOptions(Arrays.asList("True", "False"));
            } else {
                if (options.size() != 4) {
                    return null; // Invalid multiple choice question
                }
                question.setOptions(options);
            }

            // Handle correct answer index
            Integer correctIndex = getInteger(questionMap, "correctOptionIndex");
            if (correctIndex == null || correctIndex < 0 || correctIndex >= question.getOptions().size()) {
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

    private List<Question> validateQuestions(List<Question> questions, String expectedType) {
        return questions.stream()
                .filter(q -> isValidQuestion(q, expectedType))
                .collect(Collectors.toList());
    }

    private boolean isValidQuestion(Question question, String expectedType) {
        if (question == null || question.getQuestionText() == null) {
            return false;
        }

        String text = question.getQuestionText().toLowerCase();

        // Check for forbidden patterns
        List<String> forbiddenPatterns = Arrays.asList(
                "according to", "fill in", "blank", "complete the", "which of the following",
                "mentioned in", "states that", "in the text", "in the document", "___"
        );

        for (String pattern : forbiddenPatterns) {
            if (text.contains(pattern)) {
                logger.debug("Question rejected for forbidden pattern '{}': {}", pattern, text);
                return false;
            }
        }

        // Enhanced English validation for Albanian/English documents
        if (!isValidEnglishText(question.getQuestionText())) {
            logger.debug("Question rejected for invalid English: {}", question.getQuestionText());
            return false;
        }

        // Validate all answer options are in English
        if (question.getOptions() != null) {
            for (String option : question.getOptions()) {
                if (!isValidEnglishText(option)) {
                    logger.debug("Question rejected for non-English option: {}", option);
                    return false;
                }
            }
        }

        // Validate question type specific requirements
        if ("MULTIPLE_CHOICE".equals(expectedType)) {
            return validateMultipleChoiceQuestion(question);
        } else if ("TRUE_FALSE".equals(expectedType)) {
            return validateTrueFalseQuestion(question);
        }

        return true;
    }

    private boolean validateMultipleChoiceQuestion(Question question) {
        // Must end with question mark
        if (!question.getQuestionText().trim().endsWith("?")) {
            logger.debug("Multiple choice question rejected - no question mark: {}", question.getQuestionText());
            return false;
        }

        // Must have exactly 4 options
        if (question.getOptions() == null || question.getOptions().size() != 4) {
            logger.debug("Multiple choice question rejected - invalid options count");
            return false;
        }

        // Check option balance
        return areOptionsBalanced(question.getOptions());
    }

    private boolean validateTrueFalseQuestion(Question question) {
        // Must be a statement, not a question
        if (question.getQuestionText().trim().endsWith("?")) {
            logger.debug("True/false question rejected - ends with question mark: {}", question.getQuestionText());
            return false;
        }

        // Must have True/False options
        List<String> options = question.getOptions();
        if (options == null || options.size() != 2 ||
                !options.get(0).equalsIgnoreCase("True") ||
                !options.get(1).equalsIgnoreCase("False")) {
            logger.debug("True/false question rejected - invalid options");
            return false;
        }

        return true;
    }

    private boolean areOptionsBalanced(List<String> options) {
        if (options.size() != 4) return false;

        // Check length balance
        double avgLength = options.stream().mapToInt(String::length).average().orElse(0);
        boolean lengthBalanced = options.stream()
                .allMatch(opt -> Math.abs(opt.length() - avgLength) <= avgLength * 0.4);

        if (!lengthBalanced) {
            logger.debug("Options rejected for length imbalance: {}", options);
            return false;
        }

        // Check for obvious patterns
        long distinctLengths = options.stream().mapToInt(String::length).distinct().count();
        if (distinctLengths == 1) {
            return true; // All same length is good
        }

        return distinctLengths >= 2; // Some variation is okay
    }

    private boolean isValidEnglishText(String text) {
        // Enhanced English detection for Albanian/English documents
        String[] englishIndicators = {
                "the", "and", "or", "but", "in", "on", "at", "to", "for", "with", "by", "of", "from",
                "what", "why", "how", "which", "when", "where", "who", "does", "is", "are", "was", "were",
                "this", "that", "these", "those", "can", "will", "would", "should", "could", "may", "might"
        };

        // Albanian words that should NOT appear in English questions
        String[] albanianWords = {
                "dhe", "ose", "por", "në", "me", "nga", "për", "si", "ka", "është", "janë", "të", "një",
                "kjo", "ktë", "këto", "ato", "do", "duhet", "mund", "mësi", "shkollë", "student", "arsim"
        };

        String lowerText = " " + text.toLowerCase() + " ";

        // Check for Albanian words (should fail validation)
        for (String albanianWord : albanianWords) {
            if (lowerText.contains(" " + albanianWord + " ")) {
                logger.debug("Question rejected for containing Albanian word '{}': {}", albanianWord, text);
                return false;
            }
        }

        // Check for English indicators (should pass validation)
        boolean hasEnglishIndicators = Arrays.stream(englishIndicators)
                .anyMatch(word -> lowerText.contains(" " + word + " "));

        // Additional checks for proper English structure
        boolean hasProperPunctuation = text.contains("?") || text.contains(".") || text.contains("!");
        boolean hasReasonableLength = text.length() > 10 && text.length() < 500;

        return hasEnglishIndicators && hasProperPunctuation && hasReasonableLength;
    }

    private String detectDocumentLanguage(String text) {
        if (text == null || text.trim().isEmpty()) {
            return "Unknown";
        }

        String lowerText = text.toLowerCase();

        // Common Albanian indicators
        String[] albanianIndicators = {
                " dhe ", " ose ", " por ", " në ", " me ", " nga ", " për ", " si ", " ka ", " është ",
                " janë ", " të ", " një ", " kjo ", " atë ", " këto ", " ato ", " arsim", " shkollë"
        };

        // Common English indicators
        String[] englishIndicators = {
                " the ", " and ", " or ", " but ", " in ", " on ", " at ", " to ", " for ", " with ",
                " by ", " of ", " from ", " what ", " why ", " how ", " education", " school"
        };

        int albanianCount = 0;
        int englishCount = 0;

        for (String indicator : albanianIndicators) {
            if (lowerText.contains(indicator)) {
                albanianCount++;
            }
        }

        for (String indicator : englishIndicators) {
            if (lowerText.contains(indicator)) {
                englishCount++;
            }
        }

        if (albanianCount > englishCount) {
            return "Albanian";
        } else if (englishCount > albanianCount) {
            return "English";
        } else {
            return "Mixed/Unknown";
        }
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

    private String extractJsonFromResponse(String response) {
        // Remove markdown formatting
        response = response.replaceAll("```json\\s*", "").replaceAll("```\\s*", "");

        // Find JSON array bounds
        int startIndex = response.indexOf('[');
        int endIndex = response.lastIndexOf(']');

        if (startIndex >= 0 && endIndex > startIndex) {
            return response.substring(startIndex, endIndex + 1);
        }

        throw new RuntimeException("No valid JSON array found in AI response");
    }

    private String truncateText(String text, int maxLength) {
        if (text == null || text.length() <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + "...";
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

    private void logQuestionGenerationSummary(List<Question> questions, int requested) {
        if (questions.isEmpty()) {
            logger.warn("No questions were generated successfully");
            return;
        }

        logger.info("Question generation summary: {}/{} questions generated", questions.size(), requested);

        Map<String, Long> typeCount = questions.stream()
                .collect(Collectors.groupingBy(Question::getQuestionType, Collectors.counting()));

        typeCount.forEach((type, count) ->
                logger.info("  - {}: {} questions", type, count));
    }

    private String sanitizeDocumentForLogging(String document) {
        if (document == null) return "null";
        if (document.length() <= 100) return document;
        return document.substring(0, 100) + "... (" + document.length() + " chars total)";
    }
}