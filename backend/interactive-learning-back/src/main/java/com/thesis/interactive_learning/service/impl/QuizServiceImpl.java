package com.thesis.interactive_learning.service.impl;

import com.thesis.interactive_learning.model.Quiz;
import com.thesis.interactive_learning.repository.QuizRepository;
import com.thesis.interactive_learning.repository.UserProgressRepository;
import com.thesis.interactive_learning.service.QuizService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class QuizServiceImpl implements QuizService {

    private final QuizRepository quizRepository;
    private final UserProgressRepository userProgressRepository;

    @Autowired
    public QuizServiceImpl(QuizRepository quizRepository, UserProgressRepository userProgressRepository) {
        this.quizRepository = quizRepository;
        this.userProgressRepository = userProgressRepository;
    }

    @Override
    public Quiz saveQuiz(Quiz quiz) {
        return quizRepository.save(quiz);
    }

    @Override
    public Optional<Quiz> getQuizById(Long id) {
        return quizRepository.findById(id);
    }

    @Override
    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    @Override
    public List<Quiz> getQuizzesByCollectionId(Long collectionId) {
        return quizRepository.findByStudyCollectionId(collectionId);
    }

    @Override
    public List<Quiz> getQuizzesByDocumentId(Long documentId) {
        return quizRepository.findByDocumentId(documentId);
    }

    @Transactional
    @Override
    public void deleteQuiz(Long id) {
        userProgressRepository.deleteByQuizId(id);
        quizRepository.deleteById(id);
    }
}