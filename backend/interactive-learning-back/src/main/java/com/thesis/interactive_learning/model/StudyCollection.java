package com.thesis.interactive_learning.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "study_collections")
@Data
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@EqualsAndHashCode(exclude = {"user", "documents", "quizzes"})
@ToString(exclude = {"user", "documents", "quizzes"})
public class StudyCollection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore  // Keep this ignored to prevent circular reference
    private User user;

    @OneToMany(mappedBy = "studyCollection", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore  // Keep this ignored
    private Set<Document> documents = new HashSet<>();

    @OneToMany(mappedBy = "studyCollection", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore  // Keep this ignored
    private Set<Quiz> quizzes = new HashSet<>();

    // Add these fields for JSON serialization instead of the relationships
    @Transient
    private Long userId;

    @Transient
    private int documentCount = 0;

    @Transient
    private int quizCount = 0;
}