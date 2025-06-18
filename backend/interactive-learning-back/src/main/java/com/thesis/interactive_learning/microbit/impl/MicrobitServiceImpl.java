package com.thesis.interactive_learning.microbit.impl;

import com.fazecast.jSerialComm.SerialPort;
import com.thesis.interactive_learning.microbit.ButtonType;
import com.thesis.interactive_learning.microbit.MicrobitService;
import com.thesis.interactive_learning.microbit.MovementType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.function.Consumer;

@Service
public class MicrobitServiceImpl implements MicrobitService {

    private static final Logger logger = LoggerFactory.getLogger(MicrobitServiceImpl.class);
    private SerialPort serialPort;
    private boolean connected = false;
    private MovementType lastMovement = MovementType.NONE;
    private ButtonType lastButton = ButtonType.NONE;
    private Thread listenerThread;
    private boolean listening = false;

    private static final int BAUD_RATE = 115200;
    private static final int DATA_BITS = 8;
    private static final int STOP_BITS = SerialPort.ONE_STOP_BIT;
    private static final int PARITY = SerialPort.NO_PARITY;

    @Override
    public boolean initializeConnection() {
        // Close any existing connection
        if (connected && serialPort != null) {
            serialPort.closePort();
            connected = false;
        }

        SerialPort[] ports = SerialPort.getCommPorts();

        if (ports.length == 0) {
            logger.error("No serial ports available");
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
        }

        if (serialPort == null) {
            logger.error("No serial port selected");
            return false;
        }

        // Configure and open the port
        serialPort.setComPortParameters(BAUD_RATE, DATA_BITS, STOP_BITS, PARITY);
        serialPort.setComPortTimeouts(SerialPort.TIMEOUT_READ_SEMI_BLOCKING, 1000, 0);

        connected = serialPort.openPort();
        if (!connected) {
            logger.error("Failed to open serial port: " + serialPort.getSystemPortName());
        } else {
            logger.info("Connected to: " + serialPort.getSystemPortName());

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
            return;
        }

        if (listening) {
            logger.warn("Already listening");
            return;
        }

        listening = true;

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
        return connected && serialPort != null && serialPort.isOpen();
    }

    @Override
    public MovementType getLastMovement() {
        return lastMovement;
    }

    @Override
    public ButtonType getLastButton() {
        return lastButton;
    }

    // Close the connection when the service is destroyed
    public void destroy() {
        if (listening) {
            stopListening();
        }

        if (connected && serialPort != null) {
            serialPort.closePort();
            connected = false;
            logger.info("Closed serial port connection");
        }
    }
}