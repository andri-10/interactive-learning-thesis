import SockJS from 'sockjs-client';

class MicrobitWebSocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
    this.listeners = new Map();
    this.reconnectTimeout = null;
    
    
    this.wsUrl = process.env.REACT_APP_WS_URL || 'http://localhost:8080/ws/microbit';
  }

  connect() {
    try {
     
      this.socket = new SockJS(this.wsUrl);
      
      this.socket.onopen = () => {
        console.log('WebSocket connected to micro:bit service');
        this.connected = true;
        this.reconnectAttempts = 0;
        this.emit('connection', { connected: true });
        
      
        this.sendPing();
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        this.connected = false;
        this.emit('connection', { connected: false, reason: event.reason });
        
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', { error: 'WebSocket connection error' });
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.emit('error', { error: 'Failed to create WebSocket connection' });
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket) {
      this.socket.close(1000, 'Manual disconnect');
      this.socket = null;
    }
    
    this.connected = false;
    this.reconnectAttempts = 0;
  }

  scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectInterval * this.reconnectAttempts;
    
    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimeout = setTimeout(() => {
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect();
    }, delay);
  }

  sendPing() {
    if (this.connected && this.socket) {
      try {
        this.socket.send('ping');
      } catch (error) {
        console.error('Error sending ping:', error);
      }
    }
  }

  handleMessage(data) {
    const { type } = data;
    
    switch (type) {
      case 'connected':
      case 'disconnected':
        this.emit('microbit_status', {
          connected: data.connected,
          portName: data.portName,
          message: data.message,
          timestamp: data.timestamp
        });
        break;
        
      case 'movement':
        this.emit('microbit_movement', {
          movement: data.movement,
          quizContext: data.quizContext,
          timestamp: data.timestamp
        });
        break;
        
      case 'button':
        this.emit('microbit_button', {
          button: data.button,
          quizContext: data.quizContext,
          timestamp: data.timestamp
        });
        break;
        
      case 'quiz_state':
        this.emit('quiz_state', {
          quizId: data.quizId,
          state: data.state,
          currentQuestion: data.currentQuestion,
          timestamp: data.timestamp
        });
        break;
        
      default:
        console.warn('Unknown WebSocket message type:', type);
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket event callback for ${event}:`, error);
        }
      });
    }
  }

  isConnected() {
    return this.connected;
  }

  getConnectionState() {
    return {
      connected: this.connected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }
}

const microbitWebSocketService = new MicrobitWebSocketService();

export default microbitWebSocketService;