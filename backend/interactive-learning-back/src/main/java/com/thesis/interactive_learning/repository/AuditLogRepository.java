package com.thesis.interactive_learning.repository;

import com.thesis.interactive_learning.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findByOrderByTimestampDesc(Pageable pageable);
    Page<AuditLog> findByUserIdOrderByTimestampDesc(Long userId, Pageable pageable);
    Page<AuditLog> findByLevelOrderByTimestampDesc(AuditLog.LogLevel level, Pageable pageable);
    Page<AuditLog> findByActionOrderByTimestampDesc(AuditLog.LogAction action, Pageable pageable);
    Page<AuditLog> findByTimestampBetweenOrderByTimestampDesc(
            LocalDateTime start, LocalDateTime end, Pageable pageable);

    // Security-related logs
    @Query("SELECT a FROM AuditLog a WHERE a.level = 'SECURITY' OR " +
            "a.action IN ('LOGIN_FAILED', 'USER_STATUS_CHANGED') " +
            "ORDER BY a.timestamp DESC")
    Page<AuditLog> findSecurityLogs(Pageable pageable);

    // Admin action logs
    @Query("SELECT a FROM AuditLog a WHERE a.action IN " +
            "('ADMIN_ACCESS', 'USER_STATUS_CHANGED', 'CONTENT_MODERATION') " +
            "ORDER BY a.timestamp DESC")
    Page<AuditLog> findAdminActionLogs(Pageable pageable);

    // Count failed login attempts (for security monitoring)
    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.action = 'LOGIN_FAILED' " +
            "AND a.ipAddress = :ipAddress AND a.timestamp > :since")
    long countFailedLoginsByIp(@Param("ipAddress") String ipAddress, @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.action = 'LOGIN_FAILED' " +
            "AND a.username = :username AND a.timestamp > :since")
    long countFailedLoginsByUsername(@Param("username") String username, @Param("since") LocalDateTime since);

    // Basic statistics for admin dashboard
    @Query("SELECT a.action as action, COUNT(a) as count FROM AuditLog a " +
            "WHERE a.timestamp > :since GROUP BY a.action ORDER BY count DESC")
    List<Object[]> getActionStatistics(@Param("since") LocalDateTime since);
}