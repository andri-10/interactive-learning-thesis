package com.thesis.interactive_learning.controllers;

import com.fazecast.jSerialComm.SerialPort;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/microbit")
@RequiredArgsConstructor
public class MicrobitController {

    private static final Logger logger = LoggerFactory.getLogger(MicrobitController.class);

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
        response.put("status", connected ? "connected" : "failed");
        response.put("message", connected ? "Micro:bit connected successfully" : "Could not connect to Micro:bit");

        if (microbitService instanceof MicrobitServiceImpl) {
            response.put("activeWebSocketSessions", ((MicrobitServiceImpl) microbitService).getActiveWebSocketSessions());
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/status")
    public ResponseEntity<?> getMicrobitStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("connected", microbitService.isConnected());
        response.put("lastMovement", microbitService.getLastMovement().toString());
        response.put("lastButton", microbitService.getLastButton().toString());

        if (microbitService instanceof MicrobitServiceImpl) {
            response.put("activeWebSocketSessions", ((MicrobitServiceImpl) microbitService).getActiveWebSocketSessions());
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/test-serial")
    public ResponseEntity<?> testSerial() {
        logger.info("🧪 DIRECT SERIAL PORT TEST STARTING...");

        // FIRST: Properly disconnect any existing connection
        if (microbitService.isConnected()) {
            logger.info("🔧 Disconnecting existing micro:bit connection...");

            if (microbitService instanceof MicrobitServiceImpl impl) {
                impl.disconnect(); // Use the new disconnect method
            } else {
                microbitService.stopListening();
            }

            // Wait for cleanup
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                // ignore
            }
        }

        // Rest of your test method stays the same...
        SerialPort testPort = null;
        try {
            SerialPort[] ports = SerialPort.getCommPorts();
            for (SerialPort port : ports) {
                if (port.getSystemPortName().equalsIgnoreCase("COM5")) {
                    testPort = port;
                    break;
                }
            }

            if (testPort == null) {
                return ResponseEntity.ok("❌ COM5 not found");
            }

            logger.info("🔌 Found COM5, attempting to open...");

            testPort.setComPortParameters(115200, 8, SerialPort.ONE_STOP_BIT, SerialPort.NO_PARITY);
            testPort.setComPortTimeouts(SerialPort.TIMEOUT_READ_SEMI_BLOCKING, 1000, 0);

            boolean opened = testPort.openPort();
            if (!opened) {
                return ResponseEntity.ok("❌ Failed to open COM5 - Port still in use");
            }

            logger.info("✅ COM5 opened successfully, reading for 10 seconds...");

            InputStream in = testPort.getInputStream();
            StringBuilder result = new StringBuilder();

            for (int i = 0; i < 100; i++) {
                if (in.available() > 0) {
                    byte[] buffer = new byte[1024];
                    int bytesRead = in.read(buffer);
                    String data = new String(buffer, 0, bytesRead);
                    logger.info("📥 RAW DATA: '{}'", data.trim());
                    result.append(data);
                }
                Thread.sleep(100);
            }

            testPort.closePort();

            if (!result.isEmpty()) {
                return ResponseEntity.ok("✅ SUCCESS: Received data: " + result.toString());
            } else {
                return ResponseEntity.ok("❌ No data received in 10 seconds");
            }

        } catch (Exception e) {
            logger.error("🔥 Serial test failed: {}", e.getMessage(), e);
            if (testPort != null && testPort.isOpen()) {
                testPort.closePort();
            }
            return ResponseEntity.ok("❌ Error: " + e.getMessage());
        }
    }

    @GetMapping("/test-listener")
    public ResponseEntity<?> testListener() {
        if (!microbitService.isConnected()) {
            return ResponseEntity.ok("❌ Micro:bit not connected");
        }

        logger.info("🧪 Starting test listener...");

        microbitService.startListening(
                movement -> logger.info("🎯 TEST MOVEMENT: {}", movement),
                button -> logger.info("🎯 TEST BUTTON: {}", button)
        );

        return ResponseEntity.ok("✅ Test listener started - move your micro:bit and check logs!");
    }

    @PostMapping("/quiz/{quizId}/start")
    public ResponseEntity<?> startQuiz(@PathVariable Long quizId, @RequestParam Long userId) {
        logger.info("🚀 QUIZ START REQUEST - Quiz ID: {}, User ID: {}", quizId, userId);

        // Check micro:bit connection
        if (!microbitService.isConnected()) {
            logger.error("❌ Quiz start failed - Micro:bit not connected");
            return ResponseEntity.badRequest().body(Map.of("error", "Micro:bit not connected"));
        }
        logger.info("✅ Micro:bit is connected");

        // Get and validate quiz
        Quiz quiz;
        try {
            quiz = quizService.getQuizById(quizId)
                    .orElseThrow(() -> new RuntimeException("Quiz not found"));
            logger.info("✅ Quiz found: '{}'", quiz.getTitle());
        } catch (Exception e) {
            logger.error("❌ Quiz not found: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Quiz not found: " + e.getMessage()));
        }

        if (!quiz.isMicrobitCompatible()) {
            logger.error("❌ Quiz '{}' is not micro:bit compatible", quiz.getTitle());
            return ResponseEntity.badRequest().body(Map.of("error", "This quiz is not Micro:bit compatible"));
        }
        logger.info("✅ Quiz is micro:bit compatible");

        // Create quiz session
        ActiveQuizSession session = new ActiveQuizSession(quiz, userId);
        activeSessions.put(quizId, session);
        logger.info("✅ Quiz session created for quiz: {}", quizId);

        // Set up WebSocket broadcasting
        if (microbitService instanceof MicrobitServiceImpl impl) {
            impl.setQuizContext("Quiz: " + quiz.getTitle());
            impl.broadcastQuizState(quizId, "started",
                    session.getCurrentQuestion() != null ? session.getCurrentQuestion().getQuestionText() : "Loading...");
            logger.info("✅ WebSocket context set and quiz state broadcasted");
        }

        // THIS IS THE CRITICAL PART - Start listening
        logger.info("🎧 STARTING MICRO:BIT LISTENER FOR QUIZ...");
        try {
            microbitService.startListening(
                    movement -> {
                        logger.info("🏃 QUIZ MOVEMENT RECEIVED: {}", movement);
                        handleMovement(session, movement);
                        // Broadcast question change if applicable
                        if (microbitService instanceof MicrobitServiceImpl impl) {
                            Question currentQ = session.getCurrentQuestion();
                            if (currentQ != null) {
                                impl.broadcastQuizState(quizId, "question_changed", currentQ.getQuestionText());
                            }
                        }
                    },
                    button -> {
                        logger.info("🔘 QUIZ BUTTON RECEIVED: {}", button);
                        handleButton(session, button);
                        // Broadcast question change if applicable
                        if (microbitService instanceof MicrobitServiceImpl impl) {
                            Question currentQ = session.getCurrentQuestion();
                            if (currentQ != null) {
                                impl.broadcastQuizState(quizId, "navigation", currentQ.getQuestionText());
                            }
                        }
                    }
            );
            logger.info("✅ Micro:bit listener started successfully for quiz");
        } catch (Exception e) {
            logger.error("❌ Failed to start micro:bit listener: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to start micro:bit listener: " + e.getMessage()));
        }

