package com.thesis.interactive_learning.security;

import com.thesis.interactive_learning.model.AuditLog;
import com.thesis.interactive_learning.model.User;
import com.thesis.interactive_learning.repository.AuditLogRepository;
import com.thesis.interactive_learning.repository.UserRepository;
import com.thesis.interactive_learning.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SecurityMonitoringService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Autowired
    public SecurityMonitoringService(AuditLogRepository auditLogRepository,
                                     UserRepository userRepository,
                                     AuditLogService auditLogService) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    public boolean shouldBlockLogin(String username, String ipAddress) {
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);

        long failedIpAttempts = auditLogRepository.countFailedLoginsByIp(ipAddress, oneHourAgo);
        long failedUsernameAttempts = auditLogRepository.countFailedLoginsByUsername(username, oneHourAgo);

        // Block if too many failures from IP or username
        if (failedIpAttempts >= 5) {
            auditLogService.logSecurityEvent(AuditLog.LogAction.LOGIN_FAILED,
                    "Blocked login attempt - too many failures from IP: " + ipAddress);
            return true;
        }

        if (failedUsernameAttempts >= 5) {
            auditLogService.logSecurityEvent(AuditLog.LogAction.LOGIN_FAILED,
                    "Blocked login attempt - too many failures for username: " + username);
            return true;
        }

        return false;
    }

    public void handleFailedLogin(String username, String ipAddress) {
        User user = userRepository.findByUsername(username).orElse(null);

        if (user != null) {
            user.incrementFailedLoginAttempts();
            userRepository.save(user);

            // Check if account should be locked
            if (user.isAccountLocked()) {
                auditLogService.logSecurityEvent(AuditLog.LogAction.USER_STATUS_CHANGED,
                        "Account temporarily locked due to failed login attempts: " + username);
            }
        }

        auditLogService.logSecurityEvent(AuditLog.LogAction.LOGIN_FAILED,
                "Failed login attempt for username: " + username + " from IP: " + ipAddress);
    }

    public void handleSuccessfulLogin(String username) {
        User user = userRepository.findByUsername(username).orElse(null);

        if (user != null) {
            user.updateLastLogin();
            userRepository.save(user);
        }

        auditLogService.log(AuditLog.LogLevel.INFO, AuditLog.LogAction.LOGIN_SUCCESS,
                "Successful login for user: " + username);
    }

    public Map<String, Object> getSecurityDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);
        LocalDateTime lastWeek = LocalDateTime.now().minusDays(7);

        // Failed login attempts in last 24 hours
        List<Object[]> actionStats = auditLogRepository.getActionStatistics(last24Hours);
        long failedLogins24h = actionStats.stream()
                .filter(stat -> "LOGIN_FAILED".equals(stat[0].toString()))
                .mapToLong(stat -> (Long) stat[1])
                .sum();

        dashboard.put("failedLogins24h", failedLogins24h);

        // Security events in last week
        long securityEvents = auditLogRepository.findSecurityLogs(
                org.springframework.data.domain.PageRequest.of(0, 1000)).getTotalElements();
        dashboard.put("securityEventsWeek", securityEvents);

        // Locked accounts
        long lockedAccounts = userRepository.findAll().stream()
                .filter(User::isAccountLocked)
                .count();
        dashboard.put("lockedAccounts", lockedAccounts);

        // Disabled accounts
        long disabledAccounts = userRepository.findAll().stream()
                .filter(User::isDisabled)
                .count();
        dashboard.put("disabledAccounts", disabledAccounts);

        // Recent security events
        dashboard.put("recentSecurityEvents", auditLogService.getSecurityLogs(0, 10));

        return dashboard;
    }

    public Map<String, Object> getUserSecurityInfo(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> securityInfo = new HashMap<>();
        securityInfo.put("userId", userId);
        securityInfo.put("username", user.getUsername());
        securityInfo.put("status", user.getStatus().toString());
        securityInfo.put("isAccountLocked", user.isAccountLocked());
        securityInfo.put("failedLoginAttempts", user.getFailedLoginAttempts());
        securityInfo.put("lastLoginAt", user.getLastLoginAt());
        securityInfo.put("lastFailedLoginAt", user.getLastFailedLoginAt());
        securityInfo.put("accountLockedUntil", user.getAccountLockedUntil());
        securityInfo.put("lastStatusChange", user.getLastStatusChange());
        securityInfo.put("statusChangeReason", user.getStatusChangeReason());

        // Recent login attempts for this user
        securityInfo.put("recentActivity", auditLogService.getUserLogs(userId, 0, 20));

        return securityInfo;
    }

    public void unlockUserAccount(Long userId, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isAccountLocked()) {
            user.resetFailedLoginAttempts();
            userRepository.save(user);

            auditLogService.logAdminAction(AuditLog.LogAction.USER_STATUS_CHANGED,
                    "Admin manually unlocked account for user: " + user.getUsername() + " - Reason: " + reason);
        }
    }

    public void resetFailedAttempts(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.resetFailedLoginAttempts();
        userRepository.save(user);

        auditLogService.logAdminAction(AuditLog.LogAction.USER_STATUS_CHANGED,
                "Admin reset failed login attempts for user: " + user.getUsername());
    }

    public List<Map<String, Object>> getLockedAccounts() {
        return userRepository.findAll().stream()
                .filter(User::isAccountLocked)
                .map(user -> {
                    Map<String, Object> lockedUser = new HashMap<>();
                    lockedUser.put("id", user.getId());
                    lockedUser.put("username", user.getUsername());
                    lockedUser.put("email", user.getEmail());
                    lockedUser.put("failedAttempts", user.getFailedLoginAttempts());
                    lockedUser.put("lockedUntil", user.getAccountLockedUntil());
                    lockedUser.put("lastFailedLogin", user.getLastFailedLoginAt());
                    return lockedUser;
                })
                .toList();
    }
}