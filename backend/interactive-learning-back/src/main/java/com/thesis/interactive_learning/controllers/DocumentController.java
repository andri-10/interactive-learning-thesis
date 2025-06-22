package com.thesis.interactive_learning.controllers;

import com.thesis.interactive_learning.dto.BulkCollectionUpdateRequest;
import com.thesis.interactive_learning.model.Document;
import com.thesis.interactive_learning.model.Quiz;
import com.thesis.interactive_learning.service.DocumentService;
import com.thesis.interactive_learning.repository.QuizRepository;
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

    private final DocumentService documentService;
    private final QuizRepository quizRepository;

    @Autowired
    public DocumentController(DocumentService documentService, QuizRepository quizRepository) {
        this.documentService = documentService;
        this.quizRepository = quizRepository;
    }

    @PostMapping("/upload")
    public ResponseEntity<Document> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("userId") Long userId,
            @RequestParam(value = "collectionId", required = false) Long collectionId) {

        System.out.println("=== UPLOAD REQUEST RECEIVED ===");
        System.out.println("File: " + file.getOriginalFilename());
        System.out.println("Title: " + title);
        System.out.println("Description: " + description);
        System.out.println("UserId: " + userId);
        System.out.println("File size: " + file.getSize());
        System.out.println("Collection ID: " + collectionId);

        try {
            Document document = documentService.uploadDocument(file, title, description, userId, collectionId);
            return new ResponseEntity<>(document, HttpStatus.CREATED);
        } catch (IOException e) {
            System.out.println("IOException during upload: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (RuntimeException e) {
            System.out.println("RuntimeException during upload: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocumentById(@PathVariable Long id) {
        return documentService.getDocumentById(id)
                .map(document -> new ResponseEntity<>(document, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping
    public ResponseEntity<List<Document>> getAllDocuments() {
        List<Document> documents = documentService.getAllDocuments();
        return new ResponseEntity<>(documents, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Document>> getDocumentsByUserId(@PathVariable Long userId) {
        try {
            List<Document> documents = documentService.getDocumentsByUserId(userId);
            return new ResponseEntity<>(documents, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/collection/{collectionId}")
    public ResponseEntity<List<Document>> getDocumentsByCollectionId(@PathVariable Long collectionId) {
        List<Document> documents = documentService.getDocumentsByCollectionId(collectionId);
        return new ResponseEntity<>(documents, HttpStatus.OK);
    }

    @GetMapping("/{id}/text")
    public ResponseEntity<String> extractTextFromDocument(@PathVariable Long id) {
        try {
            String text = documentService.extractTextFromPdf(id);
            return new ResponseEntity<>(text, HttpStatus.OK);
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/{id}/structured-text")
    public ResponseEntity<Map<String, Object>> extractStructuredTextFromDocument(@PathVariable Long id) {
        try {
            Map<String, Object> structuredText = documentService.extractStructuredTextFromPdf(id);
            return new ResponseEntity<>(structuredText, HttpStatus.OK);
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        try {
            documentService.deleteDocument(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}/collection")
    public ResponseEntity<Map<String, Object>> updateDocumentCollection(
            @PathVariable Long id,
            @RequestParam(required = false) Long collectionId) {
        try {
            Document updatedDocument = documentService.updateDocumentCollection(id, collectionId);

            // Get updated quiz count for response
            List<Quiz> updatedQuizzes = quizRepository.findByDocumentId(id);

            Map<String, Object> response = new HashMap<>();
            response.put("document", updatedDocument);
            response.put("updatedQuizzesCount", updatedQuizzes.size());
            response.put("message", "Document and " + updatedQuizzes.size() + " associated quizzes updated successfully");

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}/collection")
    public ResponseEntity<Document> removeDocumentFromCollection(@PathVariable Long id) {
        try {
            Document updatedDocument = documentService.removeDocumentFromCollection(id);
            return new ResponseEntity<>(updatedDocument, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/available")
    public ResponseEntity<List<Document>> getAvailableDocuments() {
        List<Document> documents = documentService.getDocumentsByCollectionId(null);
        return new ResponseEntity<>(documents, HttpStatus.OK);
    }

    // Add this to DocumentController.java

    @PostMapping("/bulk-collection-update")
    public ResponseEntity<Map<String, Object>> bulkUpdateDocumentCollection(
            @RequestBody BulkCollectionUpdateRequest request) {
        try {
            int documentsUpdated = 0;
            int quizzesUpdated = 0;

            for (Long documentId : request.getDocumentIds()) {
                Document document = documentService.updateDocumentCollection(documentId, request.getCollectionId());
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
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update documents: " + e.getMessage()));
        }
    }


}
