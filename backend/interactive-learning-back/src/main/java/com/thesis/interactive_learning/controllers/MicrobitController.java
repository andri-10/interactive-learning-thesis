package com.thesis.interactive_learning.controllers;

import com.thesis.interactive_learning.microbit.ButtonType;
import com.thesis.interactive_learning.microbit.MicrobitService;
import com.thesis.interactive_learning.microbit.MovementType;
import com.thesis.interactive_learning.microbit.impl.MicrobitServiceImpl;
import com.thesis.interactive_learning.model.Question;
import com.thesis.interactive_learning.model.Quiz;
import com.thesis.interactive_learning.model.User;
import com.thesis.interactive_learning.model.UserProgress;
import com.thesis.interactive_learning.repository.UserRepository;
import com.thesis.interactive_learning.service.QuizService;
import com.thesis.interactive_learning.service.UserProgressService;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/microbit")
@RequiredArgsConstructor
public class MicrobitController {

    private final MicrobitService microbitService;
    private final QuizService quizService;
    private final UserProgressService userProgressService;
    private final UserRepository userRepository;

    // Track active quiz sessions
    private final Map<Long, ActiveQuizSession> activeSessions = new HashMap<>();

    @PostMapping("/connect")
    public ResponseEntity<?> connectMicrobit() {
        boolean connected = microbitService.initializeConnection();

        Map<String, Object> response = new HashMap<>();
        response.put("connected", connected);

        if (microbitService instanceof MicrobitServiceImpl) {
            response.put("activeWebSocketSessions", ((MicrobitServiceImpl) microbitService).getActiveWebSocketSessions());
        }

        if (connected) {
            response.put("status", "connected");
            response.put("message", "Micro:bit connected successfully");
        } else {
            response.put("status", "failed");
            response.put("message", "Could not connect to Micro:bit");
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/status")
    public ResponseEntity<?> getMicrobitStatus() {
        boolean connected = microbitService.isConnected();

        Map<String, Object> response = new HashMap<>();
        response.put("connected", connected);
        response.put("lastMovement", microbitService.getLastMovement().toString());
        response.put("lastButton", microbitService.getLastButton().toString());

        if (microbitService instanceof MicrobitServiceImpl) {
            response.put("activeWebSocketSessions", ((MicrobitServiceImpl) microbitService).getActiveWebSocketSessions());
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/quiz/{quizId}/start")
    public ResponseEntity<?> startQuiz(@PathVariable Long quizId, @RequestParam Long userId) {
        // Check if Micro:bit is connected
        if (!microbitService.isConnected()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Micro:bit not connected"));
        }

        // Get the quiz
        Quiz quiz = quizService.getQuizById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        // Check if quiz is Micro:bit compatible
        if (!quiz.isMicrobitCompatible()) {
            return ResponseEntity.badRequest().body(Map.of("error", "This quiz is not Micro:bit compatible"));
        }

        // Create a new session
        ActiveQuizSession session = new ActiveQuizSession(quiz, userId);
        activeSessions.put(quizId, session);

        // Set quiz context for WebSocket broadcasting
        if (microbitService instanceof MicrobitServiceImpl) {
            MicrobitServiceImpl impl = (MicrobitServiceImpl) microbitService;
            impl.setQuizContext("Quiz: " + quiz.getTitle());
            impl.broadcastQuizState(quizId, "started",
                    session.getCurrentQuestion() != null ? session.getCurrentQuestion().getQuestionText() : "Loading...");
        }

        // Start listening for Micro:bit inputs
        microbitService.startListening(
                // Movement handler
                movement -> {
                    handleMovement(session, movement);
                    // Broadcast question change if applicable
                    if (microbitService instanceof MicrobitServiceImpl) {
                        Question currentQ = session.getCurrentQuestion();
                        if (currentQ != null) {
                            ((MicrobitServiceImpl) microbitService).broadcastQuizState(quizId, "question_changed", currentQ.getQuestionText());
                        }
                    }
                },
                // Button handler
                button -> {
                    handleButton(session, button);
                    // Broadcast question change if applicable
                    if (microbitService instanceof MicrobitServiceImpl) {
                        Question currentQ = session.getCurrentQuestion();
                        if (currentQ != null) {
                            ((MicrobitServiceImpl) microbitService).broadcastQuizState(quizId, "navigation", currentQ.getQuestionText());
                        }
                    }
                }
        );

        // Return initial question
        return ResponseEntity.ok(getCurrentQuestionResponse(session));
    }

    @PostMapping("/quiz/{quizId}/stop")
    public ResponseEntity<?> stopQuiz(@PathVariable Long quizId) {
        ActiveQuizSession session = activeSessions.get(quizId);

        if (session == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "No active session for this quiz"));
        }

        // Stop listening
        microbitService.stopListening();

        // Broadcast quiz completion
        if (microbitService instanceof MicrobitServiceImpl) {
            MicrobitServiceImpl impl = (MicrobitServiceImpl) microbitService;
            impl.broadcastQuizState(quizId, "completed",
                    "Quiz finished with " + session.getCorrectAnswers() + "/" + session.getTotalQuestions() + " correct");
        }

        User user = userRepository.findById(session.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Save progress
        UserProgress progress = new UserProgress();
        progress.setUser(user);
        progress.setQuiz(session.getQuiz());
        progress.setCompletedAt(LocalDateTime.now());
        progress.setTotalQuestions(session.getTotalQuestions());
        progress.setCorrectAnswers(session.getCorrectAnswers());
        progress.setCompletionTimeSeconds(session.getElapsedTimeSeconds());

        UserProgress savedProgress = userProgressService.saveUserProgress(progress);

        // Remove the session
        activeSessions.remove(quizId);

        // Clear quiz context
        if (microbitService instanceof MicrobitServiceImpl) {
            ((MicrobitServiceImpl) microbitService).setQuizContext(null);
        }

        return ResponseEntity.ok(Map.of(
                "quizId", quizId,
                "correctAnswers", session.getCorrectAnswers(),
                "totalQuestions", session.getTotalQuestions(),
                "progressId", savedProgress.getId()
        ));
    }

    @GetMapping("/quiz/{quizId}/current")
    public ResponseEntity<?> getCurrentQuestion(@PathVariable Long quizId) {
        ActiveQuizSession session = activeSessions.get(quizId);

        if (session == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "No active session for this quiz"));
        }

        return ResponseEntity.ok(getCurrentQuestionResponse(session));
    }

    @GetMapping("/websocket/info")
    public ResponseEntity<?> getWebSocketInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("websocketUrl", "ws://localhost:8080/ws/microbit");
        info.put("sockjsUrl", "http://localhost:8080/ws/microbit");
        info.put("microbitConnected", microbitService.isConnected());

        if (microbitService instanceof MicrobitServiceImpl) {
            info.put("activeConnections", ((MicrobitServiceImpl) microbitService).getActiveWebSocketSessions());
        } else {
            info.put("activeConnections", 0);
        }

        return ResponseEntity.ok(info);
    }

