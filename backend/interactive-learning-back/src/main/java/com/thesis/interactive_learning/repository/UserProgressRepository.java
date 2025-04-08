package com.thesis.interactive_learning.repository;

import com.thesis.interactive_learning.model.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {
    List<UserProgress> findByUserId(Long userId);
    List<UserProgress> findByQuizId(Long quizId);
    List<UserProgress> findByUserIdAndQuizId(Long userId, Long quizId);
}