package com.thesis.interactive_learning.controllers;

import com.thesis.interactive_learning.security.UserContext;
import com.thesis.interactive_learning.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final UserContext userContext;

    @Autowired
    public AdminController(AdminService adminService, UserContext userContext) {
        this.adminService = adminService;
        this.userContext = userContext;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getAdminDashboard() {
        try {
            // Ensure current user is admin
            validateAdminAccess();

            Map<String, Object> dashboard = adminService.getAdminDashboard();
            return ResponseEntity.ok(dashboard);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "20") int size) {
        try {
            validateAdminAccess();

            Map<String, Object> users = adminService.getAllUsersWithPagination(page, size);
            return ResponseEntity.ok(users);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserDetails(@PathVariable Long userId) {
        try {
            validateAdminAccess();

            Map<String, Object> userDetails = adminService.getUserDetails(userId);
            return ResponseEntity.ok(userDetails);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long userId,
                                              @RequestBody Map<String, Object> statusUpdate) {
        try {
            validateAdminAccess();

            boolean enabled = (Boolean) statusUpdate.get("enabled");
            Map<String, Object> result = adminService.updateUserStatus(userId, enabled);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/content/overview")
    public ResponseEntity<?> getContentOverview() {
        try {
            validateAdminAccess();

            Map<String, Object> overview = adminService.getContentOverview();
            return ResponseEntity.ok(overview);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/analytics/platform")
    public ResponseEntity<?> getPlatformAnalytics(@RequestParam(defaultValue = "30") int days) {
        try {
            validateAdminAccess();

            Map<String, Object> analytics = adminService.getPlatformAnalytics(days);
            return ResponseEntity.ok(analytics);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/analytics/users")
    public ResponseEntity<?> getUserAnalytics() {
        try {
            validateAdminAccess();

            Map<String, Object> analytics = adminService.getUserAnalytics();
            return ResponseEntity.ok(analytics);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/content/popular")
    public ResponseEntity<?> getPopularContent(@RequestParam(defaultValue = "10") int limit) {
        try {
            validateAdminAccess();

            Map<String, Object> popular = adminService.getPopularContent(limit);
            return ResponseEntity.ok(popular);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/system/stats")
    public ResponseEntity<?> getSystemStats() {
        try {
            validateAdminAccess();

            Map<String, Object> stats = adminService.getSystemStats();
            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/microbit/usage")
    public ResponseEntity<?> getMicrobitUsage(@RequestParam(defaultValue = "7") int days) {
        try {
            validateAdminAccess();

            Map<String, Object> usage = adminService.getMicrobitUsage(days);
            return ResponseEntity.ok(usage);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/content/documents/{documentId}")
    public ResponseEntity<?> deleteAnyDocument(@PathVariable Long documentId) {
        try {
            validateAdminAccess();

            Map<String, Object> result = adminService.deleteDocument(documentId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/content/quizzes/{quizId}")
    public ResponseEntity<?> deleteAnyQuiz(@PathVariable Long quizId) {
        try {
            validateAdminAccess();

            Map<String, Object> result = adminService.deleteQuiz(quizId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/logs/recent")
    public ResponseEntity<?> getRecentLogs(@RequestParam(defaultValue = "100") int limit) {
        try {
            validateAdminAccess();

            Map<String, Object> logs = adminService.getRecentSystemLogs(limit);
            return ResponseEntity.ok(logs);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    private void validateAdminAccess() {
        // This will be implemented once you show me your Role enum structure
        // For now, we'll check if user has admin role
        var currentUser = userContext.getCurrentUser();

        // Assuming your Role enum has ADMIN value
        if (currentUser.getRole() == null || !currentUser.getRole().toString().equals("ADMIN")) {
            throw new RuntimeException("Admin access required");
        }
    }
}