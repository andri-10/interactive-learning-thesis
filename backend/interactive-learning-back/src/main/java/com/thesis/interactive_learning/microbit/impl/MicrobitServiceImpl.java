package com.thesis.interactive_learning.microbit.impl;

import com.fazecast.jSerialComm.SerialPort;
import com.thesis.interactive_learning.config.MicrobitWebSocketHandler;
import com.thesis.interactive_learning.microbit.ButtonType;
import com.thesis.interactive_learning.microbit.MicrobitService;
import com.thesis.interactive_learning.microbit.MovementType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PreDestroy;
import java.io.IOException;
import java.io.InputStream;
import java.util.function.Consumer;

@Service
public class MicrobitServiceImpl implements MicrobitService {

    private static final Logger logger = LoggerFactory.getLogger(MicrobitServiceImpl.class);

    @Autowired
    private MicrobitWebSocketHandler webSocketHandler;

    private SerialPort serialPort;
    private boolean connected = false;
    private MovementType lastMovement = MovementType.NONE;
    private ButtonType lastButton = ButtonType.NONE;
    private Thread listenerThread;
    private boolean listening = false;
    private String currentQuizContext = null;

    private static final int BAUD_RATE = 115200;
    private static final int DATA_BITS = 8;
    private static final int STOP_BITS = SerialPort.ONE_STOP_BIT;
    private static final int PARITY = SerialPort.NO_PARITY;

    @Override
    public boolean initializeConnection() {
        logger.info("=== STARTING MICROBIT CONNECTION ===");

        // Close existing connection
        disconnect();

        SerialPort[] ports = SerialPort.getCommPorts();
        logger.info("Available serial ports: {}", ports.length);

        for (SerialPort port : ports) {
            logger.info("Port: {} - Description: {}", port.getSystemPortName(), port.getDescriptivePortName());
        }

        // Find micro:bit port
        serialPort = findMicrobitPort(ports);

        if (serialPort == null) {
            logger.error("No suitable micro:bit port found");
            broadcastConnectionStatus(false, null, "No micro:bit port found");
            return false;
        }

        logger.info("Selected port: {} - {}", serialPort.getSystemPortName(), serialPort.getDescriptivePortName());

        // Configure and open port
        serialPort.setComPortParameters(BAUD_RATE, DATA_BITS, STOP_BITS, PARITY);
        serialPort.setComPortTimeouts(SerialPort.TIMEOUT_READ_SEMI_BLOCKING, 1000, 0);

        connected = serialPort.openPort();

        if (!connected) {
            logger.error("FAILED to open serial port: {}", serialPort.getSystemPortName());
            broadcastConnectionStatus(false, serialPort.getSystemPortName(), "Failed to open port");
            return false;
        }

        logger.info("✅ SUCCESS: Connected to port: {}", serialPort.getSystemPortName());
        broadcastConnectionStatus(true, serialPort.getSystemPortName(), "Successfully connected");

        // Brief pause to let port stabilize
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        return connected;
    }

    private SerialPort findMicrobitPort(SerialPort[] ports) {
        // Strategy 1: Look for micro:bit specific identifiers
        for (SerialPort port : ports) {
            String portName = port.getDescriptivePortName().toLowerCase();
            String systemName = port.getSystemPortName().toLowerCase();

            if (portName.contains("micro:bit") ||
                    portName.contains("microbit") ||
                    portName.contains("mbed") ||
                    systemName.contains("usbmodem")) {
                logger.info("Found micro:bit device: {}", port.getSystemPortName());
                return port;
            }
        }

        // Strategy 2: Look for COM5 specifically
        for (SerialPort port : ports) {
            if (port.getSystemPortName().equalsIgnoreCase("COM5")) {
                logger.info("Found COM5 (potential micro:bit): {}", port.getSystemPortName());
                return port;
            }
        }

        // Strategy 3: Use first non-system USB serial port
        for (SerialPort port : ports) {
            String portName = port.getDescriptivePortName().toLowerCase();
            if (portName.contains("usb serial") &&
                    !portName.contains("intel") &&
                    !portName.contains("amt")) {
                logger.warn("Using USB serial port: {}", port.getSystemPortName());
                return port;
            }
        }

        return null;
    }

