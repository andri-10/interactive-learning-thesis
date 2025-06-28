package com.thesis.interactive_learning.service.impl;

import com.thesis.interactive_learning.model.Quiz;
import com.thesis.interactive_learning.model.User;
import com.thesis.interactive_learning.repository.QuizRepository;
import com.thesis.interactive_learning.repository.UserProgressRepository;
import com.thesis.interactive_learning.repository.UserRepository;
import com.thesis.interactive_learning.repository.DocumentRepository;
import com.thesis.interactive_learning.repository.StudyCollectionRepository;
import com.thesis.interactive_learning.service.QuizService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class QuizServiceImpl implements QuizService {

    private final QuizRepository quizRepository;
    private final UserProgressRepository userProgressRepository;
    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final StudyCollectionRepository studyCollectionRepository;

    @Autowired
    public QuizServiceImpl(QuizRepository quizRepository,
                           UserProgressRepository userProgressRepository,
                           UserRepository userRepository,
                           DocumentRepository documentRepository,
                           StudyCollectionRepository studyCollectionRepository) {
        this.quizRepository = quizRepository;
        this.userProgressRepository = userProgressRepository;
        this.userRepository = userRepository;
        this.documentRepository = documentRepository;
        this.studyCollectionRepository = studyCollectionRepository;
    }

    @Override
    public Quiz saveQuiz(Quiz quiz) {
        return quizRepository.save(quiz);
    }

    @Override
    public Optional<Quiz> getQuizById(Long id) {
        return quizRepository.findById(id);
    }

    @Override
    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    @Override
    public List<Quiz> getQuizzesByCollectionId(Long collectionId) {
        return quizRepository.findByStudyCollectionId(collectionId);
    }

    @Override
    public List<Quiz> getQuizzesByDocumentId(Long documentId) {
        return quizRepository.findByDocumentId(documentId);
    }

    @Transactional
    @Override
    public void deleteQuiz(Long id) {
        userProgressRepository.deleteByQuizId(id);
        quizRepository.deleteById(id);
    }

    @Override
    public List<Quiz> getQuizzesByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get all quizzes associated with user's documents
        return quizRepository.findByDocumentUserId(userId);
    }

    @Override
    public List<Quiz> getQuizzesByCollectionIdAndUserId(Long collectionId, Long userId) {
        // Validate collection belongs to user
        if (collectionId != null) {
            var collection = studyCollectionRepository.findById(collectionId)
                    .orElseThrow(() -> new RuntimeException("Collection not found"));

            if (!collection.getUser().getId().equals(userId)) {
                throw new RuntimeException("Access denied: Collection does not belong to the user");
            }
        }

        return quizRepository.findByStudyCollectionIdAndDocumentUserId(collectionId, userId);
    }

    @Override
    public List<Quiz> getQuizzesByDocumentIdAndUserId(Long documentId, Long userId) {
        // Validate document belongs to user
        var document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (!document.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied: Document does not belong to the user");
        }

        return quizRepository.findByDocumentIdAndDocumentUserId(documentId, userId);
    }

    @Override
    public List<Quiz> getMicrobitCompatibleQuizzesByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return quizRepository.findByDocumentUserIdAndMicrobitCompatible(userId, true);
    }

    @Override
    public Map<String, Object> getQuizStats(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        Map<String, Object> stats = new HashMap<>();

        // Basic quiz information
        stats.put("quizId", quizId);
        stats.put("quizTitle", quiz.getTitle());
        stats.put("questionCount", quiz.getQuestions() != null ? quiz.getQuestions().size() : 0);
        stats.put("microbitCompatible", quiz.isMicrobitCompatible());
        stats.put("createdAt", quiz.getCreatedAt());

        // Document information
        if (quiz.getDocument() != null) {
            stats.put("documentId", quiz.getDocument().getId());
            stats.put("documentTitle", quiz.getDocument().getTitle());
            stats.put("documentPages", quiz.getDocument().getPageCount());
        }

        // Collection information
        if (quiz.getStudyCollection() != null) {
            stats.put("collectionId", quiz.getStudyCollection().getId());
            stats.put("collectionName", quiz.getStudyCollection().getName());
        }

        // User progress statistics
        var progressList = userProgressRepository.findByQuizId(quizId);
        stats.put("totalAttempts", progressList.size());

        if (!progressList.isEmpty()) {
            double avgAccuracy = progressList.stream()
                    .mapToDouble(progress -> progress.getAccuracyPercentage() != null ? progress.getAccuracyPercentage() : 0.0)
                    .average()
                    .orElse(0.0);

            long avgCompletionTime = progressList.stream()
                    .mapToLong(progress -> progress.getCompletionTimeSeconds() != null ? progress.getCompletionTimeSeconds() : 0L)
                    .filter(time -> time > 0)
                    .average()
                    .stream()
                    .mapToLong(d -> (long) d)
                    .findFirst()
                    .orElse(0L);

            double bestAccuracy = progressList.stream()
                    .mapToDouble(progress -> progress.getAccuracyPercentage() != null ? progress.getAccuracyPercentage() : 0.0)
                    .max()
                    .orElse(0.0);

            stats.put("averageAccuracy", Math.round(avgAccuracy * 100.0) / 100.0);
            stats.put("bestAccuracy", Math.round(bestAccuracy * 100.0) / 100.0);
            stats.put("averageCompletionTimeSeconds", avgCompletionTime);
            stats.put("uniqueUsers", progressList.stream()
                    .map(progress -> progress.getUser().getId())
                    .collect(Collectors.toSet()).size());
        } else {
            stats.put("averageAccuracy", 0.0);
            stats.put("bestAccuracy", 0.0);
            stats.put("averageCompletionTimeSeconds", 0L);
            stats.put("uniqueUsers", 0);
        }

        // Question type breakdown
        if (quiz.getQuestions() != null && !quiz.getQuestions().isEmpty()) {
            Map<String, Long> questionTypes = quiz.getQuestions().stream()
                    .collect(Collectors.groupingBy(
                            question -> question.getQuestionType() != null ? question.getQuestionType() : "UNKNOWN",
                            Collectors.counting()
                    ));
            stats.put("questionTypeBreakdown", questionTypes);

            // Difficulty breakdown
            Map<String, Long> difficultyBreakdown = quiz.getQuestions().stream()
                    .collect(Collectors.groupingBy(
                            question -> {
                                if (question.getDifficultyLevel() == null) return "Unknown";
                                return switch (question.getDifficultyLevel()) {
                                    case 1 -> "Easy";
                                    case 2 -> "Medium";
                                    case 3 -> "Hard";
                                    default -> "Unknown";
                                };
                            },
                            Collectors.counting()
                    ));
            stats.put("difficultyBreakdown", difficultyBreakdown);
        }

        return stats;
    }
}