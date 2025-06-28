package com.thesis.interactive_learning.controllers;

import com.thesis.interactive_learning.model.User;
import com.thesis.interactive_learning.model.UserProgress;
import com.thesis.interactive_learning.security.UserContext;
import com.thesis.interactive_learning.service.UserProgressService;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

    // Update your getAllUserProgress method
    @GetMapping
    public ResponseEntity<List<UserProgressDTO>> getAllUserProgress() {
        try {
            System.out.println("=== PROGRESS ENDPOINT DEBUG ===");

            Long currentUserId = userContext.getCurrentUserId();
            System.out.println("Current user ID: " + currentUserId);

            System.out.println("Calling userProgressService.getUserProgressByUserId...");
            List<UserProgress> progressList = userProgressService.getUserProgressByUserId(currentUserId);
            System.out.println("Service returned: " + (progressList != null ? progressList.size() : "null") + " items");


            List<UserProgressDTO> progressDTOs = progressList.stream()
                    .map(UserProgressDTO::new)
                    .collect(Collectors.toList());

            System.out.println("Returning OK response with " + progressDTOs.size() + " DTOs");
            return ResponseEntity.ok(progressDTOs);

        } catch (Exception e) {
            System.out.println("ERROR in getAllUserProgress: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
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
            System.out.println("=== RECENT PROGRESS ENDPOINT DEBUG ===");

            Long currentUserId = userContext.getCurrentUserId();
            System.out.println("Current user ID: " + currentUserId);
            System.out.println("Limit: " + limit);

            List<UserProgress> recentProgress = userProgressService.getRecentProgressByUserId(currentUserId, limit);
            System.out.println("Service returned: " + (recentProgress != null ? recentProgress.size() : "null") + " items");
            
            List<Map<String, Object>> simplifiedRecent = recentProgress.stream()
                    .map(progress -> {
                        Map<String, Object> item = new HashMap<>();
                        item.put("id", progress.getId());
                        item.put("completedAt", progress.getCompletedAt());
                        item.put("totalQuestions", progress.getTotalQuestions());
                        item.put("correctAnswers", progress.getCorrectAnswers());
                        item.put("score", progress.getScore());
                        item.put("completionTimeSeconds", progress.getCompletionTimeSeconds());
                        item.put("accuracyPercentage", progress.getAccuracyPercentage());

                        // Add basic quiz info without circular references
                        if (progress.getQuiz() != null) {
                            Map<String, Object> quiz = new HashMap<>();
                            quiz.put("id", progress.getQuiz().getId());
                            quiz.put("title", progress.getQuiz().getTitle());
                            item.put("quiz", quiz);
                        }

                        // Format for frontend activity feed
                        item.put("type", "quiz_completed");
                        item.put("title", progress.getQuiz() != null ? progress.getQuiz().getTitle() : "Quiz");
                        item.put("description", "Completed with " + (progress.getScore() != null ? progress.getScore() : 0) + "% score");
                        item.put("action", "completed");
                        if (progress.getCompletionTimeSeconds() != null) {
                            item.put("duration", Math.round(progress.getCompletionTimeSeconds() / 60.0)); // minutes
                        }

                        return item;
                    })
                    .collect(Collectors.toList());

            System.out.println("Returning OK response with " + simplifiedRecent.size() + " recent items");
            return ResponseEntity.ok(simplifiedRecent);

        } catch (Exception e) {
            System.out.println("ERROR in getRecentProgress: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/debug")
    public ResponseEntity<?> debugCurrentUser() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            System.out.println("Authentication: " + auth);
            System.out.println("Principal: " + auth.getPrincipal());
            System.out.println("Is authenticated: " + auth.isAuthenticated());

            User currentUser = userContext.getCurrentUser();
            System.out.println("Current user: " + currentUser.getUsername() + " (ID: " + currentUser.getId() + ")");

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "userId", currentUser.getId(),
                    "username", currentUser.getUsername(),
                    "message", "Authentication working!"
            ));
        } catch (Exception e) {
            System.out.println("Debug error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @Setter
    @Getter
    public static class UserProgressDTO {
        // Getters and setters
        private Long id;
        private Long userId;
        private String username;
        private Long quizId;
        private String quizTitle;
        private LocalDateTime completedAt;
        private Integer totalQuestions;
        private Integer correctAnswers;
        private Integer score;
        private Long completionTimeSeconds;
        private Double accuracyPercentage;


        public UserProgressDTO(UserProgress progress) {
            this.id = progress.getId();
            this.userId = progress.getUser() != null ? progress.getUser().getId() : null;
            this.username = progress.getUser() != null ? progress.getUser().getUsername() : null;
            this.quizId = progress.getQuiz() != null ? progress.getQuiz().getId() : null;
            this.quizTitle = progress.getQuiz() != null ? progress.getQuiz().getTitle() : null;
            this.completedAt = progress.getCompletedAt();
            this.totalQuestions = progress.getTotalQuestions();
            this.correctAnswers = progress.getCorrectAnswers();
            this.score = progress.getScore();
            this.completionTimeSeconds = progress.getCompletionTimeSeconds();
            this.accuracyPercentage = progress.getAccuracyPercentage();
        }

    }


}