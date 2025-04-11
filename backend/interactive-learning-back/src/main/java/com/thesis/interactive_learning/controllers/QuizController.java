package com.thesis.interactive_learning.controllers;

import com.thesis.interactive_learning.model.Quiz;
import com.thesis.interactive_learning.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    private final QuizService quizService;

    @Autowired
    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @PostMapping
    public ResponseEntity<Quiz> createQuiz(@RequestBody Quiz quiz) {
        Quiz savedQuiz = quizService.saveQuiz(quiz);
        return new ResponseEntity<>(savedQuiz, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Quiz> getQuizById(@PathVariable Long id) {
        return quizService.getQuizById(id)
                .map(quiz -> new ResponseEntity<>(quiz, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping
    public ResponseEntity<List<Quiz>> getAllQuizzes() {
        List<Quiz> quizzes = quizService.getAllQuizzes();
        return new ResponseEntity<>(quizzes, HttpStatus.OK);
    }

    @GetMapping("/collection/{collectionId}")
    public ResponseEntity<List<Quiz>> getQuizzesByCollectionId(@PathVariable Long collectionId) {
        List<Quiz> quizzes = quizService.getQuizzesByCollectionId(collectionId);
        return new ResponseEntity<>(quizzes, HttpStatus.OK);
    }

    @GetMapping("/document/{documentId}")
    public ResponseEntity<List<Quiz>> getQuizzesByDocumentId(@PathVariable Long documentId) {
        List<Quiz> quizzes = quizService.getQuizzesByDocumentId(documentId);
        return new ResponseEntity<>(quizzes, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Quiz> updateQuiz(@PathVariable Long id, @RequestBody Quiz quiz) {
        return quizService.getQuizById(id)
                .map(existingQuiz -> {
                    quiz.setId(id);
                    Quiz updatedQuiz = quizService.saveQuiz(quiz);
                    return new ResponseEntity<>(updatedQuiz, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id) {
        return quizService.getQuizById(id)
                .map(quiz -> {
                    quizService.deleteQuiz(id);
                    return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}