package com.thesis.interactive_learning.service.impl;

import com.thesis.interactive_learning.model.*;
import com.thesis.interactive_learning.repository.*;
import com.thesis.interactive_learning.security.UserContext;
import com.thesis.interactive_learning.service.AdminService;
import com.thesis.interactive_learning.service.AuditLogService;
import com.thesis.interactive_learning.service.DocumentService;
import com.thesis.interactive_learning.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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
    private final AuditLogService auditLogService;
    private final UserContext userContext;

    @Autowired
    public AdminServiceImpl(UserRepository userRepository,
                            DocumentRepository documentRepository,
                            QuizRepository quizRepository,
                            StudyCollectionRepository studyCollectionRepository,
                            UserProgressRepository userProgressRepository,
                            DocumentService documentService,
                            QuizService quizService,
                            AuditLogService auditLogService,
                            UserContext userContext) {
        this.userRepository = userRepository;
        this.documentRepository = documentRepository;
        this.quizRepository = quizRepository;
        this.studyCollectionRepository = studyCollectionRepository;
        this.userProgressRepository = userProgressRepository;
        this.documentService = documentService;
        this.quizService = quizService;
        this.auditLogService = auditLogService;
        this.userContext = userContext;
    }

    @Override
    public Map<String, Object> getAdminDashboard() {
        Map<String, Object> dashboard = new HashMap<>();

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

        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        long recentQuizAttempts = userProgressRepository.findAll().stream()
                .filter(progress -> progress.getCompletedAt().isAfter(thirtyDaysAgo))
                .count();
        dashboard.put("recentQuizAttempts", recentQuizAttempts);

        Set<Long> activeUserIds = userProgressRepository.findAll().stream()
                .filter(progress -> progress.getCompletedAt().isAfter(thirtyDaysAgo))
                .map(progress -> progress.getUser().getId())
                .collect(Collectors.toSet());
        dashboard.put("activeUsersLast30Days", activeUserIds.size());

        double avgAccuracy = userProgressRepository.findAll().stream()
                .filter(progress -> progress.getAccuracyPercentage() != null)
                .mapToDouble(UserProgress::getAccuracyPercentage)
                .average()
                .orElse(0.0);
        dashboard.put("platformAverageAccuracy", Math.round(avgAccuracy * 100.0) / 100.0);

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

        List<Document> userDocuments = documentRepository.findByUser(user);
        List<StudyCollection> userCollections = studyCollectionRepository.findByUser(user);
        List<UserProgress> userProgress = userProgressRepository.findByUserId(userId);

        userDetails.put("documentCount", userDocuments.size());
        userDetails.put("collectionCount", userCollections.size());
        userDetails.put("quizAttempts", userProgress.size());

        // Add status information
        userDetails.put("status", user.getStatus().toString());
        userDetails.put("lastStatusChange", user.getLastStatusChange());
        userDetails.put("statusChangeReason", user.getStatusChangeReason());
        userDetails.put("lastLoginAt", user.getLastLoginAt());
        userDetails.put("failedLoginAttempts", user.getFailedLoginAttempts());
        userDetails.put("isAccountLocked", user.isAccountLocked());
        userDetails.put("accountLockedUntil", user.getAccountLockedUntil());

        if (!userProgress.isEmpty()) {
            double avgAccuracy = userProgress.stream()
                    .filter(progress -> progress.getAccuracyPercentage() != null)
                    .mapToDouble(UserProgress::getAccuracyPercentage)
                    .average()
                    .orElse(0.0);
            userDetails.put("averageAccuracy", Math.round(avgAccuracy * 100.0) / 100.0);

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
    public Map<String, Object> updateUserStatus(Long userId, boolean enabled, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String oldStatus = user.getStatus().toString();
        User.UserStatus newStatus = enabled ? User.UserStatus.ENABLED : User.UserStatus.DISABLED;

        if (user.getStatus() == newStatus) {
            Map<String, Object> result = new HashMap<>();
            result.put("userId", userId);
            result.put("username", user.getUsername());
            result.put("status", newStatus.toString());
            result.put("message", "User status unchanged");
            return result;
        }

        // Get current admin user
        Long adminUserId = userContext.getCurrentUserId();
        String adminUsername = userContext.getCurrentUsername();

        user.updateStatus(newStatus, adminUserId, reason);
        userRepository.save(user);

        auditLogService.log(
                AuditLog.LogLevel.INFO,
                AuditLog.LogAction.USER_STATUS_CHANGED,
                String.format("User '%s' status changed from %s to %s by admin '%s' - Reason: %s",
                        user.getUsername(), oldStatus, newStatus.toString(), adminUsername, reason),
                "User",
                userId
        );

        Map<String, Object> result = new HashMap<>();
        result.put("userId", userId);
        result.put("username", user.getUsername());
        result.put("status", newStatus.toString());
        result.put("previousStatus", oldStatus);
        result.put("changedBy", adminUsername);
        result.put("changedAt", user.getLastStatusChange());
        result.put("reason", reason);
        result.put("message", "User status updated successfully");

        return result;
    }

    @Override
    public Map<String, Object> deleteDocument(Long documentId) {
        try {
            Document document = documentRepository.findById(documentId)
                    .orElseThrow(() -> new RuntimeException("Document not found"));

            String title = document.getTitle();
            String owner = document.getUser().getUsername();

            documentService.deleteDocument(documentId);

            auditLogService.log(
                    AuditLog.LogLevel.INFO,
                    AuditLog.LogAction.CONTENT_MODERATION,
                    String.format("Admin deleted document '%s' owned by '%s'", title, owner),
                    "Document",
                    documentId
            );

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Document '" + title + "' (owned by " + owner + ") deleted successfully");
            result.put("documentId", documentId);

            return result;
        } catch (Exception e) {
            auditLogService.logError("Admin failed to delete document ID " + documentId + ": " + e.getMessage());

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

            auditLogService.log(
                    AuditLog.LogLevel.INFO,
                    AuditLog.LogAction.CONTENT_MODERATION,
                    String.format("Admin deleted quiz '%s' owned by '%s'", title, owner),
                    "Quiz",
                    quizId
            );

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Quiz '" + title + "' (owned by " + owner + ") deleted successfully");
            result.put("quizId", quizId);

            return result;
        } catch (Exception e) {
            auditLogService.logError("Admin failed to delete quiz ID " + quizId + ": " + e.getMessage());

            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "Failed to delete quiz: " + e.getMessage());
            result.put("quizId", quizId);

            return result;
        }
    }

    private Map<String, Object> mapUserToAdminView(User user) {
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("username", user.getUsername());
        userMap.put("email", user.getEmail());
        userMap.put("role", user.getRole() != null ? user.getRole().toString() : "USER");
        userMap.put("status", user.getStatus().toString());
        userMap.put("createdAt", user.getCreatedAt());
        userMap.put("lastLoginAt", user.getLastLoginAt());
        userMap.put("isEnabled", user.isEnabled());
        userMap.put("isAccountLocked", user.isAccountLocked());
        userMap.put("failedLoginAttempts", user.getFailedLoginAttempts());

        userMap.put("documentCount", documentRepository.findByUser(user).size());
        userMap.put("collectionCount", studyCollectionRepository.findByUser(user).size());
        userMap.put("quizAttempts", userProgressRepository.findByUserId(user.getId()).size());

        return userMap;
    }
}