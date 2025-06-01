package com.thesis.interactive_learning.controllers;

import com.thesis.interactive_learning.model.Quiz;
import com.thesis.interactive_learning.service.QuestionGenerationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/generate")
public class QuestionGenerationController {

    private final QuestionGenerationService questionGenerationService;

    @Autowired
    public QuestionGenerationController(QuestionGenerationService questionGenerationService) {
        this.questionGenerationService = questionGenerationService;
    }

    @PostMapping("/quiz")
    public ResponseEntity<?> generateQuiz(
            @RequestParam("documentId") Long documentId,
            @RequestParam("numberOfQuestions") int numberOfQuestions,
            @RequestParam("quizTitle") String quizTitle,
            @RequestParam(value = "questionType", defaultValue = "MULTIPLE_CHOICE") String questionType,
            @RequestParam(value = "difficulty", defaultValue = "2") int difficulty,
            @RequestParam(value = "collectionId", required = false) Long collectionId,
            @RequestParam(value = "microbitCompatible", defaultValue = "true") boolean microbitCompatible,
            @RequestParam(value = "useAI", defaultValue = "true") boolean useAI) {

        try {
            // Validate question type
            if (!questionType.equals("MULTIPLE_CHOICE") && !questionType.equals("TRUE_FALSE")) {
                return new ResponseEntity<>("Invalid question type. Use 'MULTIPLE_CHOICE' or 'TRUE_FALSE'",
                        HttpStatus.BAD_REQUEST);
            }

            // Validate difficulty
            if (difficulty < 1 || difficulty > 3) {
                return new ResponseEntity<>("Invalid difficulty. Use 1 (Easy), 2 (Medium), or 3 (Hard)",
                        HttpStatus.BAD_REQUEST);
            }

            // Validate number of questions
            if (numberOfQuestions < 1 || numberOfQuestions > 50) {
                return new ResponseEntity<>("Number of questions must be between 1 and 50",
                        HttpStatus.BAD_REQUEST);
            }

            Quiz generatedQuiz = questionGenerationService.generateQuizFromDocument(
                    documentId, numberOfQuestions, quizTitle, questionType, difficulty,
                    collectionId, microbitCompatible, useAI);

            return new ResponseEntity<>(generatedQuiz, HttpStatus.CREATED);

        } catch (IOException e) {
            return new ResponseEntity<>("Error processing document: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Unexpected error: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Legacy endpoint for backward compatibility
    @PostMapping("/quiz/legacy")
    public ResponseEntity<?> generateQuizLegacy(
            @RequestParam("documentId") Long documentId,
            @RequestParam("numberOfQuestions") int numberOfQuestions,
            @RequestParam("quizTitle") String quizTitle,
            @RequestParam(value = "collectionId", required = false) Long collectionId,
            @RequestParam(value = "microbitCompatible", defaultValue = "true") boolean microbitCompatible) {

        try {
            Quiz generatedQuiz = questionGenerationService.generateQuizFromDocument(
                    documentId, numberOfQuestions, quizTitle, collectionId, microbitCompatible);

            return new ResponseEntity<>(generatedQuiz, HttpStatus.CREATED);
        } catch (IOException e) {
            return new ResponseEntity<>("Error processing document: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}