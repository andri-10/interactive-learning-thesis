package com.thesis.interactive_learning.service.impl;

import com.thesis.interactive_learning.model.AuditLog;
import com.thesis.interactive_learning.model.User;
import com.thesis.interactive_learning.repository.AuditLogRepository;
import com.thesis.interactive_learning.security.UserContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditLogServiceImplTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private UserContext userContext;

    @InjectMocks
    private AuditLogServiceImpl auditLogService;

    private User testUser;
    private AuditLog testLog;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");

        testLog = new AuditLog();
        testLog.setId(1L);
        testLog.setLevel(AuditLog.LogLevel.INFO);
        testLog.setAction(AuditLog.LogAction.USER_CREATED);
        testLog.setDescription("Test log entry");
        testLog.setUserId(1L);
        testLog.setUsername("testuser");
        testLog.setTimestamp(LocalDateTime.now());

        // Setup mock request for IP address
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("127.0.0.1");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
    }

    @Test
    void log_WithBasicParameters_ShouldCreateAndSaveLog() {
        // Given
        when(userContext.getCurrentUser()).thenReturn(testUser);
        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(testLog);

        // When
        auditLogService.log(AuditLog.LogLevel.INFO, AuditLog.LogAction.USER_CREATED, "Test message");

        // Then
        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
        verify(userContext, times(1)).getCurrentUser();
    }

    @Test
    void log_WhenUserContextFails_ShouldStillCreateLog() {
        // Given
        when(userContext.getCurrentUser()).thenThrow(new RuntimeException("No user context"));
        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(testLog);

        // When
        auditLogService.log(AuditLog.LogLevel.INFO, AuditLog.LogAction.USER_CREATED, "Test message");

        // Then
        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
    }

    @Test
    void log_WithUserIdAndUsername_ShouldCreateLogWithSpecificUser() {
        // Given
        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(testLog);

        // When
        auditLogService.log(AuditLog.LogLevel.INFO, AuditLog.LogAction.USER_CREATED,
                "Test message", 1L, "testuser");

        // Then
        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
        verify(userContext, never()).getCurrentUser();
    }

    @Test
    void log_WithEntityTypeAndId_ShouldCreateLogWithEntityInfo() {
        // Given
        when(userContext.getCurrentUser()).thenReturn(testUser);
        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(testLog);

        // When
        auditLogService.log(AuditLog.LogLevel.INFO, AuditLog.LogAction.DOCUMENT_UPLOADED,
                "Document uploaded", "Document", 1L);

        // Then
        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
    }

    @Test
    void logUserAction_ShouldLogWithInfoLevel() {
        // Given
        when(userContext.getCurrentUser()).thenReturn(testUser);
        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(testLog);

        // When
        auditLogService.logUserAction(AuditLog.LogAction.DOCUMENT_UPLOADED, "User uploaded document");

        // Then
        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
    }

    @Test
    void logSecurityEvent_ShouldLogWithSecurityLevel() {
        // Given
        when(userContext.getCurrentUser()).thenReturn(testUser);
        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(testLog);

        // When
        auditLogService.logSecurityEvent(AuditLog.LogAction.LOGIN_FAILED, "Failed login attempt");

        // Then
        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
    }

    @Test
    void logAdminAction_ShouldLogWithInfoLevel() {
        // Given
        when(userContext.getCurrentUser()).thenReturn(testUser);
        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(testLog);

        // When
        auditLogService.logAdminAction(AuditLog.LogAction.ADMIN_ACCESS, "Admin accessed dashboard");

        // Then
        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
    }

    @Test
    void logError_ShouldLogWithErrorLevel() {
        // Given
        when(userContext.getCurrentUser()).thenReturn(testUser);
        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(testLog);

        // When
        auditLogService.logError("System error occurred");

        // Then
        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
    }

    @Test
    void logLoginAttempt_ShouldCreateLoginLog() {
        // Given
        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(testLog);

        // When
        auditLogService.logLoginAttempt(AuditLog.LogAction.LOGIN_FAILED, "testuser", "Invalid credentials");

        // Then
        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
    }

    @Test
    void getRecentLogs_ShouldReturnPagedLogs() {
        // Given
        AuditLog log2 = new AuditLog();
        log2.setId(2L);
        log2.setDescription("Second log");

        List<AuditLog> logs = Arrays.asList(testLog, log2);
        Page<AuditLog> logPage = new PageImpl<>(logs);

        when(auditLogRepository.findByOrderByTimestampDesc(any(Pageable.class))).thenReturn(logPage);

        // When
        Map<String, Object> result = auditLogService.getRecentLogs(10);

        // Then
        assertNotNull(result);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> resultLogs = (List<Map<String, Object>>) result.get("logs");
        assertEquals(2, resultLogs.size());
        assertEquals(2L, result.get("totalElements"));

        verify(auditLogRepository, times(1)).findByOrderByTimestampDesc(any(Pageable.class));
    }

    @Test
    void getLogsByLevel_ShouldReturnFilteredLogs() {
        // Given
        Page<AuditLog> logPage = new PageImpl<>(Arrays.asList(testLog));
        when(auditLogRepository.findByLevelOrderByTimestampDesc(eq(AuditLog.LogLevel.INFO), any(Pageable.class)))
                .thenReturn(logPage);

        // When
        Map<String, Object> result = auditLogService.getLogsByLevel(AuditLog.LogLevel.INFO, 0, 10);

        // Then
        assertNotNull(result);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> resultLogs = (List<Map<String, Object>>) result.get("logs");
        assertEquals(1, resultLogs.size());
        assertEquals(0, result.get("currentPage"));
        assertEquals(10, result.get("pageSize"));
    }

    @Test
    void getSecurityLogs_ShouldReturnSecurityLogs() {
        // Given
        Page<AuditLog> logPage = new PageImpl<>(Arrays.asList(testLog));
        when(auditLogRepository.findSecurityLogs(any(Pageable.class))).thenReturn(logPage);

        // When
        Map<String, Object> result = auditLogService.getSecurityLogs(0, 10);

        // Then
        assertNotNull(result);
        verify(auditLogRepository, times(1)).findSecurityLogs(any(Pageable.class));
    }

    @Test
    void getAdminActionLogs_ShouldReturnAdminLogs() {
        // Given
        Page<AuditLog> logPage = new PageImpl<>(Arrays.asList(testLog));
        when(auditLogRepository.findAdminActionLogs(any(Pageable.class))).thenReturn(logPage);

        // When
        Map<String, Object> result = auditLogService.getAdminActionLogs(0, 10);

        // Then
        assertNotNull(result);
        verify(auditLogRepository, times(1)).findAdminActionLogs(any(Pageable.class));
    }

    @Test
    void getUserLogs_ShouldReturnUserSpecificLogs() {
        // Given
        Page<AuditLog> logPage = new PageImpl<>(Arrays.asList(testLog));
        when(auditLogRepository.findByUserIdOrderByTimestampDesc(eq(1L), any(Pageable.class)))
                .thenReturn(logPage);

        // When
        Map<String, Object> result = auditLogService.getUserLogs(1L, 0, 10);

        // Then
        assertNotNull(result);
        verify(auditLogRepository, times(1)).findByUserIdOrderByTimestampDesc(eq(1L), any(Pageable.class));
    }

    @Test
    void checkSuspiciousActivity_WithHighFailures_ShouldReturnTrue() {
        // Given
        when(auditLogRepository.countFailedLoginsByIp(eq("192.168.1.1"), any(LocalDateTime.class)))
                .thenReturn(6L);
        when(auditLogRepository.countFailedLoginsByUsername(eq("testuser"), any(LocalDateTime.class)))
                .thenReturn(3L);

        // When
        boolean result = auditLogService.checkSuspiciousActivity("192.168.1.1", "testuser");

        // Then
        assertTrue(result);
    }

    @Test
    void checkSuspiciousActivity_WithLowFailures_ShouldReturnFalse() {
        // Given
        when(auditLogRepository.countFailedLoginsByIp(eq("192.168.1.1"), any(LocalDateTime.class)))
                .thenReturn(2L);
        when(auditLogRepository.countFailedLoginsByUsername(eq("testuser"), any(LocalDateTime.class)))
                .thenReturn(3L);

        // When
        boolean result = auditLogService.checkSuspiciousActivity("192.168.1.1", "testuser");

        // Then
        assertFalse(result);
    }

    @Test
    void checkSuspiciousActivity_WithHighUsernameFailures_ShouldReturnTrue() {
        // Given
        when(auditLogRepository.countFailedLoginsByIp(eq("192.168.1.1"), any(LocalDateTime.class)))
                .thenReturn(2L);
        when(auditLogRepository.countFailedLoginsByUsername(eq("testuser"), any(LocalDateTime.class)))
                .thenReturn(6L);

        // When
        boolean result = auditLogService.checkSuspiciousActivity("192.168.1.1", "testuser");

        // Then
        assertTrue(result);
    }
}