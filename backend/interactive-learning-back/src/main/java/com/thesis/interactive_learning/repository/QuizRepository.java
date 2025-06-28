package com.thesis.interactive_learning.repository;

import com.thesis.interactive_learning.model.Quiz;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {

    List<Quiz> findByStudyCollectionId(Long collectionId);
    List<Quiz> findByDocumentId(Long documentId);
    List<Quiz> findByDocumentIdAndStudyCollectionId(Long documentId, Long collectionId);

    @Query("SELECT q FROM Quiz q WHERE q.document.user.id = :userId")
    List<Quiz> findByDocumentUserId(@Param("userId") Long userId);

    @Query("SELECT q FROM Quiz q WHERE q.studyCollection.id = :collectionId AND q.document.user.id = :userId")
    List<Quiz> findByStudyCollectionIdAndDocumentUserId(@Param("collectionId") Long collectionId, @Param("userId") Long userId);

    @Query("SELECT q FROM Quiz q WHERE q.document.id = :documentId AND q.document.user.id = :userId")
    List<Quiz> findByDocumentIdAndDocumentUserId(@Param("documentId") Long documentId, @Param("userId") Long userId);

    @Query("SELECT q FROM Quiz q WHERE q.document.user.id = :userId AND q.microbitCompatible = :microbitCompatible")
    List<Quiz> findByDocumentUserIdAndMicrobitCompatible(@Param("userId") Long userId, @Param("microbitCompatible") boolean microbitCompatible);

    @Modifying
    @Transactional
    @Query("DELETE FROM Question q WHERE q.quiz.id = :quizId")
    int deleteByQuizId(@Param("quizId") Long quizId);
}