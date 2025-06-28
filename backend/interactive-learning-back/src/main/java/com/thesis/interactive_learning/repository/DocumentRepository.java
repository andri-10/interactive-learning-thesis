package com.thesis.interactive_learning.repository;

import com.thesis.interactive_learning.model.Document;
import com.thesis.interactive_learning.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByUser(User user);
    List<Document> findByStudyCollectionId(Long collectionId);
    List<Document> findByStudyCollectionIsNull();

    List<Document> findByUserAndStudyCollectionId(User user, Long collectionId);
    List<Document> findByUserAndStudyCollectionIsNull(User user);
}