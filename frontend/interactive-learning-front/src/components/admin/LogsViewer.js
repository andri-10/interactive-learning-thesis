import React from 'react';
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
  Unlock
} from 'lucide-react';

const LogsViewer = ({ logs = [], loading = false, logType = 'recent' }) => {
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return 'Unknown';
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'error': return 'var(--error)';
      case 'warning': return 'var(--warning)';
      case 'info': return 'var(--primary)';
      case 'success': return 'var(--success)';
      default: return 'var(--text-secondary)';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'error': return <XCircle size={16} />;
      case 'warning': return <AlertTriangle size={16} />;
      case 'info': return <Info size={16} />;
      case 'success': return <CheckCircle size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getActionIcon = (action) => {
    const actionLower = action?.toLowerCase() || '';
    
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
    const actionLower = action?.toLowerCase() || '';
    
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
    return action?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown Action';
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

    return details;
  };

  if (loading) {
    return (
      <div style={{
        padding: '60px 20px',
        textAlign: 'center',
        color: 'var(--text-secondary)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          margin: '0 auto 16px',
          border: '4px solid var(--border)',
          borderTop: '4px solid var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <div style={{ fontSize: '16px' }}>Loading logs...</div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div style={{
        padding: '80px 20px',
        textAlign: 'center',
        color: 'var(--text-secondary)'
      }}>
        <Activity size={64} style={{ marginBottom: '16px', opacity: 0.5 }} />
        <div style={{ fontSize: '20px', marginBottom: '8px', fontWeight: '600' }}>
          No logs found
        </div>
        <div style={{ fontSize: '14px' }}>
          No log entries match your current filters
        </div>
      </div>
    );
  }

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: '12px',
      overflow: 'hidden',
      backgroundColor: 'var(--surface)'
    }}>
      {logs.map((log, index) => (
        <div
          key={log.id}
          style={{
            padding: '20px',
            borderBottom: index < logs.length - 1 ? '1px solid var(--border)' : 'none',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--background)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
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

            {/* Additional Info */}
            {(log.changes || log.userAgent) && (
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
                {log.userAgent && (
                  <div>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>User Agent: </span>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{log.userAgent}</span>
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
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LogsViewer;