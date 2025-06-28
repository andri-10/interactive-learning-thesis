package com.thesis.interactive_learning.service;

import java.util.Map;

public interface AdminService {

    Map<String, Object> getAdminDashboard();

    Map<String, Object> getAllUsersWithPagination(int page, int size);
    Map<String, Object> getUserDetails(Long userId);
    Map<String, Object> updateUserStatus(Long userId, boolean enabled, String reason);

    Map<String, Object> deleteDocument(Long documentId);
    Map<String, Object> deleteQuiz(Long quizId);
}