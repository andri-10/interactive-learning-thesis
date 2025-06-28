package com.thesis.interactive_learning.service;

import com.thesis.interactive_learning.model.Quiz;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface QuizService {
    Quiz saveQuiz(Quiz quiz);
    Optional<Quiz> getQuizById(Long id);
    List<Quiz> getAllQuizzes();
    List<Quiz> getQuizzesByCollectionId(Long collectionId);
    List<Quiz> getQuizzesByDocumentId(Long documentId);
    void deleteQuiz(Long id);

    List<Quiz> getQuizzesByUserId(Long userId);
    List<Quiz> getQuizzesByCollectionIdAndUserId(Long collectionId, Long userId);
    List<Quiz> getQuizzesByDocumentIdAndUserId(Long documentId, Long userId);
    List<Quiz> getMicrobitCompatibleQuizzesByUserId(Long userId);

    Map<String, Object> getQuizStats(Long quizId);
}