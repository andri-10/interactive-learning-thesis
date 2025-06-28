package com.thesis.interactive_learning.controllers;

import com.thesis.interactive_learning.model.AuditLog;
import com.thesis.interactive_learning.security.UserContext;
import com.thesis.interactive_learning.service.AdminService;
import com.thesis.interactive_learning.service.AuditLogService;
import com.thesis.interactive_learning.security.SecurityMonitoringService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final UserContext userContext;
    private final AuditLogService auditLogService;
    private final SecurityMonitoringService securityMonitoringService;

    @Autowired
    public AdminController(AdminService adminService, UserContext userContext, AuditLogService auditLogService, SecurityMonitoringService securityMonitoringService) {
        this.adminService = adminService;
        this.userContext = userContext;
        this.auditLogService = auditLogService;
        this.securityMonitoringService = securityMonitoringService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getAdminDashboard() {
        try {
            validateAdminAccess();
            auditLogService.logAdminAction(AuditLog.LogAction.ADMIN_ACCESS, "Admin accessed dashboard");

            Map<String, Object> dashboard = adminService.getAdminDashboard();
            return ResponseEntity.ok(dashboard);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "20") int size) {
        try {
            validateAdminAccess();
            auditLogService.logAdminAction(AuditLog.LogAction.ADMIN_ACCESS, "Admin accessed user list");

            Map<String, Object> users = adminService.getAllUsersWithPagination(page, size);
            return ResponseEntity.ok(users);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserDetails(@PathVariable Long userId) {
        try {
            validateAdminAccess();
            auditLogService.logAdminAction(AuditLog.LogAction.ADMIN_ACCESS,
                    "Admin accessed user details for user ID: " + userId);

            Map<String, Object> userDetails = adminService.getUserDetails(userId);
            return ResponseEntity.ok(userDetails);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long userId,
                                              @RequestBody Map<String, Object> statusUpdate) {
        try {
            validateAdminAccess();

            boolean enabled = (Boolean) statusUpdate.get("enabled");
            String reason = (String) statusUpdate.getOrDefault("reason", "Status changed by admin");

            auditLogService.logAdminAction(AuditLog.LogAction.USER_STATUS_CHANGED,
                    "Admin " + (enabled ? "enabled" : "disabled") + " user ID: " + userId + " - Reason: " + reason);

            Map<String, Object> result = adminService.updateUserStatus(userId, enabled, reason);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/content/documents/{documentId}")
    public ResponseEntity<?> deleteAnyDocument(@PathVariable Long documentId) {
        try {
            validateAdminAccess();
            auditLogService.logAdminAction(AuditLog.LogAction.CONTENT_MODERATION,
                    "Admin deleted document ID: " + documentId);

            Map<String, Object> result = adminService.deleteDocument(documentId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/content/quizzes/{quizId}")
    public ResponseEntity<?> deleteAnyQuiz(@PathVariable Long quizId) {
        try {
            validateAdminAccess();
            auditLogService.logAdminAction(AuditLog.LogAction.CONTENT_MODERATION,
                    "Admin deleted quiz ID: " + quizId);

            Map<String, Object> result = adminService.deleteQuiz(quizId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/logs/recent")
    public ResponseEntity<?> getRecentLogs(@RequestParam(defaultValue = "100") int limit) {
        try {
            validateAdminAccess();
            auditLogService.logAdminAction(AuditLog.LogAction.ADMIN_ACCESS, "Admin accessed recent logs");

            Map<String, Object> logs = auditLogService.getRecentLogs(limit);
            return ResponseEntity.ok(logs);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/logs/security")
    public ResponseEntity<?> getSecurityLogs(@RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "50") int size) {
        try {
            validateAdminAccess();
            auditLogService.logAdminAction(AuditLog.LogAction.ADMIN_ACCESS, "Admin accessed security logs");

            Map<String, Object> logs = auditLogService.getSecurityLogs(page, size);
            return ResponseEntity.ok(logs);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/logs/admin-actions")
    public ResponseEntity<?> getAdminActionLogs(@RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "50") int size) {
        try {
            validateAdminAccess();
            auditLogService.logAdminAction(AuditLog.LogAction.ADMIN_ACCESS, "Admin accessed admin action logs");

            Map<String, Object> logs = auditLogService.getAdminActionLogs(page, size);
            return ResponseEntity.ok(logs);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/logs/user/{userId}")
    public ResponseEntity<?> getUserActivityLogs(@PathVariable Long userId,
                                                 @RequestParam(defaultValue = "0") int page,
                                                 @RequestParam(defaultValue = "50") int size) {
        try {
            validateAdminAccess();
            auditLogService.logAdminAction(AuditLog.LogAction.ADMIN_ACCESS,
                    "Admin accessed activity logs for user ID: " + userId);

            Map<String, Object> logs = auditLogService.getUserLogs(userId, page, size);
            return ResponseEntity.ok(logs);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }


    @GetMapping("/security/dashboard")
    public ResponseEntity<?> getSecurityDashboard() {
        try {
            validateAdminAccess();
            auditLogService.logAdminAction(AuditLog.LogAction.ADMIN_ACCESS, "Admin accessed security dashboard");

            Map<String, Object> dashboard = securityMonitoringService.getSecurityDashboard();
            return ResponseEntity.ok(dashboard);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/security/locked-accounts")
    public ResponseEntity<?> getLockedAccounts() {
        try {
            validateAdminAccess();
            auditLogService.logAdminAction(AuditLog.LogAction.ADMIN_ACCESS, "Admin accessed locked accounts list");

            return ResponseEntity.ok(securityMonitoringService.getLockedAccounts());
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/security/unlock/{userId}")
    public ResponseEntity<?> unlockUserAccount(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        try {
            validateAdminAccess();
            String reason = request.getOrDefault("reason", "Account unlocked by admin");

            securityMonitoringService.unlockUserAccount(userId, reason);
            return ResponseEntity.ok(Map.of("message", "User account unlocked successfully", "userId", userId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/security/user/{userId}")
    public ResponseEntity<?> getUserSecurityInfo(@PathVariable Long userId) {
        try {
            validateAdminAccess();
            auditLogService.logAdminAction(AuditLog.LogAction.ADMIN_ACCESS,
                    "Admin accessed security info for user ID: " + userId);

            Map<String, Object> securityInfo = securityMonitoringService.getUserSecurityInfo(userId);
            return ResponseEntity.ok(securityInfo);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/security/reset-attempts/{userId}")
    public ResponseEntity<?> resetFailedAttempts(@PathVariable Long userId) {
        try {
            validateAdminAccess();

            securityMonitoringService.resetFailedAttempts(userId);
            return ResponseEntity.ok(Map.of("message", "Failed login attempts reset successfully", "userId", userId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    private void validateAdminAccess() {
        var currentUser = userContext.getCurrentUser();
        if (currentUser.getRole() == null || !currentUser.getRole().toString().equals("ADMIN")) {
            throw new RuntimeException("Admin access required");
        }
    }
}