package com.thesis.interactive_learning.service.impl;

import com.thesis.interactive_learning.model.StudyCollection;
import com.thesis.interactive_learning.model.User;
import com.thesis.interactive_learning.repository.DocumentRepository;
import com.thesis.interactive_learning.repository.QuizRepository;
import com.thesis.interactive_learning.repository.StudyCollectionRepository;
import com.thesis.interactive_learning.repository.UserRepository;
import com.thesis.interactive_learning.service.StudyCollectionService;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class StudyCollectionServiceImpl implements StudyCollectionService {

    private final StudyCollectionRepository studyCollectionRepository;
    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final QuizRepository quizRepository;

    public StudyCollectionServiceImpl(StudyCollectionRepository studyCollectionRepository,
                                      UserRepository userRepository,
                                      DocumentRepository documentRepository,
                                      QuizRepository quizRepository) {
        this.studyCollectionRepository = studyCollectionRepository;
        this.userRepository = userRepository;
        this.documentRepository = documentRepository;
        this.quizRepository = quizRepository;
    }

    @Override
    public StudyCollection saveCollection(StudyCollection collection) {
        System.out.println("Saving collection: " + collection.getName());

        // Validate that user is set
        if (collection.getUser() == null) {
            throw new RuntimeException("Collection must have a user assigned");
        }

        StudyCollection saved = studyCollectionRepository.save(collection);

        // Refresh the entity to get updated associations
        saved = studyCollectionRepository.findById(saved.getId()).orElse(saved);

        // Populate transient fields for JSON response
        populateTransientFields(saved);

        System.out.println("Collection saved with ID: " + saved.getId());
        return saved;
    }

    @Override
    public StudyCollection saveCollectionForUser(StudyCollection collection, Long userId) {
        System.out.println("Creating collection for user ID: " + userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Set the user for the collection
        collection.setUser(user);

        return saveCollection(collection);
    }

    @Override
    public Optional<StudyCollection> getCollectionById(Long id) {
        Optional<StudyCollection> collection = studyCollectionRepository.findById(id);
        collection.ifPresent(this::populateTransientFields);
        return collection;
    }

    @Override
    public List<StudyCollection> getAllCollections() {
        List<StudyCollection> collections = studyCollectionRepository.findAll();

        // Populate transient fields for each collection
        for (StudyCollection collection : collections) {
            populateTransientFields(collection);
        }

        return collections;
    }

    @Override
    public List<StudyCollection> getCollectionsByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<StudyCollection> collections = studyCollectionRepository.findByUser(user);

        // Populate transient fields for each collection
        for (StudyCollection collection : collections) {
            populateTransientFields(collection);
        }

        return collections;
    }

    @Override
    public void deleteCollection(Long id) {
        // Check if collection exists
        StudyCollection collection = studyCollectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Collection not found"));

        System.out.println("Deleting collection: " + collection.getName());

        // Before deleting, remove collection reference from all documents and quizzes
        // This prevents orphaned references
        var documents = documentRepository.findByStudyCollectionId(id);
        for (var document : documents) {
            document.setStudyCollection(null);
            documentRepository.save(document);
        }

        var quizzes = quizRepository.findByStudyCollectionId(id);
        for (var quiz : quizzes) {
            quiz.setStudyCollection(null);
            quizRepository.save(quiz);
        }

        System.out.println("Removed collection reference from " + documents.size() +
                " documents and " + quizzes.size() + " quizzes");

        studyCollectionRepository.deleteById(id);
        System.out.println("Collection deleted successfully");
    }

    @Override
    public Map<String, Object> getCollectionStats(Long collectionId) {
        StudyCollection collection = studyCollectionRepository.findById(collectionId)
                .orElseThrow(() -> new RuntimeException("Collection not found"));

        Map<String, Object> stats = new HashMap<>();

        // Count documents and quizzes
        int documentCount = documentRepository.findByStudyCollectionId(collectionId).size();
        int quizCount = quizRepository.findByStudyCollectionId(collectionId).size();

        stats.put("collectionId", collectionId);
        stats.put("collectionName", collection.getName());
        stats.put("documentCount", documentCount);
        stats.put("quizCount", quizCount);
        stats.put("totalItems", documentCount + quizCount);
        stats.put("userId", collection.getUser().getId());
        stats.put("userName", collection.getUser().getUsername());

        // Calculate additional statistics
        var documents = documentRepository.findByStudyCollectionId(collectionId);
        long totalFileSize = documents.stream()
                .mapToLong(doc -> doc.getFileSize() != null ? doc.getFileSize() : 0)
                .sum();

        int totalPages = documents.stream()
                .mapToInt(doc -> doc.getPageCount() != null ? doc.getPageCount() : 0)
                .sum();

        stats.put("totalFileSize", totalFileSize);
        stats.put("totalPages", totalPages);
        stats.put("averagePagesPerDocument", documentCount > 0 ? (double) totalPages / documentCount : 0);

        return stats;
    }

    private void populateTransientFields(StudyCollection collection) {
        if (collection.getUser() != null) {
            collection.setUserId(collection.getUser().getId());
        }
        collection.setDocumentCount(collection.getDocuments() != null ? collection.getDocuments().size() : 0);
        collection.setQuizCount(collection.getQuizzes() != null ? collection.getQuizzes().size() : 0);
    }
}