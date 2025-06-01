package com.thesis.interactive_learning.service;

import com.thesis.interactive_learning.model.Question;
import com.thesis.interactive_learning.model.Quiz;

import java.io.IOException;
import java.util.List;

public interface QuestionGenerationService {

    /**
     * Generates a quiz with questions from a document
     * @param documentId The ID of the document to generate questions from
     * @param numberOfQuestions The number of questions to generate
     * @param quizTitle The title for the new quiz
     * @param collectionId Optional collection ID to associate with the quiz
     * @param microbitCompatible Whether questions should be compatible with Micro:bit interaction
     * @return The newly created quiz
     */
    Quiz generateQuizFromDocument(Long documentId, int numberOfQuestions, String quizTitle,
                                  Long collectionId, boolean microbitCompatible) throws IOException;

    /**
     * Creates questions from text
     * @param text The input text
     * @param numberOfQuestions The number of questions to generate
     * @param microbitCompatible Whether questions should be compatible with Micro:bit interaction
     * @return List of generated questions
     */
    List<Question> generateQuestionsFromText(String text, int numberOfQuestions, boolean microbitCompatible);
}