package com.thesis.interactive_learning.service;

import com.thesis.interactive_learning.model.Document;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface DocumentService {
    Document saveDocument(Document document);
    Document uploadDocument(MultipartFile file, String title, String description,Long userId, Long collectionId) throws IOException;
    Optional<Document> getDocumentById(Long id);
    List<Document> getAllDocuments();
    List<Document> getDocumentsByUserId(Long userId);
    List<Document> getDocumentsByCollectionId(Long collectionId);
    void deleteDocument(Long id);
    String extractTextFromPdf(Long documentId) throws IOException;

    Map<String, Object> extractStructuredTextFromPdf(Long documentId) throws IOException;
    Map<String, Object> extractDocumentMetadata(Long documentId) throws IOException;
}
