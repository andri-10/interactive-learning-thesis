import React, { useState } from 'react';
import useMicrobitWebSocket from '../../hooks/useMicrobitWebSocket';
import api from '../../services/api';

const MicrobitStatus = ({ showDetailed = false, onConnect = null }) => {
  const {
    connectionState,
    isWebSocketConnected,
    microbitStatus,
    isMicrobitConnected,
    lastMovement,
    lastButton,
    error,
    clearError
  } = useMicrobitWebSocket();

  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState(null);

  const handleConnect = async () => {
    setConnecting(true);
    setConnectError(null);
    
    try {
      const response = await api.post('/microbit/connect');
      
      if (response.data.connected) {
        console.log('Micro:bit connected successfully');
        if (onConnect) {
          onConnect(true);
        }
      } else {
        setConnectError(response.data.message || 'Failed to connect');
      }
    } catch (error) {
      console.error('Error connecting to micro:bit:', error);
      setConnectError(error.response?.data?.message || 'Connection failed');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await api.post('/microbit/disconnect');
      console.log('Micro:bit disconnected');
      if (onConnect) {
        onConnect(false);
      }
    } catch (error) {
      console.error('Error disconnecting micro:bit:', error);
    }
  };

  const getStatusColor = () => {
    if (!isWebSocketConnected) return '#6b7280'; // gray
    if (isMicrobitConnected) return '#10b981'; // green
    return '#ef4444'; // red
  };

  const getStatusText = () => {
    if (!isWebSocketConnected) return 'WebSocket Disconnected';
    if (isMicrobitConnected) return `Connected (${microbitStatus.portName || 'Unknown Port'})`;
    return 'Micro:bit Disconnected';
  };

  const getStatusIcon = () => {
    if (!isWebSocketConnected) return '🔌';
    if (isMicrobitConnected) return '🟢';
    return '🔴';
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div style={{
      backgroundColor: 'var(--surface)',
      border: '2px solid var(--border)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: showDetailed ? '20px' : '0'
    }}>
      {/* Main Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: showDetailed ? '16px' : '0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(),
            boxShadow: `0 0 8px ${getStatusColor()}`,
            animation: isMicrobitConnected ? 'pulse 2s infinite' : 'none'
          }} />
          
          <div>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {getStatusIcon()} Micro:bit Status
            </div>
            <div style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              marginTop: '2px'
            }}>
              {getStatusText()}
            </div>
          </div>
        </div>

        {/* Connection Button */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {isMicrobitConnected ? (
            <button
              onClick={handleDisconnect}
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--error)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#dc2626';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'var(--error)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={connecting || !isWebSocketConnected}
              style={{
                padding: '8px 16px',
                backgroundColor: connecting || !isWebSocketConnected ? 'var(--border)' : 'var(--primary)',
                color: connecting || !isWebSocketConnected ? 'var(--text-secondary)' : 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: connecting || !isWebSocketConnected ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s',
                opacity: connecting || !isWebSocketConnected ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!connecting && isWebSocketConnected) {
                  e.target.style.backgroundColor = 'var(--primary-dark)';
                  e.target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!connecting && isWebSocketConnected) {
                  e.target.style.backgroundColor = 'var(--primary)';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              {connecting ? 'Connecting...' : 'Connect'}
            </button>
          )}
        </div>
      </div>

      {/* Error Messages */}
      {(error || connectError) && (
        <div style={{
          backgroundColor: '#fee',
          color: 'var(--error)',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: showDetailed ? '16px' : '0',
          fontSize: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{error || connectError}</span>
          <button
            onClick={() => {
              clearError();
              setConnectError(null);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--error)',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '0 4px'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Detailed Information */}
      {showDetailed && (
        <div>
          {/* WebSocket Status */}
          <div style={{
            padding: '12px',
            backgroundColor: 'var(--background)',
            borderRadius: '8px',
            marginBottom: '12px'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '8px'
            }}>
              WebSocket Connection
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Status: {isWebSocketConnected ? '🟢 Connected' : '🔴 Disconnected'}
              {connectionState.reconnectAttempts > 0 && (
                <span style={{ marginLeft: '8px' }}>
                  (Reconnect attempts: {connectionState.reconnectAttempts}/{connectionState.maxReconnectAttempts})
                </span>
              )}
            </div>
          </div>

          {/* Micro:bit Information */}
          {isMicrobitConnected && (
            <div style={{
              padding: '12px',
              backgroundColor: 'var(--background)',
              borderRadius: '8px',
              marginBottom: '12px'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '8px'
              }}>
                Device Information
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                <div>Port: {microbitStatus.portName || 'Unknown'}</div>
                <div>Last Updated: {formatTimestamp(microbitStatus.timestamp)}</div>
                {microbitStatus.message && (
                  <div>Message: {microbitStatus.message}</div>
                )}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {(lastMovement.movement || lastButton.button) && (
            <div style={{
              padding: '12px',
              backgroundColor: 'var(--background)',
              borderRadius: '8px'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '8px'
              }}>
                Recent Activity
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {lastMovement.movement && (
                  <div style={{ marginBottom: '4px' }}>
                    🏃 Movement: {lastMovement.movement} 
                    {lastMovement.timestamp && ` (${formatTimestamp(lastMovement.timestamp)})`}
                  </div>
                )}
                {lastButton.button && (
                  <div>
                    🔘 Button: {lastButton.button} 
                    {lastButton.timestamp && ` (${formatTimestamp(lastButton.timestamp)})`}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Connection Guide */}
      {!isMicrobitConnected && !connecting && (
        <div style={{
          marginTop: showDetailed ? '16px' : '12px',
          padding: '12px',
          backgroundColor: 'var(--primary)',
          color: 'white',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>
            💡 Connection Guide:
          </div>
          <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
            1. Connect your micro:bit via USB cable<br/>
            2. Make sure the micro:bit program is running<br/>
            3. Click "Connect" to establish connection
          </div>
        </div>
      )}
    </div>
  );
};

export default MicrobitStatus;