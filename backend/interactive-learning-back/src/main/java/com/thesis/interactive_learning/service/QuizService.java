package com.thesis.interactive_learning.service;

import com.thesis.interactive_learning.model.Quiz;
import java.util.List;
import java.util.Optional;

public interface QuizService {
    Quiz saveQuiz(Quiz quiz);
    Optional<Quiz> getQuizById(Long id);
    List<Quiz> getAllQuizzes();
    List<Quiz> getQuizzesByCollectionId(Long collectionId);
    List<Quiz> getQuizzesByDocumentId(Long documentId);
    void deleteQuiz(Long id);

}