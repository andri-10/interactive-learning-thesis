package com.thesis.interactive_learning.service;

import java.util.Map;

public interface AdminService {


    Map<String, Object> getAdminDashboard();
    Map<String, Object> getSystemStats();

    Map<String, Object> getAllUsersWithPagination(int page, int size);
    Map<String, Object> getUserDetails(Long userId);
    Map<String, Object> updateUserStatus(Long userId, boolean enabled);
    Map<String, Object> getUserAnalytics();

    Map<String, Object> getContentOverview();
    Map<String, Object> getPopularContent(int limit);
    Map<String, Object> deleteDocument(Long documentId);
    Map<String, Object> deleteQuiz(Long quizId);

    Map<String, Object> getPlatformAnalytics(int days);
    Map<String, Object> getMicrobitUsage(int days);

    Map<String, Object> getRecentSystemLogs(int limit);
}