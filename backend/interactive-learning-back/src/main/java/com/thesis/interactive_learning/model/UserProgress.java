package com.thesis.interactive_learning.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_progress")
@Data
@NoArgsConstructor
public class UserProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"progress", "documents", "quizzes"})
    private User user;

    @ManyToOne
    @JoinColumn(name = "quiz_id", nullable = false)
    @JsonIgnoreProperties({"progress", "questions", "user"})
    private Quiz quiz;

    @Column(nullable = false)
    private LocalDateTime completedAt = LocalDateTime.now();

    @Column(nullable = false)
    private Integer totalQuestions;

    @Column(nullable = false)
    private Integer correctAnswers;

    @Column
    private Integer score;

    @Column
    private Long completionTimeSeconds;

    @Column
    private Double accuracyPercentage;

    public void calculateAccuracy() {
        if (totalQuestions > 0) {
            this.accuracyPercentage = (double) correctAnswers / totalQuestions * 100;
        } else {
            this.accuracyPercentage = 0.0;
        }
    }
}