package com.thesis.interactive_learning.repository;


import com.thesis.interactive_learning.model.Document;
import com.thesis.interactive_learning.model.User;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository {

    List<Document> findByUser(User user);
    List<Document> findByStudyCollection(Long collectionId);

}