    @Override
    public void startListening(Consumer<MovementType> movementCallback, Consumer<ButtonType> buttonCallback) {
        if (!connected || serialPort == null) {
            logger.error("Cannot start listening: not connected");
            return;
        }

        if (listening) {
            logger.warn("Already listening - stopping previous listener");
            stopListening();
        }

        listening = true;
        logger.info("🎧 Starting micro:bit listener...");

        listenerThread = new Thread(() -> {
            StringBuilder messageBuffer = new StringBuilder();
            byte[] buffer = new byte[256];

            try {
                InputStream in = serialPort.getInputStream();
                logger.info("✅ Listener ready - waiting for micro:bit data...");

                while (listening && connected) {
                    try {
                        int available = in.available();
                        if (available > 0) {
                            int bytesRead = in.read(buffer, 0, Math.min(available, buffer.length));

                            if (bytesRead > 0) {
                                processIncomingBytes(buffer, bytesRead, messageBuffer, movementCallback, buttonCallback);
                            }
                        } else {
                            Thread.sleep(10); // Small delay when no data
                        }
                    } catch (IOException e) {
                        if (listening) {
                            logger.error("❌ Read error: {}", e.getMessage());
                            break;
                        }
                    } catch (InterruptedException e) {
                        logger.info("🛑 Listener interrupted");
                        break;
                    }
                }
            } catch (Exception e) {
                logger.error("❌ Fatal listener error: {}", e.getMessage());
            } finally {
                listening = false;
                logger.info("🛑 Listener stopped");
            }
        });

        listenerThread.setDaemon(true);
        listenerThread.setName("MicrobitListener");
        listenerThread.start();
    }

    private void processIncomingBytes(byte[] buffer, int bytesRead, StringBuilder messageBuffer,
                                      Consumer<MovementType> movementCallback, Consumer<ButtonType> buttonCallback) {

        for (int i = 0; i < bytesRead; i++) {
            char c = (char) buffer[i];

            if (c == '\n') {
                String message = messageBuffer.toString().trim();
                if (!message.isEmpty() && !message.startsWith("Sent")) {
                    logger.info("📨 Received: '{}'", message);
                    processMessage(message, movementCallback, buttonCallback);
                }
                messageBuffer.setLength(0); // Clear buffer
            } else if (c == '\r') {
                // Ignore carriage return
                continue;
            } else if (c >= 32 && c <= 126) {
                // Only accept printable ASCII characters
                messageBuffer.append(c);

                // Prevent buffer overflow
                if (messageBuffer.length() > 200) {
                    logger.warn("Message buffer overflow, clearing");
                    messageBuffer.setLength(0);
                }
            }
        }
    }

    private void processMessage(String message, Consumer<MovementType> movementCallback,
                                Consumer<ButtonType> buttonCallback) {

        if (message.length() < 3 || !message.contains(":")) {
            logger.warn("Invalid message format: '{}'", message);
            return;
        }

        try {
            String[] parts = message.split(":", 2);
            if (parts.length != 2) {
                logger.warn("Message split failed: '{}'", message);
                return;
            }

            String type = parts[0].trim();
            String value = parts[1].trim().toUpperCase();

            logger.info("Processing: Type='{}', Value='{}'", type, value);

            switch (type) {
                case "M" -> handleMovementMessage(value, movementCallback);
                case "B" -> handleButtonMessage(value, buttonCallback);
                case "INIT" -> logger.info("🎯 Micro:bit initialization: {}", value);
                default -> logger.warn("❌ Unknown message type: '{}'", type);
            }
        } catch (Exception e) {
            logger.error("Error processing message '{}': {}", message, e.getMessage());
        }
    }

