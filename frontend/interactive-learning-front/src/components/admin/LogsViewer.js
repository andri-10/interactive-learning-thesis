import React, { useEffect } from 'react';
import { 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Shield,
  User,
  Globe,
  Clock,
  FileText,
  Brain,
  Settings,
  Eye,
  Trash2,
  UserPlus,
  LogIn,
  LogOut,
  Lock,
  Unlock,
  Loader,
  Archive
} from 'lucide-react';

const LogsViewer = ({ logs = [], loading = false, logType = 'recent' }) => {
  // Safety check to ensure logs is always an array
  const safeLogs = Array.isArray(logs) ? logs : [];
  
  // Debug logging
  useEffect(() => {
    console.log('🔍 LogsViewer - Received logs:', logs);
    console.log('🔍 LogsViewer - Safe logs:', safeLogs);
    console.log('🔍 LogsViewer - Is array?', Array.isArray(logs));
    console.log('🔍 LogsViewer - Length:', safeLogs.length);
  }, [logs, safeLogs]);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const now = new Date();
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Unknown';
      
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    } catch (error) {
      console.error('Error calculating relative time:', error);
      return 'Unknown';
    }
  };

  const getSeverityColor = (severity) => {
    if (!severity) return 'var(--text-secondary)';
    switch (severity.toLowerCase()) {
      case 'error': return 'var(--error)';
      case 'warning': return 'var(--warning)';
      case 'info': return 'var(--primary)';
      case 'success': return 'var(--success)';
      default: return 'var(--text-secondary)';
    }
  };

  const getSeverityIcon = (severity) => {
    if (!severity) return <Activity size={16} />;
    switch (severity.toLowerCase()) {
      case 'error': return <XCircle size={16} />;
      case 'warning': return <AlertTriangle size={16} />;
      case 'info': return <Info size={16} />;
      case 'success': return <CheckCircle size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getActionIcon = (action) => {
    if (!action) return <Activity size={16} />;
    const actionLower = action.toLowerCase();
    
    if (actionLower.includes('login')) return <LogIn size={16} />;
    if (actionLower.includes('logout')) return <LogOut size={16} />;
    if (actionLower.includes('lock')) return <Lock size={16} />;
    if (actionLower.includes('unlock')) return <Unlock size={16} />;
    if (actionLower.includes('user') && actionLower.includes('creat')) return <UserPlus size={16} />;
    if (actionLower.includes('delete')) return <Trash2 size={16} />;
    if (actionLower.includes('document')) return <FileText size={16} />;
    if (actionLower.includes('quiz')) return <Brain size={16} />;
    if (actionLower.includes('config') || actionLower.includes('setting')) return <Settings size={16} />;
    if (actionLower.includes('view') || actionLower.includes('access')) return <Eye size={16} />;
    
    return <Activity size={16} />;
  };

  const getActionColor = (action) => {
    if (!action) return 'var(--primary)';
    const actionLower = action.toLowerCase();
    
    if (actionLower.includes('delete') || actionLower.includes('failed') || actionLower.includes('error')) {
      return 'var(--error)';
    }
    if (actionLower.includes('warning') || actionLower.includes('lock')) {
      return 'var(--warning)';
    }
    if (actionLower.includes('success') || actionLower.includes('complet') || actionLower.includes('unlock')) {
      return 'var(--success)';
    }
    
    return 'var(--primary)';
  };

  const formatActionText = (action) => {
    if (!action) return 'Unknown Action';
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderLogDetails = (log) => {
    const details = [];
    
    // Common details
    if (log.userName) {
      details.push(
        <div key="user" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <User size={12} style={{ color: 'var(--text-secondary)' }} />
          <span>{log.userName}</span>
        </div>
      );
    }
    
    if (log.ipAddress) {
      details.push(
        <div key="ip" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Globe size={12} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{log.ipAddress}</span>
        </div>
      );
    }

    // Specific details based on log type
    if (logType === 'admin' && log.targetUserId) {
      details.push(
        <div key="target" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Target:</span>
          <span style={{ fontSize: '12px' }}>User {log.targetUserId}</span>
        </div>
      );
    }

    if (logType === 'user' && log.resourceType) {
      details.push(
        <div key="resource" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Resource:</span>
          <span style={{ fontSize: '12px', textTransform: 'capitalize' }}>{log.resourceType}</span>
        </div>
      );
    }

    // Add user ID if available
    if (log.userId && log.userId !== log.userName) {
      details.push(
        <div key="userId" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>ID:</span>
          <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{log.userId}</span>
        </div>
      );
    }

    return details;
  };

  // Loading state
  if (loading && safeLogs.length === 0) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        color: 'var(--text-secondary)',
        backgroundColor: 'var(--surface)',
        borderRadius: '12px',
        border: '1px solid var(--border)'
      }}>
        <Loader size={32} className="animate-spin" style={{ marginRight: '12px' }} />
        <span style={{ fontSize: '16px' }}>Loading logs...</span>
      </div>
    );
  }

  // Empty state
  if (safeLogs.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: 'var(--text-secondary)',
        backgroundColor: 'var(--surface)',
        borderRadius: '12px',
        border: '1px solid var(--border)'
      }}>
        <Archive size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
        <div style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '600' }}>
          No logs found
        </div>
        <div style={{ fontSize: '14px' }}>
          No log entries match your current filters
        </div>
      </div>
    );
  }

  // Main logs display
  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: '12px',
      overflow: 'hidden',
      backgroundColor: 'var(--surface)'
    }}>
      {safeLogs.map((log, index) => {
        // Ensure log is an object
        if (!log || typeof log !== 'object') {
          console.warn('Invalid log entry at index', index, ':', log);
          return null;
        }

        return (
          <div
            key={log.id || `log-${index}`}
            style={{
              padding: '20px',
              borderBottom: index < safeLogs.length - 1 ? '1px solid var(--border)' : 'none',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              transition: 'background-color 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--background)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {/* Severity/Action Icon */}
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: log.severity ? getSeverityColor(log.severity) : getActionColor(log.action),
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {log.severity ? getSeverityIcon(log.severity) : getActionIcon(log.action)}
            </div>

            {/* Log Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px',
                gap: '12px'
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '4px'
                  }}>
                    {formatActionText(log.action)}
                  </div>
                  
                  {/* Log Details Row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    flexWrap: 'wrap'
                  }}>
                    {renderLogDetails(log)}
                  </div>
                </div>

                {/* Timestamp */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  flexShrink: 0
                }}>
                  <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                    {getRelativeTime(log.timestamp)}
                  </div>
                  <div style={{ opacity: 0.8 }}>
                    {formatDate(log.timestamp)}
                  </div>
                </div>
              </div>

              {/* Details/Description */}
              {log.details && (
                <div style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.4',
                  marginBottom: '8px'
                }}>
                  {log.details}
                </div>
              )}

              {/* Description field (alternative to details) */}
              {log.description && !log.details && (
                <div style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.4',
                  marginBottom: '8px'
                }}>
                  {log.description}
                </div>
              )}

              {/* Additional Info */}
              {(log.changes || log.userAgent || log.entityType || log.entityId) && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: 'var(--background)',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}>
                  {log.changes && (
                    <div style={{ marginBottom: '6px' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Changes: </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{log.changes}</span>
                    </div>
                  )}
                  {log.entityType && (
                    <div style={{ marginBottom: '6px' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Entity: </span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {log.entityType} {log.entityId && `(ID: ${log.entityId})`}
                      </span>
                    </div>
                  )}
                  {log.userAgent && (
                    <div>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>User Agent: </span>
                      <span style={{ 
                        color: 'var(--text-secondary)', 
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        wordBreak: 'break-all'
                      }}>
                        {log.userAgent}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Severity Badge */}
              {log.severity && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  backgroundColor: getSeverityColor(log.severity),
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginTop: '8px'
                }}>
                  {getSeverityIcon(log.severity)}
                  {log.severity}
                </div>
              )}

              {/* Level Badge (alternative to severity) */}
              {log.level && !log.severity && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  backgroundColor: getSeverityColor(log.level),
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginTop: '8px'
                }}>
                  {getSeverityIcon(log.level)}
                  {log.level}
                </div>
              )}
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LogsViewer;