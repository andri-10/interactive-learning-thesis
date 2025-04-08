package com.thesis.interactive_learning.repository;

import com.thesis.interactive_learning.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByStudyCollectionId(Long collectionId);
    List<Quiz> findByDocumentId(Long documentId);
}
