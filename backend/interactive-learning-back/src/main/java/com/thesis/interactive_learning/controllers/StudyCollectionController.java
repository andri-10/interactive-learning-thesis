package com.thesis.interactive_learning.controllers;

import com.thesis.interactive_learning.model.AuditLog;
import com.thesis.interactive_learning.model.StudyCollection;
import com.thesis.interactive_learning.security.UserContext;
import com.thesis.interactive_learning.service.AuditLogService;
import com.thesis.interactive_learning.service.StudyCollectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/collections")
public class StudyCollectionController {
    private final StudyCollectionService studyCollectionService;
    private final UserContext userContext;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    public StudyCollectionController(StudyCollectionService studyCollectionService, UserContext userContext) {
        this.studyCollectionService = studyCollectionService;
        this.userContext = userContext;
    }

    @PostMapping
    public ResponseEntity<?> createCollection(@RequestBody StudyCollection collection) {
        try {
            Long currentUserId = userContext.getCurrentUserId();
            collection.setUser(null);
            collection.setId(null);

            StudyCollection savedCollection = studyCollectionService.saveCollectionForUser(collection, currentUserId);

            auditLogService.logUserAction(AuditLog.LogAction.COLLECTION_CREATED,
                    "Collection created: '" + savedCollection.getName() + "'");

            return new ResponseEntity<>(savedCollection, HttpStatus.CREATED);
        } catch (Exception e) {
            auditLogService.logError("Collection creation failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Failed to create collection: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCollectionById(@PathVariable Long id) {
        try {
            StudyCollection collection = studyCollectionService.getCollectionById(id)
                    .orElseThrow(() -> new RuntimeException("Collection not found"));

            // Validate user ownership
            userContext.validateCollectionOwnership(collection);

            return ResponseEntity.ok(collection);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<StudyCollection>> getAllCollections() {
        // Only return collections owned by current user
        Long currentUserId = userContext.getCurrentUserId();
        List<StudyCollection> collections = studyCollectionService.getCollectionsByUserId(currentUserId);
        return ResponseEntity.ok(collections);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getCollectionsByUserId(@PathVariable Long userId) {
        try {
            // Users can only access their own collections
            userContext.validateCurrentUserOwnership(userId);

            List<StudyCollection> collections = studyCollectionService.getCollectionsByUserId(userId);
            return ResponseEntity.ok(collections);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCollection(@PathVariable Long id, @RequestBody StudyCollection collection) {
        try {
            // Validate collection ownership
            StudyCollection existingCollection = studyCollectionService.getCollectionById(id)
                    .orElseThrow(() -> new RuntimeException("Collection not found"));
            userContext.validateCollectionOwnership(existingCollection);

            // Preserve the original user and ID
            collection.setId(id);
            collection.setUser(existingCollection.getUser());

            StudyCollection updatedCollection = studyCollectionService.saveCollection(collection);
            return ResponseEntity.ok(updatedCollection);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCollection(@PathVariable Long id) {
        try {
            StudyCollection collection = studyCollectionService.getCollectionById(id)
                    .orElseThrow(() -> new RuntimeException("Collection not found"));
            userContext.validateCollectionOwnership(collection);

            String collectionName = collection.getName();
            studyCollectionService.deleteCollection(id);

            auditLogService.log(AuditLog.LogLevel.INFO, AuditLog.LogAction.COLLECTION_DELETED,
                    "Collection deleted: '" + collectionName + "'", "Collection", id);

            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            auditLogService.logError("Collection deletion failed for ID " + id + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<?> getCollectionStats(@PathVariable Long id) {
        try {
            StudyCollection collection = studyCollectionService.getCollectionById(id)
                    .orElseThrow(() -> new RuntimeException("Collection not found"));

            // Validate user ownership
            userContext.validateCollectionOwnership(collection);

            Map<String, Object> stats = studyCollectionService.getCollectionStats(id);
            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}