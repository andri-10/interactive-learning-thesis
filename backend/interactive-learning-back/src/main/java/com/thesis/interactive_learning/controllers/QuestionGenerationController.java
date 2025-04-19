package com.thesis.interactive_learning.controller;

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