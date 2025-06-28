package com.thesis.interactive_learning.controllers;

import com.thesis.interactive_learning.model.Quiz;
import com.thesis.interactive_learning.security.UserContext;
import com.thesis.interactive_learning.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    private final QuizService quizService;
    private final UserContext userContext;

    @Autowired
    public QuizController(QuizService quizService, UserContext userContext) {
        this.quizService = quizService;
        this.userContext = userContext;
    }

    @PostMapping
    public ResponseEntity<?> createQuiz(@RequestBody Quiz quiz) {
        try {
            // Get current authenticated user
            Long currentUserId = userContext.getCurrentUserId();

            System.out.println("=== CREATE QUIZ REQUEST ===");
            System.out.println("Quiz title: " + quiz.getTitle());
            System.out.println("Quiz description: " + quiz.getDescription());
            System.out.println("Current User ID: " + currentUserId);

            // Validate ownership of document and collection if provided
            if (quiz.getDocument() != null && quiz.getDocument().getId() != null) {
                userContext.validateDocumentOwnership(quiz.getDocument());
            }

            if (quiz.getStudyCollection() != null && quiz.getStudyCollection().getId() != null) {
                userContext.validateCollectionOwnership(quiz.getStudyCollection());
            }

            // Clear ID for new quiz
            quiz.setId(null);

            Quiz savedQuiz = quizService.saveQuiz(quiz);
            return new ResponseEntity<>(savedQuiz, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            System.out.println("ERROR creating quiz: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getQuizById(@PathVariable Long id) {
        try {
            Quiz quiz = quizService.getQuizById(id)
                    .orElseThrow(() -> new RuntimeException("Quiz not found"));

            // Validate user can access this quiz (through document ownership)
            if (quiz.getDocument() != null) {
                userContext.validateDocumentOwnership(quiz.getDocument());
            } else {
                // If no document, check collection ownership
                if (quiz.getStudyCollection() != null) {
                    userContext.validateCollectionOwnership(quiz.getStudyCollection());
                } else {
                    throw new RuntimeException("Quiz has no associated document or collection");
                }
            }

            return ResponseEntity.ok(quiz);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Quiz>> getAllQuizzes() {
        // Only return quizzes accessible by current user
        Long currentUserId = userContext.getCurrentUserId();
        List<Quiz> quizzes = quizService.getQuizzesByUserId(currentUserId);
        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/collection/{collectionId}")
    public ResponseEntity<?> getQuizzesByCollectionId(@PathVariable Long collectionId) {
        try {
            // Get current user's quizzes from the collection
            Long currentUserId = userContext.getCurrentUserId();
            List<Quiz> quizzes = quizService.getQuizzesByCollectionIdAndUserId(collectionId, currentUserId);
            return ResponseEntity.ok(quizzes);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/document/{documentId}")
    public ResponseEntity<?> getQuizzesByDocumentId(@PathVariable Long documentId) {
        try {
            // Validate document ownership first
            Long currentUserId = userContext.getCurrentUserId();
            List<Quiz> quizzes = quizService.getQuizzesByDocumentIdAndUserId(documentId, currentUserId);
            return ResponseEntity.ok(quizzes);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuiz(@PathVariable Long id, @RequestBody Quiz quiz) {
        try {
            // Validate quiz ownership
            Quiz existingQuiz = quizService.getQuizById(id)
                    .orElseThrow(() -> new RuntimeException("Quiz not found"));

            // Validate user can access this quiz
            if (existingQuiz.getDocument() != null) {
                userContext.validateDocumentOwnership(existingQuiz.getDocument());
            } else if (existingQuiz.getStudyCollection() != null) {
                userContext.validateCollectionOwnership(existingQuiz.getStudyCollection());
            } else {
                throw new RuntimeException("Cannot determine quiz ownership");
            }

            // Validate new document/collection ownership if being updated
            if (quiz.getDocument() != null && quiz.getDocument().getId() != null) {
                userContext.validateDocumentOwnership(quiz.getDocument());
            }

            if (quiz.getStudyCollection() != null && quiz.getStudyCollection().getId() != null) {
                userContext.validateCollectionOwnership(quiz.getStudyCollection());
            }

            quiz.setId(id);
            Quiz updatedQuiz = quizService.saveQuiz(quiz);
            return ResponseEntity.ok(updatedQuiz);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuiz(@PathVariable Long id) {
        try {
            // Validate quiz ownership before deletion
            Quiz quiz = quizService.getQuizById(id)
                    .orElseThrow(() -> new RuntimeException("Quiz not found"));

            // Validate user can delete this quiz
            if (quiz.getDocument() != null) {
                userContext.validateDocumentOwnership(quiz.getDocument());
            } else if (quiz.getStudyCollection() != null) {
                userContext.validateCollectionOwnership(quiz.getStudyCollection());
            } else {
                throw new RuntimeException("Cannot determine quiz ownership");
            }

            quizService.deleteQuiz(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<?> getQuizStats(@PathVariable Long id) {
        try {
            Quiz quiz = quizService.getQuizById(id)
                    .orElseThrow(() -> new RuntimeException("Quiz not found"));

            // Validate user can access this quiz
            if (quiz.getDocument() != null) {
                userContext.validateDocumentOwnership(quiz.getDocument());
            } else if (quiz.getStudyCollection() != null) {
                userContext.validateCollectionOwnership(quiz.getStudyCollection());
            } else {
                throw new RuntimeException("Cannot determine quiz ownership");
            }

            Map<String, Object> stats = quizService.getQuizStats(id);
            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/microbit-compatible")
    public ResponseEntity<List<Quiz>> getMicrobitCompatibleQuizzes() {
        // Only return microbit-compatible quizzes accessible by current user
        Long currentUserId = userContext.getCurrentUserId();
        List<Quiz> quizzes = quizService.getMicrobitCompatibleQuizzesByUserId(currentUserId);
        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/{id}/questions")
    public ResponseEntity<?> getQuizQuestions(@PathVariable Long id) {
        try {
            Quiz quiz = quizService.getQuizById(id)
                    .orElseThrow(() -> new RuntimeException("Quiz not found"));

            // Validate user can access this quiz
            if (quiz.getDocument() != null) {
                userContext.validateDocumentOwnership(quiz.getDocument());
            } else if (quiz.getStudyCollection() != null) {
                userContext.validateCollectionOwnership(quiz.getStudyCollection());
            } else {
                throw new RuntimeException("Cannot determine quiz ownership");
            }

            return ResponseEntity.ok(quiz.getQuestions());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}