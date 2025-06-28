package com.thesis.interactive_learning.repository;

import com.thesis.interactive_learning.model.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {

    List<UserProgress> findByUserId(Long userId);

    List<UserProgress> findByQuizId(Long quizId);

    List<UserProgress> findByUserIdAndQuizId(Long userId, Long quizId);

    @Query("SELECT up FROM UserProgress up WHERE up.user.id = :userId ORDER BY up.completedAt DESC")
    List<UserProgress> findByUserIdOrderByCompletedAtDesc(@Param("userId") Long userId);

    @Query("SELECT COUNT(up) FROM UserProgress up WHERE up.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);

    @Query("SELECT AVG(up.accuracyPercentage) FROM UserProgress up WHERE up.user.id = :userId")
    Double getAverageAccuracyByUserId(@Param("userId") Long userId);

    @Query("SELECT MAX(up.accuracyPercentage) FROM UserProgress up WHERE up.user.id = :userId")
    Double getMaxAccuracyByUserId(@Param("userId") Long userId);

    @Query("SELECT up FROM UserProgress up WHERE up.user.id = :userId AND up.completedAt >= :startDate")
    List<UserProgress> findByUserIdAndCompletedAtAfter(@Param("userId") Long userId, @Param("startDate") java.time.LocalDateTime startDate);

    void deleteByQuizId(Long id);
}