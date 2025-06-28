package com.thesis.interactive_learning.service;

import com.thesis.interactive_learning.model.StudyCollection;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface StudyCollectionService {
    StudyCollection saveCollection(StudyCollection collection);
    StudyCollection saveCollectionForUser(StudyCollection collection, Long userId);
    Optional<StudyCollection> getCollectionById(Long id);
    List<StudyCollection> getAllCollections();
    List<StudyCollection> getCollectionsByUserId(Long userId);
    void deleteCollection(Long id);
    Map<String, Object> getCollectionStats(Long collectionId);
}