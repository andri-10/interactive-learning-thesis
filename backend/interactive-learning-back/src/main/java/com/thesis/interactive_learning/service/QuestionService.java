package com.thesis.interactive_learning.service;

import com.thesis.interactive_learning.model.Question;
import java.util.List;
import java.util.Optional;

public interface QuestionService {
    Question saveQuestion(Question question);
    Optional<Question> getQuestionById(Long id);
    List<Question> getAllQuestions();
    List<Question> getQuestionsByQuizId(Long quizId);
    void deleteQuestion(Long id);
}