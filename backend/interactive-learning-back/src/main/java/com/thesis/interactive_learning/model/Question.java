package com.thesis.interactive_learning.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "questions")
@Data
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@EqualsAndHashCode(exclude = {"quiz", "options"})
@ToString(exclude = {"quiz"})
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "question_options", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "option_text", length = 1000)
    private List<String> options = new ArrayList<>();

    @Column(nullable = false)
    private Integer correctOptionIndex;

    @Column(columnDefinition = "TEXT")
    private String sourceText;

    @Column
    private Integer sourcePage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id")
    @JsonIgnoreProperties({"questions", "document", "studyCollection"})
    private Quiz quiz;

    @Column
    private Integer difficultyLevel;

    @Column(length = 50)
    private String questionType;
}