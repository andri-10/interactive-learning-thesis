package com.thesis.interactive_learning.service;

import com.thesis.interactive_learning.model.Question;
import java.util.List;

public interface AIQuizService {

    /**
     * Generate intelligent quiz questions using AI
     * @param documentText The text content from the PDF
     * @param numberOfQuestions Number of questions to generate
     * @param questionType Either "MULTIPLE_CHOICE" or "TRUE_FALSE"
     * @param difficulty Difficulty level (1-3: Easy, Medium, Hard)
     * @param microbitCompatible Whether questions should be Micro:bit compatible
     * @return List of AI-generated questions
     */
    List<Question> generateAIQuestions(String documentText, int numberOfQuestions,
                                       String questionType, int difficulty, boolean microbitCompatible);

    /**
     * Generate questions for a specific topic within the document
     * @param documentText The full document text
     * @param topic Specific topic to focus on
     * @param numberOfQuestions Number of questions to generate
     * @param questionType Either "MULTIPLE_CHOICE" or "TRUE_FALSE"
     * @param difficulty Difficulty level
     * @param microbitCompatible Whether questions should be Micro:bit compatible
     * @return List of topic-focused questions
     */
    List<Question> generateTopicQuestions(String documentText, String topic,
                                          int numberOfQuestions, String questionType,
                                          int difficulty, boolean microbitCompatible);

    /**
     * Validate and improve existing questions using AI
     * @param questions List of questions to improve
     * @param documentText Original document text for context
     * @return List of improved questions
     */
    List<Question> improveQuestions(List<Question> questions, String documentText);
}