package com.thesis.interactive_learning.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thesis.interactive_learning.microbit.ButtonType;
import com.thesis.interactive_learning.microbit.MovementType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import lombok.Getter;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Component
public class MicrobitWebSocketHandler implements WebSocketHandler {

    @Value("${app.websocket.max-sessions:100}")
    private int maxSessions;

    @Value("${app.websocket.heartbeat-interval:30000}")
    private long heartbeatInterval;

    private static final Logger logger = LoggerFactory.getLogger(MicrobitWebSocketHandler.class);
    private final ObjectMapper objectMapper = new ObjectMapper();


    private final CopyOnWriteArraySet<WebSocketSession> sessions = new CopyOnWriteArraySet<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        if (sessions.size() >= maxSessions) {
            logger.warn("Maximum WebSocket sessions reached ({}). Rejecting new connection: {}",
                    maxSessions, session.getId());
            session.close(CloseStatus.GOING_AWAY);
            return;
        }

        sessions.add(session);
        logger.info("WebSocket connection established: {} (Total sessions: {})",
                session.getId(), sessions.size());

        sendMicrobitStatus(session, false, "Disconnected", null);
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        logger.debug("Received WebSocket message: {}", message.getPayload());

        if ("ping".equals(message.getPayload())) {
            session.sendMessage(new TextMessage("pong"));
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        logger.error("WebSocket transport error for session {}: {}", session.getId(), exception.getMessage());
        sessions.remove(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
        sessions.remove(session);
        logger.info("WebSocket connection closed: {} with status: {}", session.getId(), closeStatus);
    }

    @Override
    public boolean supportsPartialMessages() {
        return false;
    }

    // Method to broadcast micro:bit connection status to all connected clients
    public void broadcastConnectionStatus(boolean connected, String portName, String message) {
        MicrobitStatusMessage statusMessage = new MicrobitStatusMessage(
                connected ? "connected" : "disconnected",
                connected,
                portName,
                message,
                LocalDateTime.now().toString()
        );

        broadcastToAllSessions(statusMessage);
    }


    public void broadcastMovement(MovementType movement, String quizContext) {
        MicrobitMovementMessage movementMessage = new MicrobitMovementMessage(
                "movement",
                movement.toString(),
                quizContext,
                LocalDateTime.now().toString()
        );

        broadcastToAllSessions(movementMessage);
    }

    public void broadcastButtonPress(ButtonType button, String quizContext) {
        MicrobitButtonMessage buttonMessage = new MicrobitButtonMessage(
                "button",
                button.toString(),
                quizContext,
                LocalDateTime.now().toString()
        );

        broadcastToAllSessions(buttonMessage);
    }


    public void broadcastQuizState(Long quizId, String state, String currentQuestion) {
        MicrobitQuizStateMessage quizMessage = new MicrobitQuizStateMessage(
                "quiz_state",
                quizId,
                state,
                currentQuestion,
                LocalDateTime.now().toString()
        );

        broadcastToAllSessions(quizMessage);
    }

    private void broadcastToAllSessions(Object message) {
        String messageJson = serializeMessage(message);
        if (messageJson == null) return;

        sessions.removeIf(session -> {
            try {
                if (session.isOpen()) {
                    session.sendMessage(new TextMessage(messageJson));
                    return false; // Keep the session
                } else {
                    return true; // Remove the session
                }
            } catch (IOException e) {
                logger.error("Error sending WebSocket message to session {}: {}", session.getId(), e.getMessage());
                return true; // Remove the problematic session
            }
        });

        logger.debug("Broadcasted message to {} active sessions", sessions.size());
    }

    private void sendMicrobitStatus(WebSocketSession session, boolean connected, String message, String portName) {
        MicrobitStatusMessage statusMessage = new MicrobitStatusMessage(
                connected ? "connected" : "disconnected",
                connected,
                portName,
                message,
                LocalDateTime.now().toString()
        );

        String messageJson = serializeMessage(statusMessage);
        if (messageJson != null && session.isOpen()) {
            try {
                session.sendMessage(new TextMessage(messageJson));
            } catch (IOException e) {
                logger.error("Error sending status message: {}", e.getMessage());
            }
        }
    }

    private String serializeMessage(Object message) {
        try {
            return objectMapper.writeValueAsString(message);
        } catch (Exception e) {
            logger.error("Error serializing WebSocket message: {}", e.getMessage());
            return null;
        }
    }

    public int getActiveSessionCount() {
        return sessions.size();
    }

    @Scheduled(fixedDelayString = "${app.websocket.cleanup-interval:60000}")
    public void cleanupSessions() {
        int initialSize = sessions.size();
        sessions.removeIf(session -> !session.isOpen());
        int removedCount = initialSize - sessions.size();

        if (removedCount > 0) {
            logger.info("Cleaned up {} inactive WebSocket sessions. Active sessions: {}",
                    removedCount, sessions.size());
        }
    }

    public Map<String, Object> getConnectionMetrics() {
        Map<String, Object> metrics = new ConcurrentHashMap<>();
        metrics.put("activeSessions", sessions.size());
        metrics.put("maxSessions", maxSessions);
        metrics.put("timestamp", LocalDateTime.now().toString());
        return metrics;
    }


    @Setter
    @Getter
    public static class MicrobitStatusMessage {
        public String type;
        public boolean connected;
        public String portName;
        public String message;
        public String timestamp;

        public MicrobitStatusMessage(String type, boolean connected, String portName, String message, String timestamp) {
            this.type = type;
            this.connected = connected;
            this.portName = portName;
            this.message = message;
            this.timestamp = timestamp;
        }


    }

    @Setter
    @Getter
    public static class MicrobitMovementMessage {
        // Getters and setters
        public String type;
        public String movement;
        public String quizContext;
        public String timestamp;

        public MicrobitMovementMessage(String type, String movement, String quizContext, String timestamp) {
            this.type = type;
            this.movement = movement;
            this.quizContext = quizContext;
            this.timestamp = timestamp;
        }

    }

    @Setter
    @Getter
    public static class MicrobitButtonMessage {
        public String type;
        public String button;
        public String quizContext;
        public String timestamp;

        public MicrobitButtonMessage(String type, String button, String quizContext, String timestamp) {
            this.type = type;
            this.button = button;
            this.quizContext = quizContext;
            this.timestamp = timestamp;
        }


    }

    @Setter
    @Getter
    public static class MicrobitQuizStateMessage {
        // Getters and setters
        public String type;
        public Long quizId;
        public String state;
        public String currentQuestion;
        public String timestamp;

        public MicrobitQuizStateMessage(String type, Long quizId, String state, String currentQuestion, String timestamp) {
            this.type = type;
            this.quizId = quizId;
            this.state = state;
            this.currentQuestion = currentQuestion;
            this.timestamp = timestamp;
        }

    }
}