        Map<String, Object> response = getCurrentQuestionResponse(session);
        logger.info("✅ Quiz started successfully, returning response");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/quiz/{quizId}/stop")
    public ResponseEntity<?> stopQuiz(@PathVariable Long quizId) {
        ActiveQuizSession session = activeSessions.get(quizId);
        if (session == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "No active session for this quiz"));
        }

        // Stop listening and broadcast completion
        microbitService.stopListening();

        if (microbitService instanceof MicrobitServiceImpl impl) {
            impl.broadcastQuizState(quizId, "completed",
                    "Quiz finished with " + session.getCorrectAnswers() + "/" + session.getTotalQuestions() + " correct");
            impl.setQuizContext(null);
        }

        // Save user progress
        User user = userRepository.findById(session.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProgress progress = new UserProgress();
        progress.setUser(user);
        progress.setQuiz(session.getQuiz());
        progress.setCompletedAt(LocalDateTime.now());
        progress.setTotalQuestions(session.getTotalQuestions());
        progress.setCorrectAnswers(session.getCorrectAnswers());
        progress.setCompletionTimeSeconds(session.getElapsedTimeSeconds());

        UserProgress savedProgress = userProgressService.saveUserProgress(progress);
        activeSessions.remove(quizId);

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

        if (microbitService instanceof MicrobitServiceImpl impl) {
            info.put("activeConnections", impl.getActiveWebSocketSessions());
        } else {
            info.put("activeConnections", 0);
        }

        return ResponseEntity.ok(info);
    }

    @PostMapping("/disconnect")
    public ResponseEntity<?> disconnectMicrobit() {
        logger.info("🔌 Manual disconnect requested");

        if (microbitService instanceof MicrobitServiceImpl impl) {
            impl.disconnect();
        } else {
            microbitService.stopListening();
        }

        activeSessions.clear();

        return ResponseEntity.ok(Map.of(
                "status", "disconnected",
                "message", "Micro:bit disconnected successfully"
        ));
    }

    // Helper methods
    private Map<String, Object> getCurrentQuestionResponse(ActiveQuizSession session) {
        Question currentQuestion = session.getCurrentQuestion();

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

    private void handleMovement(ActiveQuizSession session, MovementType movement) {
        if (movement == MovementType.NONE) return;

        Question currentQuestion = session.getCurrentQuestion();
        if (currentQuestion == null) return;

        String questionType = currentQuestion.getQuestionType();
        if (questionType == null) return;

        boolean isCorrect = false;
        int selectedOption = -1;

        if ("MULTIPLE_CHOICE".equals(questionType)) {
            selectedOption = switch (movement) {
                case LEFT -> 0;      // A
                case FORWARD -> 1;   // B
                case RIGHT -> 2;     // C
                case BACKWARD -> 3;  // D
                default -> -1;
            };
            if (selectedOption >= 0 && selectedOption < currentQuestion.getOptions().size()) {
                isCorrect = (selectedOption == currentQuestion.getCorrectOptionIndex());
                logger.info("🎮 Multiple choice answer: {} ({})",
                        String.valueOf((char)(65 + selectedOption)),
                        currentQuestion.getOptions().get(selectedOption));
            }
        } else if ("TRUE_FALSE".equals(questionType)) {
            if (movement == MovementType.LEFT) {
                selectedOption = 0; // True
                isCorrect = (currentQuestion.getCorrectOptionIndex() == 0);
                logger.info("🎮 True/False answer: True");
            } else if (movement == MovementType.RIGHT) {
                selectedOption = 1; // False
                isCorrect = (currentQuestion.getCorrectOptionIndex() == 1);
                logger.info("🎮 True/False answer: False");
            }
        }

        if (selectedOption >= 0) {
            if (isCorrect) {
                session.incrementCorrectAnswers();
                logger.info("✅ Correct answer!");
            } else {
                logger.info("❌ Incorrect answer");
            }

            // Broadcast the answer selection to WebSocket clients
            if (microbitService instanceof MicrobitServiceImpl impl) {
                impl.broadcastQuizState(session.getQuiz().getId(), "answer_selected",
                        "Selected: " + currentQuestion.getOptions().get(selectedOption));
            }
        }
    }

    private void handleButton(ActiveQuizSession session, ButtonType button) {
        if (button == ButtonType.NONE) return;

        switch (button) {
            case BUTTON_A -> session.moveToPreviousQuestion();
            case BUTTON_B -> session.moveToNextQuestion();
        }

        // Broadcast navigation
        if (microbitService instanceof MicrobitServiceImpl impl) {
            Question currentQuestion = session.getCurrentQuestion();
            if (currentQuestion != null) {
                impl.broadcastQuizState(session.getQuiz().getId(), "navigation", currentQuestion.getQuestionText());
            }
        }
    }

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