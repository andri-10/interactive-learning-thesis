package com.thesis.interactive_learning.microbit;

import java.util.function.Consumer;

public interface MicrobitService {

    /**
     * Initializes the connection with the Micro:bit device
     * @return true if connection was successful
     */
    boolean initializeConnection();

    /**
     * Starts listening for movement and button data
     * @param movementCallback Callback function to handle movement inputs
     * @param buttonCallback Callback function to handle button inputs
     */
    void startListening(Consumer<MovementType> movementCallback, Consumer<ButtonType> buttonCallback);

    /**
     * Stops listening for data
     */
    void stopListening();

    /**
     * Checks if there is an active connection
     * @return true if connected
     */
    boolean isConnected();

    /**
     * Gets the last detected movement
     * @return the last detected movement type
     */
    MovementType getLastMovement();

    /**
     * Gets the last detected button press
     * @return the last detected button type
     */
    ButtonType getLastButton();
}