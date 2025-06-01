package com.thesis.interactive_learning.service.impl;

import com.thesis.interactive_learning.model.*;
import com.thesis.interactive_learning.repository.DocumentRepository;
import com.thesis.interactive_learning.repository.QuestionRepository;
import com.thesis.interactive_learning.repository.QuizRepository;
import com.thesis.interactive_learning.repository.StudyCollectionRepository;
import com.thesis.interactive_learning.service.AIQuizService;
import com.thesis.interactive_learning.service.DocumentService;
import com.thesis.interactive_learning.service.QuestionGenerationService;
import com.thesis.interactive_learning.service.TextAnalysisService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;
import java.util.function.BiFunction;

@Service
public class QuestionGenerationServiceImpl implements QuestionGenerationService {

    private static final Logger logger = LoggerFactory.getLogger(QuestionGenerationServiceImpl.class);

    private final DocumentService documentService;
    private final TextAnalysisService textAnalysisService;
    private final AIQuizService aiQuizService;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final DocumentRepository documentRepository;
    private final StudyCollectionRepository studyCollectionRepository;

    private final Random random = new Random();

    @Autowired
    public QuestionGenerationServiceImpl(DocumentService documentService,
                                         TextAnalysisService textAnalysisService,
                                         AIQuizService aiQuizService,
                                         QuizRepository quizRepository,
                                         QuestionRepository questionRepository,
                                         DocumentRepository documentRepository,
                                         StudyCollectionRepository studyCollectionRepository) {
        this.documentService = documentService;
        this.textAnalysisService = textAnalysisService;
        this.aiQuizService = aiQuizService;
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.documentRepository = documentRepository;
        this.studyCollectionRepository = studyCollectionRepository;
    }

    @Override
    public Quiz generateQuizFromDocument(Long documentId, int numberOfQuestions, String quizTitle,
                                         String questionType, int difficulty, Long collectionId,
                                         boolean microbitCompatible, boolean useAI) throws IOException {

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        StudyCollection collection = null;
        if (collectionId != null) {
            collection = studyCollectionRepository.findById(collectionId)
                    .orElseThrow(() -> new RuntimeException("Collection not found"));
        }

        Map<String, Object> structuredText = documentService.extractStructuredTextFromPdf(documentId);
        String fullText = (String) structuredText.get("fullText");

        List<Question> questions = generateQuestionsFromText(fullText, numberOfQuestions, questionType,
                difficulty, microbitCompatible, useAI);

        Quiz quiz = new Quiz();
        quiz.setTitle(quizTitle);
        quiz.setCreatedAt(LocalDateTime.now());
        quiz.setDocument(document);
        quiz.setStudyCollection(collection);
        quiz.setMicrobitCompatible(microbitCompatible);

        Quiz savedQuiz = quizRepository.save(quiz);

        for (Question question : questions) {
            question.setQuiz(savedQuiz);
            questionRepository.save(question);
        }

        logger.info("Generated quiz '{}' with {} {} questions using {}",
                quizTitle, questions.size(), questionType, useAI ? "AI" : "basic generation");

        return savedQuiz;
    }

    @Override
    public List<Question> generateQuestionsFromText(String text, int numberOfQuestions, String questionType,
                                                    int difficulty, boolean microbitCompatible, boolean useAI) {

        if (useAI) {
            try {
                logger.info("Generating {} {} questions with AI (difficulty: {})",
                        numberOfQuestions, questionType, difficulty);

                List<Question> aiQuestions = aiQuizService.generateAIQuestions(text, numberOfQuestions,
                        questionType, difficulty, microbitCompatible);

                if (aiQuestions != null && !aiQuestions.isEmpty()) {
                    logger.info("Successfully generated {} AI questions", aiQuestions.size());
                    return aiQuestions;
                } else {
                    logger.warn("AI returned empty question list, falling back to basic generation");
                }
            } catch (Exception e) {
                logger.error("AI question generation failed: {}", e.getMessage(), e);
                logger.info("Falling back to basic question generation");
            }
        }

        // Fallback to basic generation or when AI is disabled
        return generateBasicQuestions(text, numberOfQuestions, questionType, microbitCompatible);
    }

