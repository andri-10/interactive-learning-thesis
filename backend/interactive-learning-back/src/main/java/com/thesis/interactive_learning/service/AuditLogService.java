package com.thesis.interactive_learning.service;

import com.thesis.interactive_learning.model.AuditLog;

import java.util.Map;

public interface AuditLogService {

    // Core logging methods
    void log(AuditLog.LogLevel level, AuditLog.LogAction action, String description);

    void log(AuditLog.LogLevel level, AuditLog.LogAction action, String description,
             Long userId, String username);

    void log(AuditLog.LogLevel level, AuditLog.LogAction action, String description,
             String entityType, Long entityId);

    // Convenience methods for common scenarios
    void logUserAction(AuditLog.LogAction action, String description);

    void logSecurityEvent(AuditLog.LogAction action, String description);

    void logAdminAction(AuditLog.LogAction action, String description);

    void logError(String description);

    // Method for login attempts (when user context not available)
    void logLoginAttempt(AuditLog.LogAction action, String username, String description);

    // Retrieval methods for admin interface
    Map<String, Object> getRecentLogs(int limit);

    Map<String, Object> getLogsByLevel(AuditLog.LogLevel level, int page, int size);

    Map<String, Object> getSecurityLogs(int page, int size);

    Map<String, Object> getAdminActionLogs(int page, int size);

    Map<String, Object> getUserLogs(Long userId, int page, int size);

    // Basic security monitoring
    boolean checkSuspiciousActivity(String ipAddress, String username);
}