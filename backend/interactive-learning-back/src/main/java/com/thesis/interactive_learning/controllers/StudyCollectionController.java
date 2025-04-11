package com.thesis.interactive_learning.controllers;

import com.thesis.interactive_learning.model.StudyCollection;
import com.thesis.interactive_learning.service.StudyCollectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/collections")
public class StudyCollectionController {
    private final StudyCollectionService studyCollectionService;

    @Autowired
    public StudyCollectionController(StudyCollectionService studyCollectionService) {
        this.studyCollectionService = studyCollectionService;
    }

    @PostMapping
    public ResponseEntity<StudyCollection> createCollection(@RequestBody StudyCollection collection) {
        StudyCollection savedCollection = studyCollectionService.saveCollection(collection);
        return new ResponseEntity<>(savedCollection, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudyCollection> getCollectionById(@PathVariable Long id) {
        return studyCollectionService.getCollectionById(id)
                .map(collection -> new ResponseEntity<>(collection, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping
    public ResponseEntity<List<StudyCollection>> getAllCollections() {
        List<StudyCollection> collections = studyCollectionService.getAllCollections();
        return new ResponseEntity<>(collections, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<StudyCollection>> getCollectionsByUserId(@PathVariable Long userId) {
        try {
            List<StudyCollection> collections = studyCollectionService.getCollectionsByUserId(userId);
            return new ResponseEntity<>(collections, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudyCollection> updateCollection(@PathVariable Long id, @RequestBody StudyCollection collection) {
        return studyCollectionService.getCollectionById(id)
                .map(existingCollection -> {
                    collection.setId(id);
                    StudyCollection updatedCollection = studyCollectionService.saveCollection(collection);
                    return new ResponseEntity<>(updatedCollection, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCollection(@PathVariable Long id) {
        return studyCollectionService.getCollectionById(id)
                .map(collection -> {
                    studyCollectionService.deleteCollection(id);
                    return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

}
