package com.thesis.interactive_learning.service.impl;

import com.thesis.interactive_learning.model.StudyCollection;
import com.thesis.interactive_learning.model.User;
import com.thesis.interactive_learning.repository.StudyCollectionRepository;
import com.thesis.interactive_learning.repository.UserRepository;
import com.thesis.interactive_learning.service.StudyCollectionService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StudyCollectionServiceImpl implements StudyCollectionService {

    private final StudyCollectionRepository studyCollectionRepository;
    private final UserRepository userRepository;

    public StudyCollectionServiceImpl(StudyCollectionRepository studyCollectionRepository, UserRepository userRepository) {
        this.studyCollectionRepository = studyCollectionRepository;
        this.userRepository = userRepository;
    }

    @Override
    public StudyCollection saveCollection(StudyCollection collection) {
        System.out.println("Saving collection: " + collection.getName());

        // If user is not set, assign a default user
        if (collection.getUser() == null) {
            Optional<User> defaultUser = userRepository.findById(1L);
            if (defaultUser.isPresent()) {
                collection.setUser(defaultUser.get());
                System.out.println("Assigned default user to collection");
            } else {
                throw new RuntimeException("Default user not found");
            }
        }

        StudyCollection saved = studyCollectionRepository.save(collection);

        // Populate transient fields for JSON response
        saved.setUserId(saved.getUser().getId());
        saved.setDocumentCount(saved.getDocuments().size());
        saved.setQuizCount(saved.getQuizzes().size());

        System.out.println("Collection saved with ID: " + saved.getId());
        return saved;
    }


    @Override
    public Optional<StudyCollection> getCollectionById(Long id) {
        return studyCollectionRepository.findById(id);
    }

    @Override
    public List<StudyCollection> getAllCollections() {
        List<StudyCollection> collections = studyCollectionRepository.findAll();

        // Populate transient fields for each collection
        for (StudyCollection collection : collections) {
            if (collection.getUser() != null) {
                collection.setUserId(collection.getUser().getId());
            }
            collection.setDocumentCount(collection.getDocuments().size());
            collection.setQuizCount(collection.getQuizzes().size());
        }

        return collections;
    }

    @Override
    public List<StudyCollection> getCollectionsByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return studyCollectionRepository.findByUser(user);
    }

    @Override
    public void deleteCollection(Long id) {
        studyCollectionRepository.deleteById(id);
    }
}