    @PostMapping("/disconnect")
    public ResponseEntity<?> disconnectMicrobit() {
        // Stop any active listening
        microbitService.stopListening();

        // Clear all active sessions
        activeSessions.clear();

        // Broadcast disconnection if possible
        if (microbitService instanceof MicrobitServiceImpl) {
            MicrobitServiceImpl impl = (MicrobitServiceImpl) microbitService;
            impl.setQuizContext(null);
            impl.broadcastConnectionStatus(false, null, "Manual disconnection");
        }

        return ResponseEntity.ok(Map.of(
                "status", "disconnected",
                "message", "Micro:bit disconnected successfully"
        ));
    }

    // Helper method to get current question response
    private Map<String, Object> getCurrentQuestionResponse(ActiveQuizSession session) {
        Question currentQuestion = session.getCurrentQuestion();

        // Check if there's a valid question
        if (currentQuestion == null) {
            return Map.of(
                    "questionNumber", session.getCurrentQuestionIndex() + 1,
                    "totalQuestions", session.getTotalQuestions(),
                    "questionText", "No question available",
                    "questionType", "NONE",
                    "options", List.of(),
                    "correctAnswers", session.getCorrectAnswers()
            );
        }

        return Map.of(
                "questionNumber", session.getCurrentQuestionIndex() + 1,
                "totalQuestions", session.getTotalQuestions(),
                "questionText", currentQuestion.getQuestionText() != null ? currentQuestion.getQuestionText() : "",
                "questionType", currentQuestion.getQuestionType() != null ? currentQuestion.getQuestionType() : "UNKNOWN",
                "options", currentQuestion.getOptions() != null ? currentQuestion.getOptions() : List.of(),
                "correctAnswers", session.getCorrectAnswers()
        );
    }