    /**
     * Basic question generation (original logic) as fallback
     */
    private List<Question> generateBasicQuestions(String text, int numberOfQuestions, String questionType, boolean microbitCompatible) {
        logger.info("Using basic question generation for {} questions of type {}", numberOfQuestions, questionType);

        List<Question> questions = new ArrayList<>();
        List<String> sentences = textAnalysisService.extractSentences(text);
        Map<String, Double> keyTerms = textAnalysisService.extractKeyTerms(text, 30);

        if ("MULTIPLE_CHOICE".equals(questionType)) {
            addMultipleChoiceQuestions(questions, sentences, keyTerms, numberOfQuestions);
        } else if ("TRUE_FALSE".equals(questionType)) {
            addTrueFalseQuestions(questions, sentences, numberOfQuestions, text);
        } else {
            // Mixed type (legacy behavior)
            if (microbitCompatible) {
                addMultipleChoiceQuestions(questions, sentences, keyTerms,
                        Math.min(sentences.size(), numberOfQuestions * 2/3));
                addTrueFalseQuestions(questions, sentences,
                        Math.min(sentences.size(), numberOfQuestions - questions.size()), text);
            } else {
                Map<String, String> definitions = textAnalysisService.extractDefinitions(text);
                addDefinitionQuestions(questions, definitions, Math.min(definitions.size(), numberOfQuestions / 3));
                addFactualQuestions(questions, sentences, keyTerms,
                        Math.min(sentences.size(), numberOfQuestions / 3));
                addTrueFalseQuestions(questions, sentences,
                        Math.min(sentences.size(), numberOfQuestions - questions.size()), text);
            }
        }

        Collections.shuffle(questions);

        if (questions.size() > numberOfQuestions) {
            questions = questions.subList(0, numberOfQuestions);
        }

        return questions;
    }

    // Legacy methods for backward compatibility
    @Override
    @Deprecated
    public Quiz generateQuizFromDocument(Long documentId, int numberOfQuestions, String quizTitle,
                                         Long collectionId, boolean microbitCompatible) throws IOException {
        // Use default values for new parameters
        return generateQuizFromDocument(documentId, numberOfQuestions, quizTitle,
                "MULTIPLE_CHOICE", 2, collectionId, microbitCompatible, false);
    }

    @Override
    @Deprecated
    public List<Question> generateQuestionsFromText(String text, int numberOfQuestions, boolean microbitCompatible) {
        // Use default values for new parameters
        return generateQuestionsFromText(text, numberOfQuestions, "MULTIPLE_CHOICE", 2, microbitCompatible, false);
    }

    // Language-aware True/False options
    private List<String> getTrueFalseOptions(String documentText) {
        String docLowerCase = documentText.toLowerCase();

        // Albanian detection
        if (docLowerCase.contains(" është ") || docLowerCase.contains(" janë ") ||
                docLowerCase.contains(" dhe ") || docLowerCase.contains(" në ") ||
                docLowerCase.contains(" për ") || docLowerCase.contains(" nga ") ||
                docLowerCase.contains(" që ") || docLowerCase.contains(" me ") ||
                docLowerCase.contains("shqip") || docLowerCase.contains("shqiptar")) {
            return Arrays.asList("E vërtetë", "E gabuar");
        }

        // Default to English
        return Arrays.asList("True", "False");
    }

    // Updated helper methods with language support
    private void addTrueFalseQuestions(List<Question> questions, List<String> sentences, int count, String documentText) {
        List<String> sentenceList = new ArrayList<>(sentences);
        Collections.shuffle(sentenceList);

        List<String> trueFalseOptions = getTrueFalseOptions(documentText);

        int added = 0;
        for (String sentence : sentenceList) {
            if (added >= count) break;
            if (sentence.length() < 30) continue;

            Question question = new Question();
            boolean isTrue = random.nextBoolean();

            String prefix = trueFalseOptions.get(0).equals("E vërtetë") ? "E vërtetë apo e gabuar: " : "True or False: ";

            if (isTrue) {
                question.setQuestionText(prefix + sentence);
            } else {
                String negatedSentence = negateSentence(sentence);
                question.setQuestionText(prefix + negatedSentence);
            }

            question.setQuestionType("TRUE_FALSE");
            question.setOptions(trueFalseOptions);
            question.setCorrectOptionIndex(isTrue ? 0 : 1);
            question.setExplanation("The statement is " + (isTrue ? "true" : "false") +
                    " according to the text: " + sentence);
            question.setDifficultyLevel(1);
            question.setSourceText(sentence);

            questions.add(question);
            added++;
        }
    }

    // All the existing helper methods remain the same...
    private String findKeyTermInSentence(String sentence, List<String> keyTerms) {
        for (String term : keyTerms) {
            if (sentence.toLowerCase().contains(term.toLowerCase())) {
                return term;
            }
        }
        return null;
    }

