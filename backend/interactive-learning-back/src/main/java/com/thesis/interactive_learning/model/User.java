package com.thesis.interactive_learning.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    private Role role = Role.USER;

    public enum Role {
        USER, ADMIN
    }

    @CreationTimestamp
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status = UserStatus.ENABLED;

    public enum UserStatus {
        ENABLED, DISABLED
    }

    @Column(nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    // Basic status management fields
    @Column
    private LocalDateTime lastStatusChange;

    @Column
    private Long statusChangedBy; // Admin user ID who changed the status

    @Column(length = 255)
    private String statusChangeReason;

    @Column
    private LocalDateTime lastLoginAt;

    @Column
    private Integer failedLoginAttempts = 0;

    @Column
    private LocalDateTime lastFailedLoginAt;

    @Column
    private LocalDateTime accountLockedUntil;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"user", "studyCollection", "quizzes"})
    private Set<Document> documents = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"user", "documents"})
    private Set<StudyCollection> studyCollections = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"user", "quiz"})
    private Set<UserProgress> userProgress = new HashSet<>();

    // Helper methods for status management
    public boolean isEnabled() {
        return status == UserStatus.ENABLED;
    }

    public boolean isDisabled() {
        return status == UserStatus.DISABLED;
    }

    public boolean isAccountLocked() {
        return accountLockedUntil != null && accountLockedUntil.isAfter(LocalDateTime.now());
    }

    public void incrementFailedLoginAttempts() {
        this.failedLoginAttempts = (this.failedLoginAttempts == null) ? 1 : this.failedLoginAttempts + 1;
        this.lastFailedLoginAt = LocalDateTime.now();

        if (this.failedLoginAttempts >= 5) {
            this.accountLockedUntil = LocalDateTime.now().plusMinutes(15);
        }
    }

    public void resetFailedLoginAttempts() {
        this.failedLoginAttempts = 0;
        this.lastFailedLoginAt = null;
        this.accountLockedUntil = null;
    }

    public void updateLastLogin() {
        this.lastLoginAt = LocalDateTime.now();
        resetFailedLoginAttempts();
    }

    public void updateStatus(UserStatus newStatus, Long changedBy, String reason) {
        this.status = newStatus;
        this.lastStatusChange = LocalDateTime.now();
        this.statusChangedBy = changedBy;
        this.statusChangeReason = reason;
    }

    public boolean canLogin() {
        return isEnabled() && !isAccountLocked();
    }
}