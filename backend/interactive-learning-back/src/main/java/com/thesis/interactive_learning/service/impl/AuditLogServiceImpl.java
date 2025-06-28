package com.thesis.interactive_learning.service.impl;

import com.thesis.interactive_learning.model.AuditLog;
import com.thesis.interactive_learning.model.User;
import com.thesis.interactive_learning.repository.AuditLogRepository;
import com.thesis.interactive_learning.security.UserContext;
import com.thesis.interactive_learning.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserContext userContext;

    @Autowired
    public AuditLogServiceImpl(AuditLogRepository auditLogRepository, UserContext userContext) {
        this.auditLogRepository = auditLogRepository;
        this.userContext = userContext;
    }

    @Override
    public void log(AuditLog.LogLevel level, AuditLog.LogAction action, String description) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .level(level)
                    .action(action)
                    .description(description)
                    .timestamp(LocalDateTime.now())
                    .build();


            try {
                User currentUser = userContext.getCurrentUser();
                if (currentUser != null) {
                    auditLog.setUserId(currentUser.getId());
                    auditLog.setUsername(currentUser.getUsername());
                }
            } catch (Exception e) {

            }


            auditLog.setIpAddress(getClientIpAddress());

            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            // Log to console if database logging fails
            System.err.println("Failed to save audit log: " + e.getMessage());
        }
    }

    @Override
    public void log(AuditLog.LogLevel level, AuditLog.LogAction action, String description,
                    Long userId, String username) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .level(level)
                    .action(action)
                    .description(description)
                    .userId(userId)
                    .username(username)
                    .timestamp(LocalDateTime.now())
                    .ipAddress(getClientIpAddress())
                    .build();

            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            System.err.println("Failed to save audit log: " + e.getMessage());
        }
    }

    @Override
    public void log(AuditLog.LogLevel level, AuditLog.LogAction action, String description,
                    String entityType, Long entityId) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .level(level)
                    .action(action)
                    .description(description)
                    .entityType(entityType)
                    .entityId(entityId)
                    .timestamp(LocalDateTime.now())
                    .build();


            try {
                User currentUser = userContext.getCurrentUser();
                if (currentUser != null) {
                    auditLog.setUserId(currentUser.getId());
                    auditLog.setUsername(currentUser.getUsername());
                }
            } catch (Exception e) {

            }

            auditLog.setIpAddress(getClientIpAddress());
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            System.err.println("Failed to save audit log: " + e.getMessage());
        }
    }

    @Override
    public void logUserAction(AuditLog.LogAction action, String description) {
        log(AuditLog.LogLevel.INFO, action, description);
    }

    @Override
    public void logSecurityEvent(AuditLog.LogAction action, String description) {
        log(AuditLog.LogLevel.SECURITY, action, description);
    }

    @Override
    public void logAdminAction(AuditLog.LogAction action, String description) {
        log(AuditLog.LogLevel.INFO, action, description);
    }

    @Override
    public void logError(String description) {
        log(AuditLog.LogLevel.ERROR, AuditLog.LogAction.SYSTEM_ERROR, description);
    }

    @Override
    public void logLoginAttempt(AuditLog.LogAction action, String username, String description) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .level(action == AuditLog.LogAction.LOGIN_FAILED ? AuditLog.LogLevel.SECURITY : AuditLog.LogLevel.INFO)
                    .action(action)
                    .description(description)
                    .username(username)
                    .timestamp(LocalDateTime.now())
                    .ipAddress(getClientIpAddress())
                    .build();

            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            System.err.println("Failed to save login audit log: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> getRecentLogs(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        Page<AuditLog> logs = auditLogRepository.findByOrderByTimestampDesc(pageable);

        Map<String, Object> result = new HashMap<>();
        result.put("logs", logs.getContent().stream()
                .map(this::mapAuditLogToResponse)
                .collect(Collectors.toList()));
        result.put("totalElements", logs.getTotalElements());

        return result;
    }

    @Override
    public Map<String, Object> getLogsByLevel(AuditLog.LogLevel level, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLog> logs = auditLogRepository.findByLevelOrderByTimestampDesc(level, pageable);

        return mapPageToResponse(logs, page, size);
    }

    @Override
    public Map<String, Object> getSecurityLogs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLog> logs = auditLogRepository.findSecurityLogs(pageable);

        return mapPageToResponse(logs, page, size);
    }

    @Override
    public Map<String, Object> getAdminActionLogs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLog> logs = auditLogRepository.findAdminActionLogs(pageable);

        return mapPageToResponse(logs, page, size);
    }

    @Override
    public Map<String, Object> getUserLogs(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLog> logs = auditLogRepository.findByUserIdOrderByTimestampDesc(userId, pageable);

        return mapPageToResponse(logs, page, size);
    }

    @Override
    public boolean checkSuspiciousActivity(String ipAddress, String username) {
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);

        long failedIpAttempts = auditLogRepository.countFailedLoginsByIp(ipAddress, oneHourAgo);
        long failedUsernameAttempts = auditLogRepository.countFailedLoginsByUsername(username, oneHourAgo);

        return failedIpAttempts >= 5 || failedUsernameAttempts >= 5;
    }

    private String getClientIpAddress() {
        try {
            ServletRequestAttributes attr = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
            if (attr != null) {
                HttpServletRequest request = attr.getRequest();
                String ipAddress = request.getHeader("X-Forwarded-For");
                if (ipAddress == null || ipAddress.isEmpty()) {
                    ipAddress = request.getRemoteAddr();
                }
                return ipAddress;
            }
        } catch (Exception e) {

        }
        return null;
    }

    private Map<String, Object> mapPageToResponse(Page<AuditLog> logs, int page, int size) {
        Map<String, Object> result = new HashMap<>();
        result.put("logs", logs.getContent().stream()
                .map(this::mapAuditLogToResponse)
                .collect(Collectors.toList()));
        result.put("totalElements", logs.getTotalElements());
        result.put("totalPages", logs.getTotalPages());
        result.put("currentPage", page);
        result.put("pageSize", size);

        return result;
    }

    private Map<String, Object> mapAuditLogToResponse(AuditLog log) {
        Map<String, Object> logMap = new HashMap<>();
        logMap.put("id", log.getId());
        logMap.put("timestamp", log.getTimestamp());
        logMap.put("level", log.getLevel().toString());
        logMap.put("action", log.getAction().toString());
        logMap.put("description", log.getDescription());
        logMap.put("userId", log.getUserId());
        logMap.put("username", log.getUsername());
        logMap.put("ipAddress", log.getIpAddress());
        logMap.put("entityType", log.getEntityType());
        logMap.put("entityId", log.getEntityId());

        return logMap;
    }
}