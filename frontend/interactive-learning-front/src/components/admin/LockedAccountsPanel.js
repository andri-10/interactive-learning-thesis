import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  RefreshCw, 
  User, 
  Globe,
  Clock,
  AlertTriangle,
  XCircle,
  CheckCircle,
  MoreVertical,
  Eye,
  Activity
} from 'lucide-react';

const LockedAccountsPanel = ({ accounts = [], onAccountAction, onRefresh }) => {
  const [showActions, setShowActions] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false, action: null, account: null });
  const [actionLoading, setActionLoading] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return 'Unknown';
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const handleActionClick = (action, account) => {
    setShowActions(null);
    setConfirmModal({ show: true, action, account });
  };

  const handleConfirmAction = async () => {
    const { action, account } = confirmModal;
    try {
      setActionLoading(account.id);
      await onAccountAction(action, account.userId);
      setConfirmModal({ show: false, action: null, account: null });
    } finally {
      setActionLoading(null);
    }
  };

  const renderActionDropdown = (account) => (
    <div style={{
      position: 'absolute',
      top: '100%',
      right: '0',
      marginTop: '4px',
      backgroundColor: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      padding: '4px',
      minWidth: '160px',
      zIndex: 1000
    }}>
      <button
        onClick={() => handleActionClick('unlock', account)}
        style={{
          width: '100%',
          padding: '8px 12px',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--success)',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#dcfce7'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
      >
        <Unlock size={14} />
        Unlock Account
      </button>
      
      <button
        onClick={() => handleActionClick('resetAttempts', account)}
        style={{
          width: '100%',
          padding: '8px 12px',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--secondary)',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--background)'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
      >
        <RefreshCw size={14} />
        Reset Attempts
      </button>
      
      <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '4px 0' }} />
      
      <button
        onClick={() => console.log('View user details:', account.userId)}
        style={{
          width: '100%',
          padding: '8px 12px',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text-primary)',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--background)'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
      >
        <Eye size={14} />
        View User Details
      </button>
    </div>
  );

  const renderConfirmationModal = () => {
    if (!confirmModal.show) return null;

    const { action, account } = confirmModal;
    const isUnlock = action === 'unlock';
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'var(--surface)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '400px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          {/* Header */}
          <div style={{
            padding: '24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: isUnlock ? 'var(--success)' : 'var(--secondary)',
              color: 'white'
            }}>
              {isUnlock ? <Unlock size={20} /> : <RefreshCw size={20} />}
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
                {isUnlock ? 'Unlock Account' : 'Reset Login Attempts'}
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
                Confirm this security action
              </p>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '24px' }}>
            <div style={{
              padding: '16px',
              backgroundColor: 'var(--background)',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Account Details
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Username:</span>
                  <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{account?.username}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Email:</span>
                  <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{account?.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Failed Attempts:</span>
                  <span style={{ fontWeight: '500', color: 'var(--error)' }}>{account?.failedAttempts}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Locked:</span>
                  <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{getRelativeTime(account?.lockedAt)}</span>
                </div>
              </div>
            </div>

            <p style={{
              margin: '0 0 20px 0',
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: '1.5'
            }}>
              {isUnlock 
                ? `This will unlock ${account?.username}'s account and allow them to log in immediately.`
                : `This will reset the failed login attempt counter for ${account?.username}.`
              }
            </p>
          </div>

          {/* Footer */}
          <div style={{
            padding: '20px 24px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            backgroundColor: 'var(--background)'
          }}>
            <button
              onClick={() => setConfirmModal({ show: false, action: null, account: null })}
              disabled={actionLoading === account?.id}
              style={{
                padding: '10px 16px',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                cursor: actionLoading === account?.id ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: actionLoading === account?.id ? 0.5 : 1
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmAction}
              disabled={actionLoading === account?.id}
              style={{
                padding: '10px 16px',
                backgroundColor: actionLoading === account?.id ? 'var(--border)' : (isUnlock ? 'var(--success)' : 'var(--secondary)'),
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: actionLoading === account?.id ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {actionLoading === account?.id ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {isUnlock ? <Unlock size={14} /> : <RefreshCw size={14} />}
                  {isUnlock ? 'Unlock Account' : 'Reset Attempts'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div style={{
        backgroundColor: 'var(--surface)',
        borderRadius: '20px',
        padding: '32px',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '2px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: 'var(--error)',
              color: 'white'
            }}>
              <Lock size={24} />
            </div>
            <div>
              <h3 style={{ 
                margin: 0, 
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--text-primary)'
              }}>
                Locked Accounts
              </h3>
              <p style={{
                margin: '4px 0 0 0',
                fontSize: '14px',
                color: 'var(--text-secondary)'
              }}>
                Manage accounts with security restrictions
              </p>
            </div>
          </div>

          <button
            onClick={onRefresh}
            style={{
              padding: '10px 16px',
              backgroundColor: 'var(--secondary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* Accounts List */}
        {accounts.length === 0 ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: 'var(--text-secondary)'
          }}>
            <CheckCircle size={64} style={{ marginBottom: '16px', opacity: 0.5, color: 'var(--success)' }} />
            <div style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '600' }}>
              No Locked Accounts
            </div>
            <div style={{ fontSize: '14px' }}>
              All user accounts are currently active and accessible
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {accounts.map((account) => (
              <div
                key={account.id}
                style={{
                  padding: '20px',
                  backgroundColor: 'var(--background)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#fafbfc'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--background)'}
              >
                {/* User Avatar */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--error)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: '600',
                  border: '2px solid var(--error)',
                  flexShrink: 0
                }}>
                  {account.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>

                {/* Account Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '6px'
                  }}>
                    <h4 style={{
                      margin: 0,
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'var(--text-primary)'
                    }}>
                      {account.username}
                    </h4>
                    <div style={{
                      padding: '2px 8px',
                      fontSize: '11px',
                      backgroundColor: 'var(--error)',
                      color: 'white',
                      borderRadius: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      LOCKED
                    </div>
                  </div>
                  
                  <div style={{
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    marginBottom: '8px'
                  }}>
                    {account.email}
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    fontSize: '12px',
                    color: 'var(--text-secondary)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={12} />
                      <span>{account.failedAttempts} failed attempts</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      <span>Locked {getRelativeTime(account.lockedAt)}</span>
                    </div>
                    {account.ipAddress && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Globe size={12} />
                        <span style={{ fontFamily: 'monospace' }}>{account.ipAddress}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reason */}
                <div style={{
                  padding: '8px 12px',
                  backgroundColor: '#fee2e2',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#7f1d1d',
                  maxWidth: '200px',
                  textAlign: 'center'
                }}>
                  {account.reason}
                </div>

                {/* Actions */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowActions(showActions === account.id ? null : account.id)}
                    disabled={actionLoading === account.id}
                    style={{
                      padding: '8px',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      cursor: actionLoading === account.id ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: actionLoading === account.id ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (actionLoading !== account.id) {
                        e.target.style.backgroundColor = 'var(--background)';
                        e.target.style.borderColor = 'var(--primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (actionLoading !== account.id) {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.borderColor = 'var(--border)';
                      }
                    }}
                  >
                    {actionLoading === account.id ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <MoreVertical size={16} />
                    )}
                  </button>

                  {showActions === account.id && renderActionDropdown(account)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {renderConfirmationModal()}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </>
  );
};

export default LockedAccountsPanel;