package com.thesis.interactive_learning.service;

import com.thesis.interactive_learning.model.UserProgress;
import java.util.List;
import java.util.Optional;

public interface UserProgressService {
    UserProgress saveUserProgress(UserProgress userProgress);
    Optional<UserProgress> getUserProgressById(Long id);
    List<UserProgress> getAllUserProgress();
    List<UserProgress> getUserProgressByUserId(Long userId);
    List<UserProgress> getUserProgressByQuizId(Long quizId);
    List<UserProgress> getUserProgressByUserIdAndQuizId(Long userId, Long quizId);
    void deleteUserProgress(Long id);
}