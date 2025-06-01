package com.thesis.interactive_learning.service.impl;

import com.thesis.interactive_learning.model.*;
import com.thesis.interactive_learning.repository.DocumentRepository;
import com.thesis.interactive_learning.repository.QuestionRepository;
import com.thesis.interactive_learning.repository.QuizRepository;
import com.thesis.interactive_learning.repository.StudyCollectionRepository;
import com.thesis.interactive_learning.service.DocumentService;
import com.thesis.interactive_learning.service.QuestionGenerationService;
import com.thesis.interactive_learning.service.TextAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;
import java.util.function.BiFunction;

@Service
public class QuestionGenerationServiceImpl implements QuestionGenerationService {

    private final DocumentService documentService;
    private final TextAnalysisService textAnalysisService;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final DocumentRepository documentRepository;
    private final StudyCollectionRepository studyCollectionRepository;

    private final Random random = new Random();

    @Autowired
    public QuestionGenerationServiceImpl(DocumentService documentService,
                                         TextAnalysisService textAnalysisService,
                                         QuizRepository quizRepository,
                                         QuestionRepository questionRepository,
                                         DocumentRepository documentRepository,
                                         StudyCollectionRepository studyCollectionRepository) {
        this.documentService = documentService;
        this.textAnalysisService = textAnalysisService;
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.documentRepository = documentRepository;
        this.studyCollectionRepository = studyCollectionRepository;
    }

    @Override
    public Quiz generateQuizFromDocument(Long documentId, int numberOfQuestions, String quizTitle, Long collectionId, boolean microbitCompatible) throws IOException {

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        StudyCollection collection = null;
        if (collectionId != null) {
            collection = studyCollectionRepository.findById(collectionId)
                    .orElseThrow(() -> new RuntimeException("Collection not found"));
        }

        Map<String, Object> structuredText = documentService.extractStructuredTextFromPdf(documentId);
        String fullText = (String) structuredText.get("fullText");

        List<Question> questions = generateQuestionsFromText(fullText, numberOfQuestions, microbitCompatible);

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

        return savedQuiz;
    }

    @Override
    public List<Question> generateQuestionsFromText(String text, int numberOfQuestions, boolean microbitCompatible) {
        List<Question> questions = new ArrayList<>();

        List<String> sentences = textAnalysisService.extractSentences(text);
        Map<String, Double> keyTerms = textAnalysisService.extractKeyTerms(text, 30);
        Map<String, String> definitions = textAnalysisService.extractDefinitions(text);

        if (microbitCompatible) {
            // For Micro:bit compatible quizzes, focus on multiple choice with 4 options
            // and true/false questions
            addMultipleChoiceQuestions(questions, sentences, keyTerms,
                    Math.min(sentences.size(), numberOfQuestions * 2/3));

            // Add true/false questions
            addTrueFalseQuestions(questions, sentences,
                    Math.min(sentences.size(), numberOfQuestions - questions.size()));
        } else {
            // For regular quizzes, use a mix of all question types
            addDefinitionQuestions(questions, definitions, Math.min(definitions.size(), numberOfQuestions / 3));
            addFactualQuestions(questions, sentences, keyTerms,
                    Math.min(sentences.size(), numberOfQuestions / 3));
            addTrueFalseQuestions(questions, sentences,
                    Math.min(sentences.size(), numberOfQuestions - questions.size()));
        }

        Collections.shuffle(questions);

        if (questions.size() > numberOfQuestions) {
            questions = questions.subList(0, numberOfQuestions);
        }

        return questions;
    }

    // Helper method to find a key term in a sentence
    private String findKeyTermInSentence(String sentence, List<String> keyTerms) {
        for (String term : keyTerms) {
            if (sentence.toLowerCase().contains(term.toLowerCase())) {
                return term;
            }
        }
        return null;
    }

    // Helper method to generate options for multiple choice questions
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

    // Process sentences and create questions using the provided question generator function
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

                    // Create question text
                    if (sentence.toLowerCase().contains(term.toLowerCase())) {
                        String blankSentence = sentence.replaceAll("(?i)" + Pattern.quote(term), "________");
                        question.setQuestionText("Fill in the blank: " + blankSentence);
                    } else {
                        question.setQuestionText("Which term is most related to this statement: \"" + sentence + "\"?");
                    }

                    // Generate options
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

    private void addTrueFalseQuestions(List<Question> questions, List<String> sentences, int count) {
        List<String> sentenceList = new ArrayList<>(sentences);
        Collections.shuffle(sentenceList);

        int added = 0;
        for (String sentence : sentenceList) {
            if (added >= count) break;

            if (sentence.length() < 30) continue;

            Question question = new Question();

            boolean isTrue = random.nextBoolean();

            if (isTrue) {
                question.setQuestionText("True or False: " + sentence);
            } else {
                String negatedSentence = negateSentence(sentence);
                question.setQuestionText("True or False: " + negatedSentence);
            }

            question.setQuestionType("TRUE_FALSE");

            List<String> options = Arrays.asList("True", "False");

            question.setOptions(options);
            question.setCorrectOptionIndex(isTrue ? 0 : 1);
            question.setExplanation("The statement is " + (isTrue ? "true" : "false") +
                    " according to the text: " + sentence);
            question.setDifficultyLevel(1);
            question.setSourceText(sentence);

            questions.add(question);
            added++;
        }
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

    private void addFactualQuestions(List<Question> questions, List<String> sentences,Map<String, Double> keyTerms, int count) {

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

    // Simple method to negate a sentence
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
        // If no pattern matches, add "not" after the first space
        int firstSpace = sentence.indexOf(" ");
        if (firstSpace > 0) {
            return sentence.substring(0, firstSpace + 1) + "not " +
                    sentence.substring(firstSpace + 1);
        }
        return "Not true: " + sentence;
    }
}