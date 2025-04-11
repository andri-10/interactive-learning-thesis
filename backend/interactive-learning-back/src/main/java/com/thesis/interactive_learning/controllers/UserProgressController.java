package com.thesis.interactive_learning.controllers;

import com.thesis.interactive_learning.model.UserProgress;
import com.thesis.interactive_learning.service.UserProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
public class UserProgressController {

    private final UserProgressService userProgressService;

    @Autowired
    public UserProgressController(UserProgressService userProgressService) {
        this.userProgressService = userProgressService;
    }

    @PostMapping
    public ResponseEntity<UserProgress> createUserProgress(@RequestBody UserProgress userProgress) {
        UserProgress savedUserProgress = userProgressService.saveUserProgress(userProgress);
        return new ResponseEntity<>(savedUserProgress, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProgress> getUserProgressById(@PathVariable Long id) {
        return userProgressService.getUserProgressById(id)
                .map(userProgress -> new ResponseEntity<>(userProgress, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping
    public ResponseEntity<List<UserProgress>> getAllUserProgress() {
        List<UserProgress> progressList = userProgressService.getAllUserProgress();
        return new ResponseEntity<>(progressList, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserProgress>> getUserProgressByUserId(@PathVariable Long userId) {
        List<UserProgress> progressList = userProgressService.getUserProgressByUserId(userId);
        return new ResponseEntity<>(progressList, HttpStatus.OK);
    }

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<UserProgress>> getUserProgressByQuizId(@PathVariable Long quizId) {
        List<UserProgress> progressList = userProgressService.getUserProgressByQuizId(quizId);
        return new ResponseEntity<>(progressList, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}/quiz/{quizId}")
    public ResponseEntity<List<UserProgress>> getUserProgressByUserIdAndQuizId(
            @PathVariable Long userId, @PathVariable Long quizId) {
        List<UserProgress> progressList = userProgressService.getUserProgressByUserIdAndQuizId(userId, quizId);
        return new ResponseEntity<>(progressList, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserProgress(@PathVariable Long id) {
        return userProgressService.getUserProgressById(id)
                .map(userProgress -> {
                    userProgressService.deleteUserProgress(id);
                    return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}