    // Helper method to handle movement input
    private void handleMovement(ActiveQuizSession session, MovementType movement) {
        if (movement == MovementType.NONE) {
            return;
        }

        Question currentQuestion = session.getCurrentQuestion();

        if (currentQuestion == null) {
            return;
        }

        String questionType = currentQuestion.getQuestionType();
        if (questionType == null) {
            return;
        }

        boolean isCorrect = false;

        if ("MULTIPLE_CHOICE".equals(questionType)) {
            int selectedOption;
            switch (movement) {
                // Map movements to options according to our Micro:bit configuration
                case LEFT: selectedOption = 0; break;      // A
                case FORWARD: selectedOption = 1; break;   // B
                case RIGHT: selectedOption = 2; break;     // C
                case BACKWARD: selectedOption = 3; break;  // D
                default: return;
            }

            isCorrect = (selectedOption == currentQuestion.getCorrectOptionIndex());
        } else if ("TRUE_FALSE".equals(questionType)) {
            // Map LEFT to TRUE, RIGHT to FALSE
            boolean selectedAnswer;
            switch (movement) {
                case LEFT: selectedAnswer = true; break;     // TRUE
                case RIGHT: selectedAnswer = false; break;   // FALSE
                default: return;
            }

            isCorrect = (selectedAnswer == (currentQuestion.getCorrectOptionIndex() == 0));
        }

        if (isCorrect) {
            session.incrementCorrectAnswers();
        }

        session.moveToNextQuestion();
    }

    // Helper method to handle button input
    private void handleButton(ActiveQuizSession session, ButtonType button) {
        if (button == ButtonType.NONE) {
            return;
        }

        if (button == ButtonType.BUTTON_A) {
            // Previous question
            session.moveToPreviousQuestion();
        } else if (button == ButtonType.BUTTON_B) {
            // Next question
            session.moveToNextQuestion();
        }
    }

    // Helper class to track active quiz sessions
    @Data
    private static class ActiveQuizSession {
        private final Quiz quiz;
        private final Long userId;
        private final List<Question> questions;
        private int currentQuestionIndex = 0;
        private int correctAnswers = 0;
        private final LocalDateTime startTime;

        public ActiveQuizSession(Quiz quiz, Long userId) {
            this.quiz = quiz;
            this.userId = userId;
            this.questions = new ArrayList<>(quiz.getQuestions());
            this.startTime = LocalDateTime.now();
        }

        public int getTotalQuestions() {
            return questions.size();
        }

        public Question getCurrentQuestion() {
            if (currentQuestionIndex >= 0 && currentQuestionIndex < questions.size()) {
                return questions.get(currentQuestionIndex);
            }
            return null;
        }

        public void incrementCorrectAnswers() {
            correctAnswers++;
        }

        public void moveToNextQuestion() {
            if (currentQuestionIndex < questions.size() - 1) {
                currentQuestionIndex++;
            }
        }

        public void moveToPreviousQuestion() {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
            }
        }

        public long getElapsedTimeSeconds() {
            return java.time.Duration.between(startTime, LocalDateTime.now()).getSeconds();
        }
    }
}