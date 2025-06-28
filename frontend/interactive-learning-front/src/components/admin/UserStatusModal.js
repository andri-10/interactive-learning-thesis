import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Lock, 
  Unlock,
  UserCheck,
  UserX,
  Shield,
  RefreshCw,
  Activity,
  Clock,
  User,
  ExclamationTriangle
} from 'lucide-react';

const UserStatusModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  user, 
  action, 
  loading = false 
}) => {
  const [reason, setReason] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [notifyUser, setNotifyUser] = useState(true);
  const [temporaryAction, setTemporaryAction] = useState(false);
  const [duration, setDuration] = useState('24');

  if (!isOpen || !user || !action) return null;

  const getActionConfig = () => {
    const configs = {
      activate: {
        title: 'Activate User Account',
        description: 'This will restore full access to the user account and allow the user to log in and use all platform features.',
        icon: UserCheck,
        iconColor: 'var(--success)',
        buttonText: 'Activate Account',
        buttonColor: 'var(--success)',
        severity: 'low',
        warningText: 'The user will immediately regain access to their account.',
        reasonRequired: false,
        reasonPlaceholder: 'Optional: Reason for activation...'
      },
      deactivate: {
        title: 'Deactivate User Account',
        description: 'This will prevent the user from logging in and accessing any platform features. Their data will be preserved.',
        icon: UserX,
        iconColor: 'var(--error)',
        buttonText: 'Deactivate Account',
        buttonColor: 'var(--error)',
        severity: 'high',
        warningText: 'The user will immediately lose access to their account and all platform features.',
        reasonRequired: true,
        reasonPlaceholder: 'Required: Reason for deactivation...'
      },
      lock: {
        title: 'Lock User Account',
        description: 'This will temporarily lock the account due to security concerns. The user will not be able to log in until unlocked.',
        icon: Lock,
        iconColor: 'var(--warning)',
        buttonText: 'Lock Account',
        buttonColor: 'var(--warning)',
        severity: 'medium',
        warningText: 'This action is typically used for security purposes and can be reversed.',
        reasonRequired: true,
        reasonPlaceholder: 'Required: Security reason for locking account...'
      },
      unlock: {
        title: 'Unlock User Account',
        description: 'This will remove the security lock from the account and allow the user to log in normally.',
        icon: Unlock,
        iconColor: 'var(--secondary)',
        buttonText: 'Unlock Account',
        buttonColor: 'var(--secondary)',
        severity: 'low',
        warningText: 'The user will be able to log in immediately after unlocking.',
        reasonRequired: false,
        reasonPlaceholder: 'Optional: Reason for unlocking...'
      },
      suspend: {
        title: 'Suspend User Account',
        description: 'This will temporarily suspend the account for a specified period. The user will not be able to access the platform.',
        icon: ExclamationTriangle,
        iconColor: '#f97316',
        buttonText: 'Suspend Account',
        buttonColor: '#f97316',
        severity: 'high',
        warningText: 'This is a temporary restriction that will automatically expire.',
        reasonRequired: true,
        reasonPlaceholder: 'Required: Reason for suspension...'
      },
      resetAttempts: {
        title: 'Reset Login Attempts',
        description: 'This will reset the failed login attempt counter for this user account.',
        icon: RefreshCw,
        iconColor: 'var(--accent)',
        buttonText: 'Reset Attempts',
        buttonColor: 'var(--accent)',
        severity: 'low',
        warningText: 'This will clear any login attempt restrictions.',
        reasonRequired: false,
        reasonPlaceholder: 'Optional: Reason for resetting attempts...'
      },
      makeAdmin: {
        title: 'Grant Administrator Access',
        description: 'This will grant full administrative privileges to this user account. Use with extreme caution.',
        icon: Shield,
        iconColor: 'var(--error)',
        buttonText: 'Grant Admin Access',
        buttonColor: 'var(--error)',
        severity: 'critical',
        warningText: 'This user will have full administrative control over the platform.',
        reasonRequired: true,
        reasonPlaceholder: 'Required: Justification for admin privileges...'
      }
    };
    
    return configs[action] || configs.activate;
  };

  const config = getActionConfig();

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'high': return 'var(--error)';
      case 'medium': return 'var(--warning)';
      case 'low': return 'var(--success)';
      default: return 'var(--text-secondary)';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <AlertTriangle size={16} />;
      case 'high': return <XCircle size={16} />;
      case 'medium': return <AlertTriangle size={16} />;
      case 'low': return <CheckCircle size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const handleConfirm = () => {
    if (config.reasonRequired && !reason.trim()) {
      return; // Don't proceed if reason is required but not provided
    }

    const actionData = {
      action,
      reason: reason.trim(),
      notifyUser,
      temporaryAction: temporaryAction && action === 'suspend',
      duration: temporaryAction ? parseInt(duration) : null
    };

    onConfirm(actionData);
  };

  const isReasonValid = !config.reasonRequired || reason.trim().length > 0;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'var(--surface)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'modalSlideIn 0.3s ease-out'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '2px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: config.iconColor,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <config.icon size={20} />
            </div>
            <div>
              <h2 style={{ 
                margin: '0 0 4px 0', 
                fontSize: '20px',
                fontWeight: '700',
                color: 'var(--text-primary)'
              }}>
                {config.title}
              </h2>
              <div style={{ 
                fontSize: '14px', 
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <User size={12} />
                {user.username} ({user.email})
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: loading ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = 'var(--error)';
                e.target.style.borderColor = 'var(--error)';
                e.target.style.color = 'white';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = 'var(--border)';
                e.target.style.color = 'var(--text-primary)';
              }
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{
          padding: '32px',
          overflow: 'auto',
          flex: 1
        }}>
          {/* Severity Warning */}
          <div style={{
            padding: '16px',
            backgroundColor: config.severity === 'critical' ? '#fee2e2' : config.severity === 'high' ? '#fef3cd' : '#f0f9ff',
            border: `1px solid ${getSeverityColor(config.severity)}`,
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <div style={{ color: getSeverityColor(config.severity), marginTop: '2px' }}>
              {getSeverityIcon(config.severity)}
            </div>
            <div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: getSeverityColor(config.severity),
                marginBottom: '4px'
              }}>
                {config.severity === 'critical' ? 'Critical Action' : 
                 config.severity === 'high' ? 'High Impact Action' :
                 config.severity === 'medium' ? 'Moderate Impact' : 'Low Impact Action'}
              </div>
              <div style={{
                fontSize: '13px',
                color: config.severity === 'critical' ? '#7f1d1d' : config.severity === 'high' ? '#92400e' : '#1e40af',
                lineHeight: '1.5'
              }}>
                {config.warningText}
              </div>
            </div>
          </div>

          {/* Action Description */}
          <div style={{
            marginBottom: '24px'
          }}>
            <h3 style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              What will happen?
            </h3>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: '1.6'
            }}>
              {config.description}
            </p>
          </div>

          {/* Reason Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '8px'
            }}>
              Reason {config.reasonRequired && <span style={{ color: 'var(--error)' }}>*</span>}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={config.reasonPlaceholder}
              disabled={loading}
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '12px',
                border: `2px solid ${!isReasonValid ? 'var(--error)' : 'var(--border)'}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.2s',
                backgroundColor: loading ? 'var(--background)' : 'white',
                opacity: loading ? 0.7 : 1
              }}
              onFocus={(e) => {
                if (!loading && isReasonValid) {
                  e.target.style.borderColor = 'var(--primary)';
                }
              }}
              onBlur={(e) => {
                e.target.style.borderColor = !isReasonValid ? 'var(--error)' : 'var(--border)';
              }}
            />
            {!isReasonValid && (
              <div style={{
                fontSize: '12px',
                color: 'var(--error)',
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <AlertTriangle size={12} />
                A reason is required for this action
              </div>
            )}
          </div>

          {/* Advanced Options */}
          <div style={{ marginBottom: '24px' }}>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              disabled={loading}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 0',
                opacity: loading ? 0.5 : 1
              }}
            >
              <Activity size={14} />
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </button>

            {showAdvanced && (
              <div style={{
                marginTop: '16px',
                padding: '16px',
                backgroundColor: 'var(--background)',
                borderRadius: '8px',
                border: '1px solid var(--border)'
              }}>
                {/* Notify User Option */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  <input
                    type="checkbox"
                    id="notifyUser"
                    checked={notifyUser}
                    onChange={(e) => setNotifyUser(e.target.checked)}
                    disabled={loading}
                    style={{ margin: 0 }}
                  />
                  <label 
                    htmlFor="notifyUser" 
                    style={{ 
                      fontSize: '14px', 
                      color: 'var(--text-primary)',
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Send notification email to user
                  </label>
                </div>

                {/* Temporary Action for Suspensions */}
                {action === 'suspend' && (
                  <>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '12px'
                    }}>
                      <input
                        type="checkbox"
                        id="temporaryAction"
                        checked={temporaryAction}
                        onChange={(e) => setTemporaryAction(e.target.checked)}
                        disabled={loading}
                        style={{ margin: 0 }}
                      />
                      <label 
                        htmlFor="temporaryAction" 
                        style={{ 
                          fontSize: '14px', 
                          color: 'var(--text-primary)',
                          cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Set automatic expiration
                      </label>
                    </div>

                    {temporaryAction && (
                      <div style={{ marginLeft: '26px' }}>
                        <label style={{
                          display: 'block',
                          fontSize: '12px',
                          color: 'var(--text-secondary)',
                          marginBottom: '4px'
                        }}>
                          Duration (hours)
                        </label>
                        <select
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          disabled={loading}
                          style={{
                            padding: '6px 8px',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            fontSize: '12px',
                            backgroundColor: 'white'
                          }}
                        >
                          <option value="1">1 hour</option>
                          <option value="6">6 hours</option>
                          <option value="24">24 hours</option>
                          <option value="72">3 days</option>
                          <option value="168">1 week</option>
                        </select>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Current User Status */}
          <div style={{
            padding: '16px',
            backgroundColor: 'var(--background)',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            marginBottom: '24px'
          }}>
            <h4 style={{
              margin: '0 0 8px 0',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              Current Status
            </h4>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px'
            }}>
              <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
              <span style={{
                padding: '2px 8px',
                fontSize: '12px',
                backgroundColor: user.status === 'ACTIVE' ? 'var(--success)' : 'var(--error)',
                color: 'white',
                borderRadius: '12px',
                fontWeight: '600'
              }}>
                {user.isLocked ? 'LOCKED' : user.status}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>Role:</span>
              <span style={{
                padding: '2px 8px',
                fontSize: '12px',
                backgroundColor: 'var(--primary)',
                color: 'white',
                borderRadius: '12px',
                fontWeight: '600'
              }}>
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '24px 32px',
          borderTop: '2px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--background)'
        }}>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Clock size={12} />
            This action will be logged and timestamped
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '12px 20px',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                border: '2px solid var(--border)',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
                opacity: loading ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = 'var(--background)';
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.color = 'var(--primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.color = 'var(--text-secondary)';
                }
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleConfirm}
              disabled={loading || !isReasonValid}
              style={{
                padding: '12px 20px',
                backgroundColor: loading || !isReasonValid ? 'var(--border)' : config.buttonColor,
                color: loading || !isReasonValid ? 'var(--text-secondary)' : 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading || !isReasonValid ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: '140px',
                justifyContent: 'center'
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <config.icon size={14} />
                  {config.buttonText}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
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

export default UserStatusModal;