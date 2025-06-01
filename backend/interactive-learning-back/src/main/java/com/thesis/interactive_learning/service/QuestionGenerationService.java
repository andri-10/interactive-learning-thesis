package com.thesis.interactive_learning.service;

import com.thesis.interactive_learning.model.Question;
import com.thesis.interactive_learning.model.Quiz;

import java.io.IOException;
import java.util.List;

public interface QuestionGenerationService {

    /**
     * Generates a quiz with AI-powered questions from a document
     * @param documentId The ID of the document to generate questions from
     * @param numberOfQuestions The number of questions to generate
     * @param quizTitle The title for the new quiz
     * @param questionType The type of questions ("MULTIPLE_CHOICE" or "TRUE_FALSE")
     * @param difficulty Difficulty level (1-3: Easy, Medium, Hard)
     * @param collectionId Optional collection ID to associate with the quiz
     * @param microbitCompatible Whether questions should be compatible with Micro:bit interaction
     * @param useAI Whether to use AI for question generation (fallback to basic generation if false)
     * @return The newly created quiz
     */
    Quiz generateQuizFromDocument(Long documentId, int numberOfQuestions, String quizTitle,
                                  String questionType, int difficulty, Long collectionId,
                                  boolean microbitCompatible, boolean useAI) throws IOException;

    /**
     * Creates AI-powered questions from text
     * @param text The input text
     * @param numberOfQuestions The number of questions to generate
     * @param questionType The type of questions ("MULTIPLE_CHOICE" or "TRUE_FALSE")
     * @param difficulty Difficulty level (1-3: Easy, Medium, Hard)
     * @param microbitCompatible Whether questions should be compatible with Micro:bit interaction
     * @param useAI Whether to use AI for question generation
     * @return List of generated questions
     */
    List<Question> generateQuestionsFromText(String text, int numberOfQuestions, String questionType,
                                             int difficulty, boolean microbitCompatible, boolean useAI);

    /**
     * Legacy method for backward compatibility - uses basic generation
     * @deprecated Use the new method with AI support instead
     */
    @Deprecated
    List<Question> generateQuestionsFromText(String text, int numberOfQuestions, boolean microbitCompatible);

    /**
     * Legacy method for backward compatibility - uses basic generation
     * @deprecated Use the new method with AI support instead
     */
    @Deprecated
    Quiz generateQuizFromDocument(Long documentId, int numberOfQuestions, String quizTitle,
                                  Long collectionId, boolean microbitCompatible) throws IOException;
}