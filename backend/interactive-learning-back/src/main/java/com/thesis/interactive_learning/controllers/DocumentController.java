package com.thesis.interactive_learning.controllers;

import com.thesis.interactive_learning.dto.BulkCollectionUpdateRequest;
import com.thesis.interactive_learning.model.Document;
import com.thesis.interactive_learning.model.Quiz;
import com.thesis.interactive_learning.security.UserContext;
import com.thesis.interactive_learning.service.DocumentService;
import com.thesis.interactive_learning.repository.QuizRepository;
import com.thesis.interactive_learning.service.AuditLogService;
import com.thesis.interactive_learning.model.AuditLog;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired
    private AuditLogService auditLogService;

    private final DocumentService documentService;
    private final QuizRepository quizRepository;
    private final UserContext userContext;

    @Autowired
    public DocumentController(DocumentService documentService, QuizRepository quizRepository, UserContext userContext) {
        this.documentService = documentService;
        this.quizRepository = quizRepository;
        this.userContext = userContext;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "collectionId", required = false) Long collectionId) {

        try {
            Long currentUserId = userContext.getCurrentUserId();
            Document document = documentService.uploadDocument(file, title, description, currentUserId, collectionId);

            auditLogService.logUserAction(AuditLog.LogAction.DOCUMENT_UPLOADED,
                    "Document uploaded: '" + title + "' (" + file.getSize() + " bytes)");

            return new ResponseEntity<>(document, HttpStatus.CREATED);
        } catch (IOException e) {
            auditLogService.logError("Document upload failed for '" + title + "': " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "File upload failed: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDocumentById(@PathVariable Long id) {
        try {
            Document document = documentService.getDocumentById(id)
                    .orElseThrow(() -> new RuntimeException("Document not found"));

            // Validate user ownership
            userContext.validateDocumentOwnership(document);

            return ResponseEntity.ok(document);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Document>> getAllDocuments() {
        // Only return documents owned by current user
        Long currentUserId = userContext.getCurrentUserId();
        List<Document> documents = documentService.getDocumentsByUserId(currentUserId);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getDocumentsByUserId(@PathVariable Long userId) {
        try {
            // Users can only access their own documents
            userContext.validateCurrentUserOwnership(userId);

            List<Document> documents = documentService.getDocumentsByUserId(userId);
            return ResponseEntity.ok(documents);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/collection/{collectionId}")
    public ResponseEntity<?> getDocumentsByCollectionId(@PathVariable Long collectionId) {
        try {
            // Get current user's documents from the collection
            Long currentUserId = userContext.getCurrentUserId();
            List<Document> documents = documentService.getDocumentsByCollectionIdAndUserId(collectionId, currentUserId);
            return ResponseEntity.ok(documents);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/text")
    public ResponseEntity<?> extractTextFromDocument(@PathVariable Long id) {
        try {
            // Validate document ownership first
            Document document = documentService.getDocumentById(id)
                    .orElseThrow(() -> new RuntimeException("Document not found"));
            userContext.validateDocumentOwnership(document);

            String text = documentService.extractTextFromPdf(id);
            return ResponseEntity.ok(text);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to extract text: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/structured-text")
    public ResponseEntity<?> extractStructuredTextFromDocument(@PathVariable Long id) {
        try {
            // Validate document ownership first
            Document document = documentService.getDocumentById(id)
                    .orElseThrow(() -> new RuntimeException("Document not found"));
            userContext.validateDocumentOwnership(document);

            Map<String, Object> structuredText = documentService.extractStructuredTextFromPdf(id);
            return ResponseEntity.ok(structuredText);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to extract structured text: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long id) {
        try {
            Document document = documentService.getDocumentById(id)
                    .orElseThrow(() -> new RuntimeException("Document not found"));
            userContext.validateDocumentOwnership(document);

            String documentTitle = document.getTitle();
            documentService.deleteDocument(id);

            auditLogService.log(AuditLog.LogLevel.INFO, AuditLog.LogAction.DOCUMENT_DELETED,
                    "Document deleted: '" + documentTitle + "'", "Document", id);

            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            auditLogService.logError("Document deletion failed for ID " + id + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/collection")
    public ResponseEntity<?> updateDocumentCollection(
            @PathVariable Long id,
            @RequestParam(required = false) Long collectionId) {
        try {
            // Validate document ownership
            Document document = documentService.getDocumentById(id)
                    .orElseThrow(() -> new RuntimeException("Document not found"));
            userContext.validateDocumentOwnership(document);

            // If collectionId is provided, validate collection ownership
            if (collectionId != null) {
                // This will be implemented when we update collection service
                // For now, we'll validate in the service layer
            }

            Document updatedDocument = documentService.updateDocumentCollection(id, collectionId);

            // Get updated quiz count for response
            List<Quiz> updatedQuizzes = quizRepository.findByDocumentId(id);

            Map<String, Object> response = new HashMap<>();
            response.put("document", updatedDocument);
            response.put("updatedQuizzesCount", updatedQuizzes.size());
            response.put("message", "Document and " + updatedQuizzes.size() + " associated quizzes updated successfully");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/collection")
    public ResponseEntity<?> removeDocumentFromCollection(@PathVariable Long id) {
        try {
            // Validate document ownership
            Document document = documentService.getDocumentById(id)
                    .orElseThrow(() -> new RuntimeException("Document not found"));
            userContext.validateDocumentOwnership(document);

            Document updatedDocument = documentService.removeDocumentFromCollection(id);
            return ResponseEntity.ok(updatedDocument);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/available")
    public ResponseEntity<List<Document>> getAvailableDocuments() {
        // Only return current user's documents that are not in any collection
        Long currentUserId = userContext.getCurrentUserId();
        List<Document> documents = documentService.getAvailableDocumentsByUserId(currentUserId);
        return ResponseEntity.ok(documents);
    }

    @PostMapping("/bulk-collection-update")
    public ResponseEntity<?> bulkUpdateDocumentCollection(
            @RequestBody BulkCollectionUpdateRequest request) {
        try {
            int documentsUpdated = 0;
            int quizzesUpdated = 0;

            for (Long documentId : request.getDocumentIds()) {
                // Validate ownership of each document
                Document document = documentService.getDocumentById(documentId)
                        .orElseThrow(() -> new RuntimeException("Document not found: " + documentId));
                userContext.validateDocumentOwnership(document);

                Document updatedDoc = documentService.updateDocumentCollection(documentId, request.getCollectionId());
                documentsUpdated++;

                // Count associated quizzes that were also moved
                List<Quiz> documentQuizzes = quizRepository.findByDocumentId(documentId);
                quizzesUpdated += documentQuizzes.size();
            }

            Map<String, Object> response = new HashMap<>();
            response.put("documentsUpdated", documentsUpdated);
            response.put("quizzesUpdated", quizzesUpdated);
            response.put("message", String.format("Updated %d documents and %d quizzes", documentsUpdated, quizzesUpdated));

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update documents: " + e.getMessage()));
        }
    }
}