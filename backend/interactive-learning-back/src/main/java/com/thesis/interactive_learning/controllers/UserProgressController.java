package com.thesis.interactive_learning.controllers;

import com.thesis.interactive_learning.model.UserProgress;
import com.thesis.interactive_learning.security.UserContext;
import com.thesis.interactive_learning.service.UserProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/progress")
public class UserProgressController {

    private final UserProgressService userProgressService;
    private final UserContext userContext;

    @Autowired
    public UserProgressController(UserProgressService userProgressService, UserContext userContext) {
        this.userProgressService = userProgressService;
        this.userContext = userContext;
    }

    @PostMapping
    public ResponseEntity<?> createUserProgress(@RequestBody UserProgress userProgress) {
        try {
            // Ensure progress belongs to current user
            Long currentUserId = userContext.getCurrentUserId();

            // Validate user can create progress for themselves
            if (userProgress.getUser() != null && !userProgress.getUser().getId().equals(currentUserId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Cannot create progress for another user"));
            }

            UserProgress savedUserProgress = userProgressService.saveUserProgress(userProgress);
            return new ResponseEntity<>(savedUserProgress, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserProgressById(@PathVariable Long id) {
        try {
            UserProgress userProgress = userProgressService.getUserProgressById(id)
                    .orElseThrow(() -> new RuntimeException("Progress record not found"));

            // Validate user owns this progress record
            userContext.validateCurrentUserOwnership(userProgress.getUser().getId());

            return ResponseEntity.ok(userProgress);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<UserProgress>> getAllUserProgress() {
        // Only return current user's progress
        Long currentUserId = userContext.getCurrentUserId();
        List<UserProgress> progressList = userProgressService.getUserProgressByUserId(currentUserId);
        return ResponseEntity.ok(progressList);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserProgressByUserId(@PathVariable Long userId) {
        try {
            // Users can only access their own progress
            userContext.validateCurrentUserOwnership(userId);

            List<UserProgress> progressList = userProgressService.getUserProgressByUserId(userId);
            return ResponseEntity.ok(progressList);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<?> getUserProgressByQuizId(@PathVariable Long quizId) {
        try {
            // Get current user's progress for this quiz only
            Long currentUserId = userContext.getCurrentUserId();
            List<UserProgress> progressList = userProgressService.getUserProgressByUserIdAndQuizId(currentUserId, quizId);
            return ResponseEntity.ok(progressList);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}/quiz/{quizId}")
    public ResponseEntity<?> getUserProgressByUserIdAndQuizId(
            @PathVariable Long userId, @PathVariable Long quizId) {
        try {
            // Users can only access their own progress
            userContext.validateCurrentUserOwnership(userId);

            List<UserProgress> progressList = userProgressService.getUserProgressByUserIdAndQuizId(userId, quizId);
            return ResponseEntity.ok(progressList);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUserProgress(@PathVariable Long id) {
        try {
            UserProgress userProgress = userProgressService.getUserProgressById(id)
                    .orElseThrow(() -> new RuntimeException("Progress record not found"));

            // Validate user owns this progress record
            userContext.validateCurrentUserOwnership(userProgress.getUser().getId());

            userProgressService.deleteUserProgress(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getUserDashboard() {
        try {
            Long currentUserId = userContext.getCurrentUserId();
            Map<String, Object> dashboard = userProgressService.getUserDashboard(currentUserId);
            return ResponseEntity.ok(dashboard);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getUserStats() {
        try {
            Long currentUserId = userContext.getCurrentUserId();
            Map<String, Object> stats = userProgressService.getUserStats(currentUserId);
            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/recent")
    public ResponseEntity<?> getRecentProgress(@RequestParam(defaultValue = "10") int limit) {
        try {
            Long currentUserId = userContext.getCurrentUserId();
            List<UserProgress> recentProgress = userProgressService.getRecentProgressByUserId(currentUserId, limit);
            return ResponseEntity.ok(recentProgress);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}