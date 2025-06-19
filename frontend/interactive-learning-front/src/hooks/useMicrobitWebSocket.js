// frontend/interactive-learning-front/src/hooks/useMicrobitWebSocket.js
import { useState, useEffect, useCallback } from 'react';
import microbitWebSocketService from '../services/microbitWebSocket';

export const useMicrobitWebSocket = () => {
  const [connectionState, setConnectionState] = useState({
    connected: false,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5
  });

  const [microbitStatus, setMicrobitStatus] = useState({
    connected: false,
    portName: null,
    message: 'Disconnected',
    timestamp: null
  });

  const [lastMovement, setLastMovement] = useState({
    movement: null,
    quizContext: null,
    timestamp: null
  });

  const [lastButton, setLastButton] = useState({
    button: null,
    quizContext: null,
    timestamp: null
  });

  const [quizState, setQuizState] = useState({
    quizId: null,
    state: null,
    currentQuestion: null,
    timestamp: null
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    // Set up event listeners
    const handleConnection = (data) => {
      setConnectionState({
        connected: data.connected,
        reconnectAttempts: microbitWebSocketService.reconnectAttempts,
        maxReconnectAttempts: microbitWebSocketService.maxReconnectAttempts
      });
      
      if (!data.connected && data.reason) {
        setError(`Connection lost: ${data.reason}`);
      } else if (data.connected) {
        setError(null);
      }
    };

    const handleMicrobitStatus = (data) => {
      setMicrobitStatus(data);
      setError(null);
    };

    const handleMovement = (data) => {
      setLastMovement(data);
    };

    const handleButton = (data) => {
      setLastButton(data);
    };

    const handleQuizState = (data) => {
      setQuizState(data);
    };

    const handleError = (data) => {
      setError(data.error);
    };

    // Register event listeners
    microbitWebSocketService.on('connection', handleConnection);
    microbitWebSocketService.on('microbit_status', handleMicrobitStatus);
    microbitWebSocketService.on('microbit_movement', handleMovement);
    microbitWebSocketService.on('microbit_button', handleButton);
    microbitWebSocketService.on('quiz_state', handleQuizState);
    microbitWebSocketService.on('error', handleError);

    // Connect to WebSocket
    microbitWebSocketService.connect();

    // Cleanup on unmount
    return () => {
      microbitWebSocketService.off('connection', handleConnection);
      microbitWebSocketService.off('microbit_status', handleMicrobitStatus);
      microbitWebSocketService.off('microbit_movement', handleMovement);
      microbitWebSocketService.off('microbit_button', handleButton);
      microbitWebSocketService.off('quiz_state', handleQuizState);
      microbitWebSocketService.off('error', handleError);
    };
  }, []);

  const connect = useCallback(() => {
    microbitWebSocketService.connect();
  }, []);

  const disconnect = useCallback(() => {
    microbitWebSocketService.disconnect();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Connection state
    connectionState,
    isWebSocketConnected: connectionState.connected,
    
    // Micro:bit status
    microbitStatus,
    isMicrobitConnected: microbitStatus.connected,
    
    // Input events
    lastMovement,
    lastButton,
    
    // Quiz state
    quizState,
    
    // Error handling
    error,
    clearError,
    
    // Connection control
    connect,
    disconnect,
    
    // Utility
    getConnectionInfo: () => microbitWebSocketService.getConnectionState()
  };
};

export default useMicrobitWebSocket;