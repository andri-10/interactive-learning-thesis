import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import useMicrobitWebSocket from '../../hooks/useMicrobitWebSocket';
import api from '../../services/api';

const MicrobitDetectionPopup = ({ isOpen, onClose, onSuccess }) => {
  const {
    isWebSocketConnected,
    isMicrobitConnected,
    microbitStatus,
    error
  } = useMicrobitWebSocket();

  const [step, setStep] = useState('detecting');
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('detecting');
      setConnectionError(null);
      setShowInstructions(false);
      
      if (!isWebSocketConnected) {
        setStep('error');
        setConnectionError('WebSocket connection required');
        return;
      }

      detectMicrobit();
    }
  }, [isOpen, isWebSocketConnected]);

  useEffect(() => {
    if (isMicrobitConnected && step === 'connecting') {
      setStep('success');
      setTimeout(() => {
        onSuccess && onSuccess();
        onClose();
      }, 2000);
    }
  }, [isMicrobitConnected, step, onSuccess, onClose]);

  const detectMicrobit = async () => {
    try {
      setStep('detecting');
      
      const statusResponse = await api.get('/microbit/status');
      
      if (statusResponse.data.connected) {
        setStep('success');
        setTimeout(() => {
          onSuccess && onSuccess();
          onClose();
        }, 1500);
        return;
      }
      
      // Try to connect
      setTimeout(() => {
        setStep('connecting');
        connectMicrobit();
      }, 1500);
      
    } catch (error) {
      console.error('Error during detection:', error);
      setStep('error');
      setConnectionError('Failed to detect micro:bit');
    }
  };

  const connectMicrobit = async () => {
    try {
      setConnecting(true);
      setConnectionError(null);
      
      const response = await api.post('/microbit/connect');
      
      if (response.data.connected) {
        setStep('success');
        setTimeout(() => {
          onSuccess && onSuccess();
          onClose();
        }, 2000);
      } else {
        setStep('error');
        setConnectionError(response.data.message || 'Connection failed');
        setShowInstructions(true);
      }
    } catch (error) {
      console.error('Error connecting to micro:bit:', error);
      setStep('error');
      setConnectionError(error.response?.data?.message || 'Connection failed');
      setShowInstructions(true);
    } finally {
      setConnecting(false);
    }
  };

  const handleRetry = () => {
    setConnectionError(null);
    setShowInstructions(false);
    detectMicrobit();
  };

  const renderDetecting = () => (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <div style={{
        width: '80px',
        height: '80px',
        margin: '0 auto 20px',
        borderRadius: '50%',
        border: '4px solid var(--border)',
        borderTop: '4px solid var(--primary)',
        animation: 'spin 1s linear infinite'
      }} />
      <h3 style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>
        🔍 Detecting micro:bit...
      </h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '0' }}>
        Looking for connected devices
      </p>
    </div>
  );

  const renderConnecting = () => (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <div style={{
        width: '80px',
        height: '80px',
        margin: '0 auto 20px',
        borderRadius: '50%',
        border: '4px solid var(--border)',
        borderTop: '4px solid var(--success)',
        animation: 'spin 1s linear infinite'
      }} />
      <h3 style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>
        🔗 Connecting to micro:bit...
      </h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '0' }}>
        Establishing communication
      </p>
    </div>
  );

  const renderSuccess = () => (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <div style={{
        width: '80px',
        height: '80px',
        margin: '0 auto 20px',
        borderRadius: '50%',
        backgroundColor: 'var(--success)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '40px',
        animation: 'bounce 0.6s ease-in-out'
      }}>
        ✓
      </div>
      <h3 style={{ marginBottom: '12px', color: 'var(--success)' }}>
        🎉 micro:bit Connected!
      </h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '0' }}>
        {microbitStatus.portName && `Connected via ${microbitStatus.portName}`}
      </p>
    </div>
  );

  const renderError = () => (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <div style={{
        width: '80px',
        height: '80px',
        margin: '0 auto 20px',
        borderRadius: '50%',
        backgroundColor: 'var(--error)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '40px',
        color: 'white'
      }}>
        ⚠
      </div>
      <h3 style={{ marginBottom: '12px', color: 'var(--error)' }}>
        Connection Failed
      </h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
        {connectionError || error || 'Unable to connect to micro:bit'}
      </p>

      {showInstructions && (
        <div style={{
          textAlign: 'left',
          padding: '16px',
          backgroundColor: 'var(--background)',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h4 style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>
            🛠️ Troubleshooting Steps:
          </h4>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>1. Check USB Connection:</strong><br/>
              • Ensure micro:bit is connected via USB cable<br/>
              • Try a different USB port or cable
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>2. Verify micro:bit Program:</strong><br/>
              • Make sure the correct program is flashed<br/>
              • Check that the micro:bit is not in sleep mode
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>3. Driver Issues:</strong><br/>
              • Install micro:bit drivers if needed<br/>
              • Restart your computer if necessary
            </div>
            <div>
              <strong>4. Port Permissions:</strong><br/>
              • On Linux/Mac: Check serial port permissions<br/>
              • On Windows: Ensure drivers are installed
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          onClick={handleRetry}
          className="btn-primary"
          style={{ padding: '12px 24px' }}
        >
          🔄 Try Again
        </button>
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          style={{
            padding: '12px 24px',
            border: '2px solid var(--border)',
            borderRadius: '8px',
            backgroundColor: 'transparent',
            cursor: 'pointer'
          }}
        >
          {showInstructions ? 'Hide' : 'Show'} Instructions
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (step) {
      case 'detecting':
        return renderDetecting();
      case 'connecting':
        return renderConnecting();
      case 'success':
        return renderSuccess();
      case 'error':
        return renderError();
      default:
        return renderDetecting();
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={step !== 'detecting' && step !== 'connecting' ? onClose : undefined}
      title="micro:bit Connection"
      maxWidth="500px"
    >
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes bounce {
            0%, 20%, 53%, 80%, 100% {
              transform: translate3d(0,0,0);
            }
            40%, 43% {
              transform: translate3d(0,-8px,0);
            }
            70% {
              transform: translate3d(0,-4px,0);
            }
            90% {
              transform: translate3d(0,-2px,0);
            }
          }
        `}
      </style>
      {renderContent()}
    </Modal>
  );
};

export default MicrobitDetectionPopup;