    private void handleMovementMessage(String value, Consumer<MovementType> movementCallback) {
        try {
            MovementType movement = MovementType.valueOf(value);
            logger.info("✅ Movement: {}", movement);

            lastMovement = movement;
            broadcastMovement(movement, currentQuizContext);

            if (movementCallback != null) {
                movementCallback.accept(movement);
            }
        } catch (IllegalArgumentException e) {
            logger.warn("❌ Unknown movement: '{}'", value);
        }
    }

    private void handleButtonMessage(String value, Consumer<ButtonType> buttonCallback) {
        try {
            ButtonType button = ButtonType.valueOf(value);
            logger.info("✅ Button: {}", button);

            lastButton = button;
            broadcastButtonPress(button, currentQuizContext);

            if (buttonCallback != null) {
                buttonCallback.accept(button);
            }
        } catch (IllegalArgumentException e) {
            logger.warn("❌ Unknown button: '{}'", value);
        }
    }

    @Override
    public void stopListening() {
        listening = false;

        if (listenerThread != null && listenerThread.isAlive()) {
            try {
                listenerThread.interrupt();
                listenerThread.join(2000); // Wait up to 2 seconds
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                logger.warn("Interrupted while stopping listener");
            }
            listenerThread = null;
        }

        logger.info("🛑 Stopped listening");
    }

    public void disconnect() {
        logger.info("🔌 Disconnecting micro:bit...");

        // Stop listening first
        stopListening();

        // Close serial port
        if (serialPort != null) {
            try {
                if (serialPort.isOpen()) {
                    serialPort.closePort();
                    logger.info("✅ Serial port closed");
                }
            } catch (Exception e) {
                logger.error("Error closing serial port: {}", e.getMessage());
            }
            serialPort = null;
        }

        // Reset state
        connected = false;
        lastMovement = MovementType.NONE;
        lastButton = ButtonType.NONE;
        currentQuizContext = null;

        broadcastConnectionStatus(false, null, "Disconnected");
    }

    @Override
    public boolean isConnected() {
        boolean actuallyConnected = connected && serialPort != null && serialPort.isOpen();

        if (connected != actuallyConnected) {
            connected = actuallyConnected;
            broadcastConnectionStatus(connected,
                    serialPort != null ? serialPort.getSystemPortName() : null,
                    connected ? "Connection verified" : "Connection lost");
        }

        return actuallyConnected;
    }

    @Override
    public MovementType getLastMovement() {
        return lastMovement;
    }

    @Override
    public ButtonType getLastButton() {
        return lastButton;
    }

    // WebSocket integration methods
    public void setQuizContext(String quizContext) {
        this.currentQuizContext = quizContext;
        if (webSocketHandler != null) {
            webSocketHandler.broadcastQuizState(null, "context_changed", quizContext);
        }
    }

    public void broadcastQuizState(Long quizId, String state, String currentQuestion) {
        if (webSocketHandler != null) {
            webSocketHandler.broadcastQuizState(quizId, state, currentQuestion);
        }
    }

    public void broadcastConnectionStatus(boolean connected, String portName, String message) {
        if (webSocketHandler != null) {
            webSocketHandler.broadcastConnectionStatus(connected, portName, message);
        }
    }

    public void broadcastMovement(MovementType movement, String quizContext) {
        if (webSocketHandler != null) {
            webSocketHandler.broadcastMovement(movement, quizContext);
        }
    }

    public void broadcastButtonPress(ButtonType button, String quizContext) {
        if (webSocketHandler != null) {
            webSocketHandler.broadcastButtonPress(button, quizContext);
        }
    }

    public int getActiveWebSocketSessions() {
        if (webSocketHandler != null) {
            return webSocketHandler.getActiveSessionCount();
        }
        return 0;
    }

    @PreDestroy
    public void destroy() {
        logger.info("Shutting down MicrobitService...");
        disconnect();
    }
}