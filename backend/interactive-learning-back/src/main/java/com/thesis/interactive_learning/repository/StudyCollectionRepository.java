package com.thesis.interactive_learning.repository;

import com.thesis.interactive_learning.model.StudyCollection;
import com.thesis.interactive_learning.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StudyCollectionRepository extends JpaRepository<StudyCollection, Long> {
    List<StudyCollection> findByUser(User user);
}
