package com.thesis.interactive_learning.service.impl;

import com.thesis.interactive_learning.model.UserProgress;
import com.thesis.interactive_learning.repository.UserProgressRepository;
import com.thesis.interactive_learning.service.UserProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserProgressServiceImpl implements UserProgressService {

    private final UserProgressRepository userProgressRepository;

    @Autowired
    public UserProgressServiceImpl(UserProgressRepository userProgressRepository) {
        this.userProgressRepository = userProgressRepository;
    }

    @Override
    public UserProgress saveUserProgress(UserProgress userProgress) {
        if (userProgress.getTotalQuestions() > 0) {
            double accuracy = (double) userProgress.getCorrectAnswers() / userProgress.getTotalQuestions() * 100;
            userProgress.setAccuracyPercentage(accuracy);
        }
        return userProgressRepository.save(userProgress);
    }

    @Override
    public Optional<UserProgress> getUserProgressById(Long id) {
        return userProgressRepository.findById(id);
    }

    @Override
    public List<UserProgress> getAllUserProgress() {
        return userProgressRepository.findAll();
    }

    @Override
    public List<UserProgress> getUserProgressByUserId(Long userId) {
        return userProgressRepository.findByUserId(userId);
    }

    @Override
    public List<UserProgress> getUserProgressByQuizId(Long quizId) {
        return userProgressRepository.findByQuizId(quizId);
    }

    @Override
    public List<UserProgress> getUserProgressByUserIdAndQuizId(Long userId, Long quizId) {
        return userProgressRepository.findByUserIdAndQuizId(userId, quizId);
    }

    @Override
    public void deleteUserProgress(Long id) {
        userProgressRepository.deleteById(id);
    }
}