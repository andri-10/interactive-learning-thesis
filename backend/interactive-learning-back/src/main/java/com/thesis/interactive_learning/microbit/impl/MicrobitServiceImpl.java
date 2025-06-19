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
        logger.info("Attempting to initialize micro:bit connection...");

        // Close any existing connection
        if (connected && serialPort != null) {
            serialPort.closePort();
            connected = false;
            broadcastConnectionStatus(false, null, "Previous connection closed");
        }

        SerialPort[] ports = SerialPort.getCommPorts();

        if (ports.length == 0) {
            logger.error("No serial ports available");
            broadcastConnectionStatus(false, null, "No serial ports available");
            return false;
        }

        logger.info("Available serial ports:");
        for (SerialPort port : ports) {
            logger.info("  - " + port.getSystemPortName() + ": " + port.getDescriptivePortName());
        }

        // Try to find the Micro:bit device
        for (SerialPort port : ports) {
            String portName = port.getDescriptivePortName().toLowerCase();
            String systemName = port.getSystemPortName().toLowerCase();

            if (portName.contains("micro:bit") ||
                    portName.contains("microbit") ||
                    portName.contains("mbed") ||
                    systemName.contains("usbmodem")) {
                serialPort = port;
                logger.info("Found potential Micro:bit device: " + port.getSystemPortName());
                break;
            }
        }

        // If no Micro:bit was found, try the first port
        if (serialPort == null && ports.length > 0) {
            logger.warn("No specific Micro:bit device found. Using first available port: {}", ports[0].getSystemPortName());
            serialPort = ports[0];
            broadcastConnectionStatus(false, null, "Trying first available port: " + ports[0].getSystemPortName());
        }

        if (serialPort == null) {
            logger.error("No serial port selected");
            broadcastConnectionStatus(false, null, "No serial port could be selected");
            return false;
        }

        // Configure and open the port
        serialPort.setComPortParameters(BAUD_RATE, DATA_BITS, STOP_BITS, PARITY);
        serialPort.setComPortTimeouts(SerialPort.TIMEOUT_READ_SEMI_BLOCKING, 1000, 0);

        connected = serialPort.openPort();
        if (!connected) {
            logger.error("Failed to open serial port: " + serialPort.getSystemPortName());
            broadcastConnectionStatus(false, serialPort.getSystemPortName(),
                    "Failed to open port: " + serialPort.getSystemPortName());
        } else {
            logger.info("Connected to: " + serialPort.getSystemPortName());
            broadcastConnectionStatus(true, serialPort.getSystemPortName(),
                    "Successfully connected to micro:bit");

            // Flush any initial data
            try {
                Thread.sleep(500);
                InputStream in = serialPort.getInputStream();
                byte[] buffer = new byte[1024];
                while (in.available() > 0) {
                    in.read(buffer);
                }
            } catch (Exception e) {
                logger.warn("Error flushing initial data: " + e.getMessage());
            }
        }

        return connected;
    }

    @Override
    public void startListening(Consumer<MovementType> movementCallback, Consumer<ButtonType> buttonCallback) {
        if (!connected || serialPort == null) {
            logger.error("Cannot start listening: not connected");
            broadcastConnectionStatus(false, null, "Cannot start listening: not connected");
            return;
        }

        if (listening) {
            logger.warn("Already listening");
            return;
        }

        listening = true;
        logger.info("Starting to listen for micro:bit data...");

        // Start a new thread to listen for data
        listenerThread = new Thread(() -> {
            byte[] buffer = new byte[1024];
            StringBuilder messageBuffer = new StringBuilder();

            try {
                InputStream in = serialPort.getInputStream();

                while (listening) {
                    if (in.available() > 0) {
                        int numBytes = in.read(buffer);

                        for (int i = 0; i < numBytes; i++) {
                            char c = (char) buffer[i];

                            if (c == '\n') {
                                // Process the complete message
                                String message = messageBuffer.toString().trim();
                                if (!message.isEmpty()) {
                                    logger.debug("Received message: {}", message);
                                    processMessage(message, movementCallback, buttonCallback);
                                }
                                messageBuffer = new StringBuilder();
                            } else {
                                messageBuffer.append(c);
                            }
                        }
                    }

                    // Sleep to prevent CPU hogging
                    Thread.sleep(10);
                }
            } catch (IOException | InterruptedException e) {
                logger.error("Error while listening: " + e.getMessage(), e);
                listening = false;
                connected = false;
                broadcastConnectionStatus(false, null, "Connection lost: " + e.getMessage());
            }
        });

        listenerThread.setDaemon(true);
        listenerThread.start();

        logger.info("Started listening for Micro:bit data");
    }

    /**
     * Process a message received from the Micro:bit
     * Expected format: "M:TYPE" for movements or "B:TYPE" for buttons
     * Where TYPE is one of the enum values
     */
    private void processMessage(String message, Consumer<MovementType> movementCallback,
                                Consumer<ButtonType> buttonCallback) {

        if (message.length() < 3 || !message.contains(":")) {
            logger.warn("Invalid message format: {}", message);
            return;
        }

        try {
            String type = message.substring(0, 1);
            String value = message.substring(2).trim().toUpperCase();

            logger.info("Processing message: Type={}, Value={}", type, value);

            if ("M".equals(type)) {
                // Movement message
                MovementType movement;

                try {
                    movement = MovementType.valueOf(value);
                    logger.info("Detected movement: {}", movement);
                } catch (IllegalArgumentException e) {
                    logger.warn("Unknown movement type: {}", value);
                    return;
                }

                lastMovement = movement;

                // Broadcast to WebSocket clients
                broadcastMovement(movement, currentQuizContext);

                if (movementCallback != null) {
                    movementCallback.accept(movement);
                }
            } else if ("B".equals(type)) {
                ButtonType button;

                try {
                    button = ButtonType.valueOf(value);
                    logger.info("Detected button press: {}", button);
                } catch (IllegalArgumentException e) {
                    logger.warn("Unknown button type: {}", value);
                    return;
                }

                lastButton = button;

                // Broadcast to WebSocket clients
                broadcastButtonPress(button, currentQuizContext);

                if (buttonCallback != null) {
                    buttonCallback.accept(button);
                }
            } else {
                logger.warn("Unknown message type: {}", type);
            }
        } catch (Exception e) {
            logger.error("Error processing message: {}", message, e);
        }
    }

    @Override
    public void stopListening() {
        listening = false;

        if (listenerThread != null) {
            try {
                listenerThread.join(1000);
            } catch (InterruptedException e) {
                logger.warn("Interrupted while stopping listener", e);
            }
            listenerThread = null;
        }

        logger.info("Stopped listening for Micro:bit data");
    }

    @Override
    public boolean isConnected() {
        boolean actuallyConnected = connected && serialPort != null && serialPort.isOpen();

        // If our state doesn't match reality, update it
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

    // NEW WEBSOCKET INTEGRATION METHODS

    /**
     * Set the current quiz context for broadcasting
     */
    public void setQuizContext(String quizContext) {
        this.currentQuizContext = quizContext;
        if (webSocketHandler != null) {
            webSocketHandler.broadcastQuizState(null, "context_changed", quizContext);
        }
    }

    /**
     * Broadcast quiz state changes
     */
    public void broadcastQuizState(Long quizId, String state, String currentQuestion) {
        if (webSocketHandler != null) {
            webSocketHandler.broadcastQuizState(quizId, state, currentQuestion);
        }
    }

    /**
     * Broadcast micro:bit connection status
     */
    public void broadcastConnectionStatus(boolean connected, String portName, String message) {
        if (webSocketHandler != null) {
            webSocketHandler.broadcastConnectionStatus(connected, portName, message);
        }
    }

    /**
     * Broadcast movement detection
     */
    public void broadcastMovement(MovementType movement, String quizContext) {
        if (webSocketHandler != null) {
            webSocketHandler.broadcastMovement(movement, quizContext);
        }
    }

    /**
     * Broadcast button press
     */
    public void broadcastButtonPress(ButtonType button, String quizContext) {
        if (webSocketHandler != null) {
            webSocketHandler.broadcastButtonPress(button, quizContext);
        }
    }

    /**
     * Get the number of active WebSocket sessions
     */
    public int getActiveWebSocketSessions() {
        if (webSocketHandler != null) {
            return webSocketHandler.getActiveSessionCount();
        }
        return 0;
    }

    // Close the connection when the service is destroyed
    @PreDestroy
    public void destroy() {
        if (listening) {
            stopListening();
        }

        if (connected && serialPort != null) {
            serialPort.closePort();
            connected = false;
            broadcastConnectionStatus(false, null, "Service shutting down");
            logger.info("Closed serial port connection");
        }
    }
}