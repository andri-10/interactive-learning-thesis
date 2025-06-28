package com.thesis.interactive_learning.service.impl;

import com.thesis.interactive_learning.model.UserProgress;
import com.thesis.interactive_learning.repository.UserProgressRepository;
import com.thesis.interactive_learning.repository.UserRepository;
import com.thesis.interactive_learning.repository.QuizRepository;
import com.thesis.interactive_learning.service.UserProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserProgressServiceImpl implements UserProgressService {

    private final UserProgressRepository userProgressRepository;
    private final UserRepository userRepository;
    private final QuizRepository quizRepository;

    @Autowired
    public UserProgressServiceImpl(UserProgressRepository userProgressRepository,
                                   UserRepository userRepository,
                                   QuizRepository quizRepository) {
        this.userProgressRepository = userProgressRepository;
        this.userRepository = userRepository;
        this.quizRepository = quizRepository;
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

    @Override
    public Map<String, Object> getUserDashboard(Long userId) {
        // Validate user exists
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> dashboard = new HashMap<>();

        // Get all user progress
        List<UserProgress> allProgress = userProgressRepository.findByUserId(userId);

        // Basic statistics
        dashboard.put("userId", userId);
        dashboard.put("username", user.getUsername());
        dashboard.put("totalQuizzesTaken", allProgress.size());

        // Performance metrics
        if (!allProgress.isEmpty()) {
            // Average accuracy
            double avgAccuracy = allProgress.stream()
                    .mapToDouble(p -> p.getAccuracyPercentage() != null ? p.getAccuracyPercentage() : 0.0)
                    .average()
                    .orElse(0.0);

            // Best accuracy
            double bestAccuracy = allProgress.stream()
                    .mapToDouble(p -> p.getAccuracyPercentage() != null ? p.getAccuracyPercentage() : 0.0)
                    .max()
                    .orElse(0.0);

            // Total questions answered
            int totalQuestions = allProgress.stream()
                    .mapToInt(p -> p.getTotalQuestions() != null ? p.getTotalQuestions() : 0)
                    .sum();

            // Total correct answers
            int totalCorrect = allProgress.stream()
                    .mapToInt(p -> p.getCorrectAnswers() != null ? p.getCorrectAnswers() : 0)
                    .sum();

            // Average completion time
            long avgCompletionTime = allProgress.stream()
                    .filter(p -> p.getCompletionTimeSeconds() != null && p.getCompletionTimeSeconds() > 0)
                    .mapToLong(UserProgress::getCompletionTimeSeconds)
                    .average()
                    .stream()
                    .mapToLong(d -> (long) d)
                    .findFirst()
                    .orElse(0L);

            dashboard.put("averageAccuracy", Math.round(avgAccuracy * 100.0) / 100.0);
            dashboard.put("bestAccuracy", Math.round(bestAccuracy * 100.0) / 100.0);
            dashboard.put("totalQuestionsAnswered", totalQuestions);
            dashboard.put("totalCorrectAnswers", totalCorrect);
            dashboard.put("averageCompletionTime", avgCompletionTime);

            // Performance categories
            long excellentScores = allProgress.stream()
                    .filter(p -> p.getAccuracyPercentage() != null && p.getAccuracyPercentage() >= 90)
                    .count();
            long goodScores = allProgress.stream()
                    .filter(p -> p.getAccuracyPercentage() != null && p.getAccuracyPercentage() >= 70 && p.getAccuracyPercentage() < 90)
                    .count();
            long averageScores = allProgress.stream()
                    .filter(p -> p.getAccuracyPercentage() != null && p.getAccuracyPercentage() >= 50 && p.getAccuracyPercentage() < 70)
                    .count();
            long belowAverageScores = allProgress.stream()
                    .filter(p -> p.getAccuracyPercentage() != null && p.getAccuracyPercentage() < 50)
                    .count();

            Map<String, Long> performanceBreakdown = new HashMap<>();
            performanceBreakdown.put("excellent", excellentScores);
            performanceBreakdown.put("good", goodScores);
            performanceBreakdown.put("average", averageScores);
            performanceBreakdown.put("needsImprovement", belowAverageScores);
            dashboard.put("performanceBreakdown", performanceBreakdown);

        } else {
            dashboard.put("averageAccuracy", 0.0);
            dashboard.put("bestAccuracy", 0.0);
            dashboard.put("totalQuestionsAnswered", 0);
            dashboard.put("totalCorrectAnswers", 0);
            dashboard.put("averageCompletionTime", 0L);
            dashboard.put("performanceBreakdown", Map.of(
                    "excellent", 0L, "good", 0L, "average", 0L, "needsImprovement", 0L));
        }

        // Recent activity (last 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<UserProgress> recentProgress = allProgress.stream()
                .filter(p -> p.getCompletedAt().isAfter(thirtyDaysAgo))
                .collect(Collectors.toList());

        dashboard.put("recentActivity", recentProgress.size());
        dashboard.put("recentQuizzes", recentProgress.size());

        // Activity by day (last 7 days for chart data)
        Map<String, Long> weeklyActivity = allProgress.stream()
                .filter(p -> p.getCompletedAt().isAfter(LocalDateTime.now().minusDays(7)))
                .collect(Collectors.groupingBy(
                        p -> p.getCompletedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")),
                        Collectors.counting()
                ));
        dashboard.put("weeklyActivity", weeklyActivity);

        // Quiz completion status
        Set<Long> uniqueQuizzes = allProgress.stream()
                .map(p -> p.getQuiz().getId())
                .collect(Collectors.toSet());
        dashboard.put("uniqueQuizzesCompleted", uniqueQuizzes.size());

        // Get user's available quizzes count
        var userQuizzes = quizRepository.findByDocumentUserId(userId);
        dashboard.put("totalAvailableQuizzes", userQuizzes.size());

        return dashboard;
    }

    @Override
    public Map<String, Object> getUserStats(Long userId) {
        // Validate user exists
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> stats = new HashMap<>();
        List<UserProgress> allProgress = userProgressRepository.findByUserId(userId);

        stats.put("userId", userId);
        stats.put("username", user.getUsername());

        if (allProgress.isEmpty()) {
            stats.put("hasData", false);
            stats.put("message", "No quiz attempts yet");
            return stats;
        }

        stats.put("hasData", true);

        // Detailed statistics
        stats.put("totalAttempts", allProgress.size());

        // Accuracy statistics
        List<Double> accuracies = allProgress.stream()
                .map(p -> p.getAccuracyPercentage() != null ? p.getAccuracyPercentage() : 0.0)
                .collect(Collectors.toList());

        double avgAccuracy = accuracies.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        double minAccuracy = accuracies.stream().mapToDouble(Double::doubleValue).min().orElse(0.0);
        double maxAccuracy = accuracies.stream().mapToDouble(Double::doubleValue).max().orElse(0.0);

        stats.put("averageAccuracy", Math.round(avgAccuracy * 100.0) / 100.0);
        stats.put("minimumAccuracy", Math.round(minAccuracy * 100.0) / 100.0);
        stats.put("maximumAccuracy", Math.round(maxAccuracy * 100.0) / 100.0);

        // Time statistics
        List<Long> completionTimes = allProgress.stream()
                .filter(p -> p.getCompletionTimeSeconds() != null && p.getCompletionTimeSeconds() > 0)
                .map(UserProgress::getCompletionTimeSeconds)
                .collect(Collectors.toList());

        if (!completionTimes.isEmpty()) {
            double avgTime = completionTimes.stream().mapToLong(Long::longValue).average().orElse(0.0);
            long minTime = completionTimes.stream().mapToLong(Long::longValue).min().orElse(0L);
            long maxTime = completionTimes.stream().mapToLong(Long::longValue).max().orElse(0L);

            stats.put("averageCompletionTime", Math.round(avgTime));
            stats.put("fastestCompletionTime", minTime);
            stats.put("slowestCompletionTime", maxTime);
        } else {
            stats.put("averageCompletionTime", 0L);
            stats.put("fastestCompletionTime", 0L);
            stats.put("slowestCompletionTime", 0L);
        }

        // Quiz performance by quiz
        Map<String, Object> quizPerformance = allProgress.stream()
                .collect(Collectors.groupingBy(
                        p -> p.getQuiz().getTitle(),
                        Collectors.collectingAndThen(
                                Collectors.toList(),
                                list -> {
                                    Map<String, Object> quizStats = new HashMap<>();
                                    quizStats.put("attempts", list.size());
                                    quizStats.put("bestScore", list.stream()
                                            .mapToDouble(p -> p.getAccuracyPercentage() != null ? p.getAccuracyPercentage() : 0.0)
                                            .max().orElse(0.0));
                                    quizStats.put("averageScore", list.stream()
                                            .mapToDouble(p -> p.getAccuracyPercentage() != null ? p.getAccuracyPercentage() : 0.0)
                                            .average().orElse(0.0));
                                    return quizStats;
                                }
                        )
                ));
        stats.put("quizPerformance", quizPerformance);

        // Monthly progress (last 6 months)
        Map<String, Object> monthlyProgress = new HashMap<>();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthStart = LocalDateTime.now().minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime monthEnd = monthStart.plusMonths(1).minusSeconds(1);

            List<UserProgress> monthProgress = allProgress.stream()
                    .filter(p -> p.getCompletedAt().isAfter(monthStart) && p.getCompletedAt().isBefore(monthEnd))
                    .collect(Collectors.toList());

            String monthKey = monthStart.format(DateTimeFormatter.ofPattern("yyyy-MM"));
            Map<String, Object> monthStats = new HashMap<>();
            monthStats.put("attempts", monthProgress.size());

            if (!monthProgress.isEmpty()) {
                double monthAvgAccuracy = monthProgress.stream()
                        .mapToDouble(p -> p.getAccuracyPercentage() != null ? p.getAccuracyPercentage() : 0.0)
                        .average().orElse(0.0);
                monthStats.put("averageAccuracy", Math.round(monthAvgAccuracy * 100.0) / 100.0);
            } else {
                monthStats.put("averageAccuracy", 0.0);
            }

            monthlyProgress.put(monthKey, monthStats);
        }
        stats.put("monthlyProgress", monthlyProgress);

        return stats;
    }

    @Override
    public List<UserProgress> getRecentProgressByUserId(Long userId, int limit) {
        // Validate user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return userProgressRepository.findByUserIdOrderByCompletedAtDesc(userId)
                .stream()
                .limit(limit)
                .collect(Collectors.toList());
    }
}