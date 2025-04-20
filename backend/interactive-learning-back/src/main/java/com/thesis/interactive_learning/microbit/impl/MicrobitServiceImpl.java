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
        // Note: You might need to adjust this logic based on how your Micro:bit appears
        for (SerialPort port : ports) {
            if (port.getDescriptivePortName().toLowerCase().contains("micro:bit") ||
                    port.getDescriptivePortName().toLowerCase().contains("mbed")) {
                serialPort = port;
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
                                processMessage(message, movementCallback, buttonCallback);
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
        logger.debug("Received message: " + message);

        String upperCase = message.substring(2).trim().toUpperCase();

        if (message.startsWith("M:")) {
            // Movement message
            MovementType movement;

            try {
                movement = MovementType.valueOf(upperCase);
            } catch (IllegalArgumentException e) {
                logger.warn("Unknown movement type: " + upperCase);
                return;
            }

            lastMovement = movement;

            if (movementCallback != null) {
                movementCallback.accept(movement);
            }
        } else if (message.startsWith("B:")) {
            ButtonType button;

            try {
                button = ButtonType.valueOf(upperCase);
            } catch (IllegalArgumentException e) {
                logger.warn("Unknown button type: {}", upperCase);
                return;
            }

            lastButton = button;

            if (buttonCallback != null) {
                buttonCallback.accept(button);
            }
        } else {
            logger.warn("Unknown message format: " + message);
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