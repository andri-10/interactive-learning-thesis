package com.thesis.interactive_learning.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private LogLevel level;

    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private LogAction action;

    @Column(nullable = false, length = 500)
    private String description;

    @Column
    private Long userId;

    @Column(length = 100)
    private String username;

    @Column(length = 45)
    private String ipAddress;

    @Column(length = 50)
    private String entityType;

    @Column
    private Long entityId;

    public enum LogLevel {
        INFO, WARN, ERROR, SECURITY
    }

    public enum LogAction {
        // Authentication
        LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT,

        // User Management
        USER_STATUS_CHANGED, USER_CREATED,

        // Content Management
        DOCUMENT_UPLOADED, DOCUMENT_DELETED,
        QUIZ_CREATED, QUIZ_DELETED,
        COLLECTION_CREATED, COLLECTION_DELETED,

        // Admin Actions
        ADMIN_ACCESS, CONTENT_MODERATION,

        // System Events
        SYSTEM_ERROR
    }


    public AuditLog(LogLevel level, LogAction action, String description, Long userId, String username) {
        this.level = level;
        this.action = action;
        this.description = description;
        this.userId = userId;
        this.username = username;
        this.timestamp = LocalDateTime.now();
    }
}