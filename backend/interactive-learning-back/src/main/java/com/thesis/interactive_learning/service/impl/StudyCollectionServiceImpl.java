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
        return studyCollectionRepository.save(collection);
    }

    @Override
    public Optional<StudyCollection> getCollectionById(Long id) {
        return studyCollectionRepository.findById(id);
    }

    @Override
    public List<StudyCollection> getAllCollections() {
        return studyCollectionRepository.findAll();
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


