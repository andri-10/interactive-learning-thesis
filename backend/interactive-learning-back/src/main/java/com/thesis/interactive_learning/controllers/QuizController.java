package com.thesis.interactive_learning.controllers;

import com.thesis.interactive_learning.model.AuditLog;
import com.thesis.interactive_learning.model.Quiz;
import com.thesis.interactive_learning.security.UserContext;
import com.thesis.interactive_learning.service.AuditLogService;
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
    private AuditLogService auditLogService;

    @Autowired
    public QuizController(QuizService quizService, UserContext userContext) {
        this.quizService = quizService;
        this.userContext = userContext;
    }

    @PostMapping
    public ResponseEntity<?> createQuiz(@RequestBody Quiz quiz) {
        try {
            if (quiz.getDocument() != null && quiz.getDocument().getId() != null) {
                userContext.validateDocumentOwnership(quiz.getDocument());
            }

            if (quiz.getStudyCollection() != null && quiz.getStudyCollection().getId() != null) {
                userContext.validateCollectionOwnership(quiz.getStudyCollection());
            }

            quiz.setId(null);
            Quiz savedQuiz = quizService.saveQuiz(quiz);

            auditLogService.logUserAction(AuditLog.LogAction.QUIZ_CREATED,
                    "Quiz created: '" + savedQuiz.getTitle() + "' with " +
                            (savedQuiz.getQuestions() != null ? savedQuiz.getQuestions().size() : 0) + " questions");

            return new ResponseEntity<>(savedQuiz, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            auditLogService.logError("Quiz creation failed: " + e.getMessage());
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
            Quiz quiz = quizService.getQuizById(id)
                    .orElseThrow(() -> new RuntimeException("Quiz not found"));

            if (quiz.getDocument() != null) {
                userContext.validateDocumentOwnership(quiz.getDocument());
            } else if (quiz.getStudyCollection() != null) {
                userContext.validateCollectionOwnership(quiz.getStudyCollection());
            } else {
                throw new RuntimeException("Cannot determine quiz ownership");
            }

            String quizTitle = quiz.getTitle();
            quizService.deleteQuiz(id);

            auditLogService.log(AuditLog.LogLevel.INFO, AuditLog.LogAction.QUIZ_DELETED,
                    "Quiz deleted: '" + quizTitle + "'", "Quiz", id);

            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            auditLogService.logError("Quiz deletion failed for ID " + id + ": " + e.getMessage());
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