    private List<String> generateOptions(String correctAnswer, List<String> possibleDistractors, int optionCount) {
        List<String> options = new ArrayList<>();
        options.add(correctAnswer);

        List<String> distractors = new ArrayList<>(possibleDistractors);
        distractors.remove(correctAnswer);
        Collections.shuffle(distractors);

        for (int i = 0; i < (optionCount - 1) && i < distractors.size(); i++) {
            options.add(distractors.get(i));
        }

        while (options.size() < optionCount) {
            options.add("None of the above");
        }

        Collections.shuffle(options);
        return options;
    }

    private List<Question> processKeyTermSentences(List<String> sentences, List<String> keyTerms, int count, int minLength, BiFunction<String, String, Question> questionGenerator) {
        List<Question> result = new ArrayList<>();
        List<String> sentenceList = new ArrayList<>(sentences);
        Collections.shuffle(sentenceList);

        int added = 0;
        for (String sentence : sentenceList) {
            if (added >= count) break;
            if (sentence.length() < minLength) continue;

            String foundTerm = findKeyTermInSentence(sentence, keyTerms);
            if (foundTerm == null) continue;

            Question question = questionGenerator.apply(sentence, foundTerm);
            result.add(question);
            added++;
        }

        return result;
    }

    private void addMultipleChoiceQuestions(List<Question> questions, List<String> sentences,
                                            Map<String, Double> keyTerms, int count) {
        List<String> keyTermList = new ArrayList<>(keyTerms.keySet());

        List<Question> generatedQuestions = processKeyTermSentences(
                sentences, keyTermList, count, 40,
                (sentence, term) -> {
                    Question question = new Question();

                    if (sentence.toLowerCase().contains(term.toLowerCase())) {
                        String blankSentence = sentence.replaceAll("(?i)" + Pattern.quote(term), "________");
                        question.setQuestionText("Fill in the blank: " + blankSentence);
                    } else {
                        question.setQuestionText("Which term is most related to this statement: \"" + sentence + "\"?");
                    }

                    List<String> options = generateOptions(term, keyTermList, 4);

                    question.setQuestionType("MULTIPLE_CHOICE");
                    question.setOptions(options);
                    question.setCorrectOptionIndex(options.indexOf(term));
                    question.setExplanation("The correct answer is: " + term);
                    question.setDifficultyLevel(2);
                    question.setSourceText(sentence);

                    return question;
                }
        );

        questions.addAll(generatedQuestions);
    }

    private void addDefinitionQuestions(List<Question> questions, Map<String, String> definitions, int count) {
        List<String> termList = new ArrayList<>(definitions.keySet());
        Collections.shuffle(termList);

        int added = 0;
        for (String term : termList) {
            if (added >= count) break;

            String definition = definitions.get(term);

            Question question = new Question();
            question.setQuestionText("What is " + term + "?");
            question.setQuestionType("MULTIPLE_CHOICE");

            List<String> options = generateOptions(definition, new ArrayList<>(definitions.values()), 4);

            question.setOptions(options);
            question.setCorrectOptionIndex(options.indexOf(definition));
            question.setExplanation("The correct definition of " + term + " is: " + definition);
            question.setDifficultyLevel(2);
            question.setSourceText(term + " - " + definition);

            questions.add(question);
            added++;
        }
    }

    private void addFactualQuestions(List<Question> questions, List<String> sentences, Map<String, Double> keyTerms, int count) {
        List<String> keyTermList = new ArrayList<>(keyTerms.keySet());

        List<Question> generatedQuestions = processKeyTermSentences(
                sentences, keyTermList, count, 40,
                (sentence, term) -> {
                    String questionText = sentence.replaceAll("(?i)" + Pattern.quote(term), "________");

                    Question question = new Question();
                    question.setQuestionText("Complete the following: " + questionText);
                    question.setQuestionType("MULTIPLE_CHOICE");

                    List<String> options = generateOptions(term, keyTermList, 4);

                    question.setOptions(options);
                    question.setCorrectOptionIndex(options.indexOf(term));
                    question.setExplanation("The correct answer is: " + term);
                    question.setDifficultyLevel(3);
                    question.setSourceText(sentence);

                    return question;
                }
        );

        questions.addAll(generatedQuestions);
    }

    private String negateSentence(String sentence) {
        String[] negationPatterns = {
                "is", "was", "are", "were", "has", "have", "had",
                "can", "could", "will", "would", "should", "may", "might"
        };

        for (String pattern : negationPatterns) {
            if (sentence.contains(" " + pattern + " ")) {
                return sentence.replace(" " + pattern + " ", " " + pattern + " not ");
            }
        }

        int firstSpace = sentence.indexOf(" ");
        if (firstSpace > 0) {
            return sentence.substring(0, firstSpace + 1) + "not " +
                    sentence.substring(firstSpace + 1);
        }
        return "Not true: " + sentence;
    }
}