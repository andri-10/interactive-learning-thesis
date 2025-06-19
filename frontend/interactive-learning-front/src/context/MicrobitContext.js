// frontend/interactive-learning-front/src/context/MicrobitContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import microbitWebSocketService from '../services/microbitWebSocket';

const MicrobitContext = createContext();

export const useMicrobit = () => {
  const context = useContext(MicrobitContext);
  if (!context) {
    throw new Error('useMicrobit must be used within a MicrobitProvider');
  }
  return context;
};

export const MicrobitProvider = ({ children }) => {
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
    console.log('🔌 Initializing global WebSocket connection...');
    
    // Set up event listeners
    const handleConnection = (data) => {
      console.log('🔌 WebSocket connection state:', data.connected);
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
      console.log('🎮 Micro:bit status update:', data);
      setMicrobitStatus(data);
      setError(null);
    };

    const handleMovement = (data) => {
      console.log('🏃 Movement detected:', data.movement);
      setLastMovement(data);
    };

    const handleButton = (data) => {
      console.log('🔘 Button pressed:', data.button);
      setLastButton(data);
    };

    const handleQuizState = (data) => {
      console.log('🧠 Quiz state:', data);
      setQuizState(data);
    };

    const handleError = (data) => {
      console.log('❌ WebSocket error:', data.error);
      setError(data.error);
    };

    // Register event listeners
    microbitWebSocketService.on('connection', handleConnection);
    microbitWebSocketService.on('microbit_status', handleMicrobitStatus);
    microbitWebSocketService.on('microbit_movement', handleMovement);
    microbitWebSocketService.on('microbit_button', handleButton);
    microbitWebSocketService.on('quiz_state', handleQuizState);
    microbitWebSocketService.on('error', handleError);

    // Connect to WebSocket globally
    microbitWebSocketService.connect();

    // Cleanup on unmount
    return () => {
      console.log('🔌 Cleaning up WebSocket connection...');
      microbitWebSocketService.off('connection', handleConnection);
      microbitWebSocketService.off('microbit_status', handleMicrobitStatus);
      microbitWebSocketService.off('microbit_movement', handleMovement);
      microbitWebSocketService.off('microbit_button', handleButton);
      microbitWebSocketService.off('quiz_state', handleQuizState);
      microbitWebSocketService.off('error', handleError);
      microbitWebSocketService.disconnect();
    };
  }, []);

  const connectMicrobit = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/microbit/connect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      console.log('🎮 Micro:bit connect response:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Error connecting micro:bit:', error);
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
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
    
    // Actions
    connectMicrobit,
  };

  return (
    <MicrobitContext.Provider value={value}>
      {children}
    </MicrobitContext.Provider>
  );
};