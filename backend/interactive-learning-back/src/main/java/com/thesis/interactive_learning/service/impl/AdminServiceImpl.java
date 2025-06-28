package com.thesis.interactive_learning.service.impl;

import com.thesis.interactive_learning.model.*;
import com.thesis.interactive_learning.repository.*;
import com.thesis.interactive_learning.service.AdminService;
import com.thesis.interactive_learning.service.DocumentService;
import com.thesis.interactive_learning.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final QuizRepository quizRepository;
    private final StudyCollectionRepository studyCollectionRepository;
    private final UserProgressRepository userProgressRepository;
    private final DocumentService documentService;
    private final QuizService quizService;

    @Autowired
    public AdminServiceImpl(UserRepository userRepository,
                            DocumentRepository documentRepository,
                            QuizRepository quizRepository,
                            StudyCollectionRepository studyCollectionRepository,
                            UserProgressRepository userProgressRepository,
                            DocumentService documentService,
                            QuizService quizService) {
        this.userRepository = userRepository;
        this.documentRepository = documentRepository;
        this.quizRepository = quizRepository;
        this.studyCollectionRepository = studyCollectionRepository;
        this.userProgressRepository = userProgressRepository;
        this.documentService = documentService;
        this.quizService = quizService;
    }

    @Override
    public Map<String, Object> getAdminDashboard() {
        Map<String, Object> dashboard = new HashMap<>();

        // Basic counts
        long totalUsers = userRepository.count();
        long totalDocuments = documentRepository.count();
        long totalQuizzes = quizRepository.count();
        long totalCollections = studyCollectionRepository.count();
        long totalProgress = userProgressRepository.count();

        dashboard.put("totalUsers", totalUsers);
        dashboard.put("totalDocuments", totalDocuments);
        dashboard.put("totalQuizzes", totalQuizzes);
        dashboard.put("totalCollections", totalCollections);
        dashboard.put("totalQuizAttempts", totalProgress);

        // Recent activity (last 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        // New users in last 30 days (you'll need to add createdAt field to User)
        // For now, we'll use a placeholder
        dashboard.put("newUsersLast30Days", 0);

        // Quiz attempts in last 30 days
        long recentQuizAttempts = userProgressRepository.findAll().stream()
                .filter(progress -> progress.getCompletedAt().isAfter(thirtyDaysAgo))
                .count();
        dashboard.put("recentQuizAttempts", recentQuizAttempts);

        // Active users (users with quiz attempts in last 30 days)
        Set<Long> activeUserIds = userProgressRepository.findAll().stream()
                .filter(progress -> progress.getCompletedAt().isAfter(thirtyDaysAgo))
                .map(progress -> progress.getUser().getId())
                .collect(Collectors.toSet());
        dashboard.put("activeUsersLast30Days", activeUserIds.size());

        // Platform-wide average accuracy
        double avgAccuracy = userProgressRepository.findAll().stream()
                .filter(progress -> progress.getAccuracyPercentage() != null)
                .mapToDouble(UserProgress::getAccuracyPercentage)
                .average()
                .orElse(0.0);
        dashboard.put("platformAverageAccuracy", Math.round(avgAccuracy * 100.0) / 100.0);

        // Most active user
        Map<Long, Long> userActivityCount = userProgressRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        progress -> progress.getUser().getId(),
                        Collectors.counting()
                ));

        if (!userActivityCount.isEmpty()) {
            Long mostActiveUserId = userActivityCount.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse(null);

            if (mostActiveUserId != null) {
                User mostActiveUser = userRepository.findById(mostActiveUserId).orElse(null);
                if (mostActiveUser != null) {
                    Map<String, Object> mostActiveUserInfo = new HashMap<>();
                    mostActiveUserInfo.put("id", mostActiveUser.getId());
                    mostActiveUserInfo.put("username", mostActiveUser.getUsername());
                    mostActiveUserInfo.put("quizAttempts", userActivityCount.get(mostActiveUserId));
                    dashboard.put("mostActiveUser", mostActiveUserInfo);
                }
            }
        }

        return dashboard;
    }

    @Override
    public Map<String, Object> getAllUsersWithPagination(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<User> userPage = userRepository.findAll(pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("users", userPage.getContent().stream()
                .map(this::mapUserToAdminView)
                .collect(Collectors.toList()));
        response.put("totalElements", userPage.getTotalElements());
        response.put("totalPages", userPage.getTotalPages());
        response.put("currentPage", page);
        response.put("pageSize", size);

        return response;
    }

    @Override
    public Map<String, Object> getUserDetails(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> userDetails = mapUserToAdminView(user);

        // Additional details
        List<Document> userDocuments = documentRepository.findByUser(user);
        List<StudyCollection> userCollections = studyCollectionRepository.findByUser(user);
        List<UserProgress> userProgress = userProgressRepository.findByUserId(userId);

        userDetails.put("documentCount", userDocuments.size());
        userDetails.put("collectionCount", userCollections.size());
        userDetails.put("quizAttempts", userProgress.size());

        if (!userProgress.isEmpty()) {
            double avgAccuracy = userProgress.stream()
                    .filter(progress -> progress.getAccuracyPercentage() != null)
                    .mapToDouble(UserProgress::getAccuracyPercentage)
                    .average()
                    .orElse(0.0);
            userDetails.put("averageAccuracy", Math.round(avgAccuracy * 100.0) / 100.0);

            // Last activity
            UserProgress lastActivity = userProgress.stream()
                    .max(Comparator.comparing(UserProgress::getCompletedAt))
                    .orElse(null);
            if (lastActivity != null) {
                userDetails.put("lastActivity", lastActivity.getCompletedAt());
            }
        } else {
            userDetails.put("averageAccuracy", 0.0);
            userDetails.put("lastActivity", null);
        }

        // Recent documents
        userDetails.put("recentDocuments", userDocuments.stream()
                .sorted(Comparator.comparing(Document::getUploadDate).reversed())
                .limit(5)
                .map(doc -> Map.of(
                        "id", doc.getId(),
                        "title", doc.getTitle(),
                        "uploadDate", doc.getUploadDate(),
                        "fileSize", doc.getFileSize() != null ? doc.getFileSize() : 0
                ))
                .collect(Collectors.toList()));

        return userDetails;
    }

    @Override
    public Map<String, Object> updateUserStatus(Long userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // You'll need to add an 'enabled' field to User entity
        // For now, we'll return a placeholder response
        Map<String, Object> result = new HashMap<>();
        result.put("userId", userId);
        result.put("username", user.getUsername());
        result.put("enabled", enabled);
        result.put("message", "User status updated successfully");

        return result;
    }

    @Override
    public Map<String, Object> getContentOverview() {
        Map<String, Object> overview = new HashMap<>();

        // Document statistics
        List<Document> allDocuments = documentRepository.findAll();
        overview.put("totalDocuments", allDocuments.size());

        long totalFileSize = allDocuments.stream()
                .mapToLong(doc -> doc.getFileSize() != null ? doc.getFileSize() : 0)
                .sum();
        overview.put("totalFileSize", totalFileSize);
        overview.put("totalFileSizeMB", totalFileSize / (1024 * 1024));

        int totalPages = allDocuments.stream()
                .mapToInt(doc -> doc.getPageCount() != null ? doc.getPageCount() : 0)
                .sum();
        overview.put("totalPages", totalPages);

        // Quiz statistics
        List<Quiz> allQuizzes = quizRepository.findAll();
        overview.put("totalQuizzes", allQuizzes.size());

        long microbitCompatibleQuizzes = allQuizzes.stream()
                .filter(Quiz::isMicrobitCompatible)
                .count();
        overview.put("microbitCompatibleQuizzes", microbitCompatibleQuizzes);

        // Collection statistics
        overview.put("totalCollections", studyCollectionRepository.count());

        // Recent uploads (last 7 days)
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        long recentDocuments = allDocuments.stream()
                .filter(doc -> doc.getUploadDate().isAfter(weekAgo))
                .count();
        overview.put("recentDocuments", recentDocuments);

        return overview;
    }

    @Override
    public Map<String, Object> getPopularContent(int limit) {
        Map<String, Object> popular = new HashMap<>();

        // Most attempted quizzes
        Map<Quiz, Long> quizAttempts = userProgressRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        UserProgress::getQuiz,
                        Collectors.counting()
                ));

        List<Map<String, Object>> popularQuizzes = quizAttempts.entrySet().stream()
                .sorted(Map.Entry.<Quiz, Long>comparingByValue().reversed())
                .limit(limit)
                .map(entry -> {
                    Quiz quiz = entry.getKey();
                    Map<String, Object> quizInfo = new HashMap<>();
                    quizInfo.put("id", quiz.getId());
                    quizInfo.put("title", quiz.getTitle());
                    quizInfo.put("attempts", entry.getValue());
                    quizInfo.put("microbitCompatible", quiz.isMicrobitCompatible());
                    if (quiz.getDocument() != null) {
                        quizInfo.put("documentTitle", quiz.getDocument().getTitle());
                        quizInfo.put("documentOwner", quiz.getDocument().getUser().getUsername());
                    }
                    return quizInfo;
                })
                .collect(Collectors.toList());

        popular.put("popularQuizzes", popularQuizzes);

        // Most referenced documents (documents with most quizzes)
        Map<Document, Long> documentQuizCounts = quizRepository.findAll().stream()
                .filter(quiz -> quiz.getDocument() != null)
                .collect(Collectors.groupingBy(
                        Quiz::getDocument,
                        Collectors.counting()
                ));

        List<Map<String, Object>> popularDocuments = documentQuizCounts.entrySet().stream()
                .sorted(Map.Entry.<Document, Long>comparingByValue().reversed())
                .limit(limit)
                .map(entry -> {
                    Document doc = entry.getKey();
                    Map<String, Object> docInfo = new HashMap<>();
                    docInfo.put("id", doc.getId());
                    docInfo.put("title", doc.getTitle());
                    docInfo.put("quizCount", entry.getValue());
                    docInfo.put("owner", doc.getUser().getUsername());
                    docInfo.put("uploadDate", doc.getUploadDate());
                    docInfo.put("pageCount", doc.getPageCount());
                    return docInfo;
                })
                .collect(Collectors.toList());

        popular.put("popularDocuments", popularDocuments);

        return popular;
    }

    @Override
    public Map<String, Object> getPlatformAnalytics(int days) {
        Map<String, Object> analytics = new HashMap<>();
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);

        // Daily activity for the specified period
        Map<String, Long> dailyQuizAttempts = userProgressRepository.findAll().stream()
                .filter(progress -> progress.getCompletedAt().isAfter(startDate))
                .collect(Collectors.groupingBy(
                        progress -> progress.getCompletedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")),
                        Collectors.counting()
                ));

        analytics.put("dailyQuizAttempts", dailyQuizAttempts);
        analytics.put("period", days + " days");
        analytics.put("startDate", startDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));

        // User engagement levels
        Map<String, Long> engagementLevels = userProgressRepository.findAll().stream()
                .filter(progress -> progress.getCompletedAt().isAfter(startDate))
                .collect(Collectors.groupingBy(
                        progress -> progress.getUser().getId(),
                        Collectors.counting()
                )).values().stream()
                .collect(Collectors.groupingBy(
                        attempts -> {
                            if (attempts >= 10) return "high";
                            if (attempts >= 5) return "medium";
                            if (attempts >= 1) return "low";
                            return "none";
                        },
                        Collectors.counting()
                ));

        analytics.put("userEngagementLevels", engagementLevels);

        return analytics;
    }

    @Override
    public Map<String, Object> getUserAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        List<User> allUsers = userRepository.findAll();
        analytics.put("totalUsers", allUsers.size());

        // User role distribution
        Map<String, Long> roleDistribution = allUsers.stream()
                .collect(Collectors.groupingBy(
                        user -> user.getRole() != null ? user.getRole().toString() : "UNKNOWN",
                        Collectors.counting()
                ));
        analytics.put("roleDistribution", roleDistribution);

        // Users by activity level
        Map<Long, Long> userQuizCounts = userProgressRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        progress -> progress.getUser().getId(),
                        Collectors.counting()
                ));

        Map<String, Long> activityLevels = userQuizCounts.values().stream()
                .collect(Collectors.groupingBy(
                        count -> {
                            if (count >= 20) return "very_active";
                            if (count >= 10) return "active";
                            if (count >= 5) return "moderate";
                            if (count >= 1) return "low";
                            return "inactive";
                        },
                        Collectors.counting()
                ));

        long inactiveUsers = allUsers.size() - userQuizCounts.size();
        activityLevels.put("inactive", inactiveUsers);

        analytics.put("userActivityLevels", activityLevels);

        return analytics;
    }

    @Override
    public Map<String, Object> getMicrobitUsage(int days) {
        Map<String, Object> usage = new HashMap<>();
        usage.put("period", days + " days");
        usage.put("totalSessions", 0);
        usage.put("averageSessionDuration", 0);
        usage.put("microbitCompatibleQuizzes", quizRepository.findAll().stream()
                .filter(Quiz::isMicrobitCompatible)
                .count());
        usage.put("message", "Microbit usage tracking not yet implemented");

        return usage;
    }

    @Override
    public Map<String, Object> deleteDocument(Long documentId) {
        try {
            Document document = documentRepository.findById(documentId)
                    .orElseThrow(() -> new RuntimeException("Document not found"));

            String title = document.getTitle();
            String owner = document.getUser().getUsername();

            documentService.deleteDocument(documentId);

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Document '" + title + "' (owned by " + owner + ") deleted successfully");
            result.put("documentId", documentId);

            return result;
        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "Failed to delete document: " + e.getMessage());
            result.put("documentId", documentId);

            return result;
        }
    }

    @Override
    public Map<String, Object> deleteQuiz(Long quizId) {
        try {
            Quiz quiz = quizRepository.findById(quizId)
                    .orElseThrow(() -> new RuntimeException("Quiz not found"));

            String title = quiz.getTitle();
            String owner = quiz.getDocument() != null ? quiz.getDocument().getUser().getUsername() : "Unknown";

            quizService.deleteQuiz(quizId);

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Quiz '" + title + "' (owned by " + owner + ") deleted successfully");
            result.put("quizId", quizId);

            return result;
        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "Failed to delete quiz: " + e.getMessage());
            result.put("quizId", quizId);

            return result;
        }
    }

    @Override
    public Map<String, Object> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();

        Runtime runtime = Runtime.getRuntime();
        long maxMemory = runtime.maxMemory();
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long usedMemory = totalMemory - freeMemory;

        stats.put("memoryUsageMB", usedMemory / (1024 * 1024));
        stats.put("maxMemoryMB", maxMemory / (1024 * 1024));
        stats.put("memoryUsagePercentage", Math.round((double) usedMemory / maxMemory * 100));

        // Database statistics
        stats.put("totalRecords",
                userRepository.count() +
                        documentRepository.count() +
                        quizRepository.count() +
                        studyCollectionRepository.count() +
                        userProgressRepository.count());

        // File storage info
        long totalFileSize = documentRepository.findAll().stream()
                .mapToLong(doc -> doc.getFileSize() != null ? doc.getFileSize() : 0)
                .sum();
        stats.put("totalStorageUsedMB", totalFileSize / (1024 * 1024));

        return stats;
    }

    @Override
    public Map<String, Object> getRecentSystemLogs(int limit) {
        Map<String, Object> logs = new HashMap<>();
        logs.put("message", "System logging not yet implemented");
        logs.put("limit", limit);
        logs.put("logs", new ArrayList<>());

        return logs;
    }

    private Map<String, Object> mapUserToAdminView(User user) {
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("username", user.getUsername());
        userMap.put("email", user.getEmail());
        userMap.put("role", user.getRole() != null ? user.getRole().toString() : "USER");

        userMap.put("documentCount", documentRepository.findByUser(user).size());
        userMap.put("collectionCount", studyCollectionRepository.findByUser(user).size());
        userMap.put("quizAttempts", userProgressRepository.findByUserId(user.getId()).size());

        return userMap;
    }
}