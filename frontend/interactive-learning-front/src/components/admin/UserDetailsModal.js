import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Activity, 
  Lock, 
  Unlock,
  Edit,
  Eye,
  FileText,
  Brain,
  Target,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  MoreVertical,
  Download,
  RefreshCw,
  Settings,
  Database,
  Globe
} from 'lucide-react';
import api from '../../services/api';

const UserDetailsModal = ({ user, isOpen, onClose, onUserUpdate }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [userSecurity, setUserSecurity] = useState(null);
  const [userActivity, setUserActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showActions, setShowActions] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchUserDetails();
      fetchUserSecurity();
      fetchUserActivity();
    }
  }, [isOpen, user?.id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/users/${user.id}`);
      setUserDetails(response.data);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to load user details');
      // Fallback to provided user data
      setUserDetails(user);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSecurity = async () => {
    try {
      const response = await api.get(`/admin/security/user/${user.id}`);
      setUserSecurity(response.data);
    } catch (error) {
      console.error('Error fetching user security:', error);
      // Mock security data for development
      setUserSecurity({
        loginAttempts: 0,
        lastFailedLogin: null,
        accountLocked: user.isLocked || false,
        lockReason: user.isLocked ? 'Multiple failed login attempts' : null,
        ipAddresses: ['192.168.1.100', '10.0.0.50'],
        devices: ['Chrome on Windows', 'Safari on iPhone'],
        securityScore: 85
      });
    }
  };

  const fetchUserActivity = async () => {
    try {
      const response = await api.get(`/admin/logs/user/${user.id}?limit=10`);
      setUserActivity(response.data.content || response.data || []);
    } catch (error) {
      console.error('Error fetching user activity:', error);
      // Mock activity data
      setUserActivity([
        {
          id: 1,
          action: 'LOGIN',
          timestamp: new Date().toISOString(),
          ipAddress: '192.168.1.100',
          userAgent: 'Chrome/120.0.0.0'
        },
        {
          id: 2,
          action: 'QUIZ_COMPLETED',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          details: 'Mathematics Quiz - Score: 85%'
        },
        {
          id: 3,
          action: 'DOCUMENT_UPLOADED',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          details: 'Chemistry Notes.pdf'
        }
      ]);
    }
  };

  const handleUserAction = async (action) => {
    try {
      setActionLoading(true);
      let response;
      
      switch (action) {
        case 'activate':
          response = await api.put(`/admin/users/${user.id}/status`, { status: 'ACTIVE' });
          break;
        case 'deactivate':
          response = await api.put(`/admin/users/${user.id}/status`, { status: 'INACTIVE' });
          break;
        case 'lock':
          // This would typically be handled by security endpoint
          break;
        case 'unlock':
          response = await api.post(`/admin/security/unlock/${user.id}`);
          break;
        case 'resetAttempts':
          response = await api.post(`/admin/security/reset-attempts/${user.id}`);
          break;
        default:
          break;
      }
      
      // Refresh data after action
      await fetchUserDetails();
      await fetchUserSecurity();
      
      // Notify parent component of user update
      if (onUserUpdate) {
        onUserUpdate(response?.data || { ...user, status: action === 'activate' ? 'ACTIVE' : 'INACTIVE' });
      }
      
      setShowActions(false);
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      setError(`Failed to ${action} user`);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return 'Never';
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  const getRoleColor = (role) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN': return 'var(--error)';
      case 'MODERATOR': return 'var(--warning)';
      case 'USER': return 'var(--primary)';
      default: return 'var(--text-secondary)';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'var(--success)';
      case 'INACTIVE': return 'var(--error)';
      case 'PENDING': return 'var(--warning)';
      default: return 'var(--text-secondary)';
    }
  };

  const getStatusIcon = (status, isLocked) => {
    if (isLocked) return <Lock size={16} />;
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return <CheckCircle size={16} />;
      case 'INACTIVE': return <XCircle size={16} />;
      case 'PENDING': return <Activity size={16} />;
      default: return <XCircle size={16} />;
    }
  };

  const getActionText = (action) => {
    const actions = {
      'LOGIN': 'Logged in',
      'LOGOUT': 'Logged out',
      'QUIZ_COMPLETED': 'Completed quiz',
      'QUIZ_STARTED': 'Started quiz',
      'DOCUMENT_UPLOADED': 'Uploaded document',
      'DOCUMENT_DELETED': 'Deleted document',
      'PROFILE_UPDATED': 'Updated profile',
      'PASSWORD_CHANGED': 'Changed password'
    };
    return actions[action] || action;
  };

  const getSecurityScoreColor = (score) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--error)';
  };

  if (!isOpen) return null;

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
        borderRadius: '20px',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column'
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: getRoleColor(user?.role),
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: '700',
              border: userSecurity?.accountLocked ? '3px solid var(--warning)' : 'none'
            }}>
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 style={{ 
                margin: '0 0 4px 0', 
                fontSize: '24px',
                fontWeight: '700',
                color: 'var(--text-primary)'
              }}>
                {user?.username}
              </h2>
              <div style={{ 
                fontSize: '14px', 
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>ID: {user?.id}</span>
                <span>•</span>
                <span style={{ color: getRoleColor(user?.role), fontWeight: '600' }}>
                  {user?.role}
                </span>
                {userSecurity?.accountLocked && (
                  <>
                    <span>•</span>
                    <span style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Lock size={12} />
                      Locked
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Quick Actions Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowActions(!showActions)}
                disabled={actionLoading}
                style={{
                  padding: '10px 16px',
                  backgroundColor: actionLoading ? 'var(--border)' : 'var(--primary)',
                  color: actionLoading ? 'var(--text-secondary)' : 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {actionLoading ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <MoreVertical size={14} />
                )}
                Actions
              </button>

              {showActions && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  marginTop: '4px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                  padding: '6px',
                  minWidth: '180px',
                  zIndex: 1001
                }}>
                  {user?.status?.toUpperCase() === 'ACTIVE' ? (
                    <button
                      onClick={() => handleUserAction('deactivate')}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: 'var(--error)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#fee2e2'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <UserX size={16} />
                      Deactivate User
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUserAction('activate')}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: 'var(--success)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#dcfce7'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <UserCheck size={16} />
                      Activate User
                    </button>
                  )}

                  {userSecurity?.accountLocked ? (
                    <button
                      onClick={() => handleUserAction('unlock')}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: 'var(--secondary)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#e0f2fe'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <Unlock size={16} />
                      Unlock Account
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUserAction('lock')}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: 'var(--warning)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#fef3c7'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <Lock size={16} />
                      Lock Account
                    </button>
                  )}

                  <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '6px 0' }} />

                  <button
                    onClick={() => handleUserAction('resetAttempts')}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      color: 'var(--accent)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f3e8ff'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <RefreshCw size={16} />
                    Reset Login Attempts
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              style={{
                padding: '10px',
                backgroundColor: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--error)';
                e.target.style.borderColor = 'var(--error)';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = 'var(--border)';
                e.target.style.color = 'var(--text-primary)';
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--background)',
          borderBottom: '1px solid var(--border)'
        }}>
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'activity', label: 'Activity', icon: Activity }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                padding: '16px 24px',
                backgroundColor: activeTab === id ? 'var(--surface)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === id ? '2px solid var(--primary)' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                color: activeTab === id ? 'var(--primary)' : 'var(--text-secondary)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== id) {
                  e.target.style.backgroundColor = 'var(--background)';
                  e.target.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== id) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{
          padding: '32px',
          overflow: 'auto',
          flex: 1
        }}>
          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              color: 'var(--error)',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px'
            }}>
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '300px',
              flexDirection: 'column',
              gap: '16px',
              color: 'var(--text-secondary)'
            }}>
              <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
              <div>Loading user details...</div>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* User Information Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '24px'
                  }}>
                    {/* Basic Information */}
                    <div style={{
                      padding: '24px',
                      backgroundColor: 'var(--background)',
                      borderRadius: '16px',
                      border: '1px solid var(--border)'
                    }}>
                      <h3 style={{
                        margin: '0 0 16px 0',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <User size={18} />
                        Basic Information
                      </h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Username</span>
                          <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                            {userDetails?.username || user?.username}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Email</span>
                          <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                            {userDetails?.email || user?.email}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Role</span>
                          <span style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            backgroundColor: getRoleColor(userDetails?.role || user?.role),
                            color: 'white',
                            borderRadius: '12px',
                            fontWeight: '600',
                            textTransform: 'uppercase'
                          }}>
                            {userDetails?.role || user?.role}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Status</span>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: getStatusColor(userDetails?.status || user?.status),
                            fontWeight: '600'
                          }}>
                            {getStatusIcon(userDetails?.status || user?.status, userSecurity?.accountLocked)}
                            {userSecurity?.accountLocked ? 'Locked' : (userDetails?.status || user?.status)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Account Activity */}
                    <div style={{
                      padding: '24px',
                      backgroundColor: 'var(--background)',
                      borderRadius: '16px',
                      border: '1px solid var(--border)'
                    }}>
                      <h3 style={{
                        margin: '0 0 16px 0',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <Calendar size={18} />
                        Account Timeline
                      </h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Created</span>
                          <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
                            {formatDate(userDetails?.createdAt || user?.createdAt)}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Last Login</span>
                          <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
                            {getRelativeTime(userDetails?.lastLogin || user?.lastLogin)}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Last Updated</span>
                          <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
                            {getRelativeTime(userDetails?.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px'
                  }}>
                    <div style={{
                      padding: '20px',
                      backgroundColor: 'var(--background)',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        padding: '12px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '12px'
                      }}>
                        <FileText size={20} />
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px' }}>
                        {userDetails?.documentCount || 0}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Documents
                      </div>
                    </div>

                    <div style={{
                      padding: '20px',
                      backgroundColor: 'var(--background)',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        padding: '12px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--secondary)',
                        color: 'white',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '12px'
                      }}>
                        <Brain size={20} />
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--secondary)', marginBottom: '4px' }}>
                        {userDetails?.quizCount || 0}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Quizzes Taken
                      </div>
                    </div>

                    <div style={{
                      padding: '20px',
                      backgroundColor: 'var(--background)',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        padding: '12px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--success)',
                        color: 'white',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '12px'
                      }}>
                        <Target size={20} />
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--success)', marginBottom: '4px' }}>
                        {userDetails?.avgScore ? `${Math.round(userDetails.avgScore)}%` : 'N/A'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Avg Score
                      </div>
                    </div>

                    <div style={{
                      padding: '20px',
                      backgroundColor: 'var(--background)',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        padding: '12px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--accent)',
                        color: 'white',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '12px'
                      }}>
                        <Clock size={20} />
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '4px' }}>
                        {userDetails?.totalHours ? `${userDetails.totalHours}h` : '0h'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Study Time
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Security Overview */}
                  <div style={{
                    padding: '24px',
                    backgroundColor: 'var(--background)',
                    borderRadius: '16px',
                    border: '1px solid var(--border)'
                  }}>
                    <h3 style={{
                      margin: '0 0 20px 0',
                      fontSize: '18px',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Shield size={18} />
                      Security Overview
                    </h3>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '20px'
                    }}>
                      {/* Security Score */}
                      <div style={{
                        padding: '20px',
                        backgroundColor: 'var(--surface)',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        textAlign: 'center'
                      }}>
                        <div style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          backgroundColor: getSecurityScoreColor(userSecurity?.securityScore || 75),
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          fontWeight: 'bold',
                          margin: '0 auto 12px'
                        }}>
                          {userSecurity?.securityScore || 75}
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                          Security Score
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          Account security rating
                        </div>
                      </div>

                      {/* Login Attempts */}
                      <div style={{
                        padding: '20px',
                        backgroundColor: 'var(--surface)',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        textAlign: 'center'
                      }}>
                        <div style={{
                          padding: '12px',
                          borderRadius: '12px',
                          backgroundColor: userSecurity?.loginAttempts > 0 ? 'var(--warning)' : 'var(--success)',
                          color: 'white',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '12px'
                        }}>
                          <AlertTriangle size={20} />
                        </div>
                        <div style={{ 
                          fontSize: '24px', 
                          fontWeight: 'bold', 
                          color: userSecurity?.loginAttempts > 0 ? 'var(--warning)' : 'var(--success)', 
                          marginBottom: '4px' 
                        }}>
                          {userSecurity?.loginAttempts || 0}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          Failed Login Attempts
                        </div>
                      </div>

                      {/* Account Status */}
                      <div style={{
                        padding: '20px',
                        backgroundColor: 'var(--surface)',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        textAlign: 'center'
                      }}>
                        <div style={{
                          padding: '12px',
                          borderRadius: '12px',
                          backgroundColor: userSecurity?.accountLocked ? 'var(--error)' : 'var(--success)',
                          color: 'white',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '12px'
                        }}>
                          {userSecurity?.accountLocked ? <Lock size={20} /> : <Unlock size={20} />}
                        </div>
                        <div style={{ 
                          fontSize: '16px', 
                          fontWeight: 'bold', 
                          color: userSecurity?.accountLocked ? 'var(--error)' : 'var(--success)', 
                          marginBottom: '4px' 
                        }}>
                          {userSecurity?.accountLocked ? 'Locked' : 'Unlocked'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          Account Status
                        </div>
                      </div>
                    </div>

                    {/* Lock Reason */}
                    {userSecurity?.accountLocked && userSecurity?.lockReason && (
                      <div style={{
                        marginTop: '20px',
                        padding: '16px',
                        backgroundColor: '#fef3cd',
                        border: '1px solid #fcd34d',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <AlertTriangle size={16} style={{ color: '#d97706' }} />
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#d97706' }}>
                            Account Locked
                          </div>
                          <div style={{ fontSize: '12px', color: '#92400e' }}>
                            Reason: {userSecurity.lockReason}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Access Information */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '24px'
                  }}>
                    {/* IP Addresses */}
                    <div style={{
                      padding: '24px',
                      backgroundColor: 'var(--background)',
                      borderRadius: '16px',
                      border: '1px solid var(--border)'
                    }}>
                      <h4 style={{
                        margin: '0 0 16px 0',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <Globe size={16} />
                        Recent IP Addresses
                      </h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {userSecurity?.ipAddresses?.map((ip, index) => (
                          <div key={index} style={{
                            padding: '8px 12px',
                            backgroundColor: 'var(--surface)',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontFamily: 'monospace',
                            color: 'var(--text-primary)'
                          }}>
                            {ip}
                          </div>
                        )) || (
                          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            No IP addresses recorded
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Devices */}
                    <div style={{
                      padding: '24px',
                      backgroundColor: 'var(--background)',
                      borderRadius: '16px',
                      border: '1px solid var(--border)'
                    }}>
                      <h4 style={{
                        margin: '0 0 16px 0',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <Database size={16} />
                        Device Information
                      </h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {userSecurity?.devices?.map((device, index) => (
                          <div key={index} style={{
                            padding: '8px 12px',
                            backgroundColor: 'var(--surface)',
                            borderRadius: '6px',
                            fontSize: '14px',
                            color: 'var(--text-primary)'
                          }}>
                            {device}
                          </div>
                        )) || (
                          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            No device information available
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Last Failed Login */}
                  {userSecurity?.lastFailedLogin && (
                    <div style={{
                      padding: '20px',
                      backgroundColor: '#fee2e2',
                      border: '1px solid #fecaca',
                      borderRadius: '12px'
                    }}>
                      <h4 style={{
                        margin: '0 0 8px 0',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: 'var(--error)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <XCircle size={16} />
                        Last Failed Login Attempt
                      </h4>
                      <div style={{ fontSize: '14px', color: '#7f1d1d' }}>
                        {formatDate(userSecurity.lastFailedLogin)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <h3 style={{
                      margin: 0,
                      fontSize: '18px',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Activity size={18} />
                      Recent Activity
                    </h3>
                    
                    <button
                      onClick={fetchUserActivity}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: 'var(--secondary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <RefreshCw size={12} />
                      Refresh
                    </button>
                  </div>

                  {/* Activity Timeline */}
                  <div style={{
                    backgroundColor: 'var(--background)',
                    borderRadius: '16px',
                    border: '1px solid var(--border)',
                    overflow: 'hidden'
                  }}>
                    {userActivity.length === 0 ? (
                      <div style={{
                        padding: '60px 20px',
                        textAlign: 'center',
                        color: 'var(--text-secondary)'
                      }}>
                        <Activity size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <div style={{ fontSize: '16px', marginBottom: '8px' }}>No recent activity</div>
                        <div style={{ fontSize: '14px' }}>
                          User activity will appear here when available
                        </div>
                      </div>
                    ) : (
                      userActivity.map((activity, index) => (
                        <div
                          key={activity.id}
                          style={{
                            padding: '20px',
                            borderBottom: index < userActivity.length - 1 ? '1px solid var(--border)' : 'none',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '16px'
                          }}
                        >
                          {/* Activity Icon */}
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            fontSize: '14px',
                            fontWeight: '600'
                          }}>
                            {activity.action === 'LOGIN' && <User size={16} />}
                            {activity.action === 'LOGOUT' && <User size={16} />}
                            {activity.action?.includes('QUIZ') && <Brain size={16} />}
                            {activity.action?.includes('DOCUMENT') && <FileText size={16} />}
                            {!['LOGIN', 'LOGOUT'].includes(activity.action) && 
                             !activity.action?.includes('QUIZ') && 
                             !activity.action?.includes('DOCUMENT') && <Activity size={16} />}
                          </div>

                          {/* Activity Details */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              marginBottom: '8px'
                            }}>
                              <div style={{
                                fontSize: '15px',
                                fontWeight: '600',
                                color: 'var(--text-primary)'
                              }}>
                                {getActionText(activity.action)}
                              </div>
                              <div style={{
                                fontSize: '12px',
                                color: 'var(--text-secondary)',
                                whiteSpace: 'nowrap'
                              }}>
                                {getRelativeTime(activity.timestamp)}
                              </div>
                            </div>

                            {/* Activity Details */}
                            {activity.details && (
                              <div style={{
                                fontSize: '14px',
                                color: 'var(--text-secondary)',
                                marginBottom: '8px'
                              }}>
                                {activity.details}
                              </div>
                            )}

                            {/* Technical Details */}
                            <div style={{
                              display: 'flex',
                              gap: '16px',
                              fontSize: '12px',
                              color: 'var(--text-secondary)'
                            }}>
                              {activity.ipAddress && (
                                <span>IP: {activity.ipAddress}</span>
                              )}
                              {activity.userAgent && (
                                <span>Device: {activity.userAgent.split('/')[0]}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Activity Export */}
                  <div style={{
                    padding: '20px',
                    backgroundColor: 'var(--background)',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        Export Activity Log
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Download complete activity history for this user
                      </div>
                    </div>
                    <button
                      style={{
                        padding: '8px 16px',
                        backgroundColor: 'var(--accent)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Download size={12} />
                      Export CSV
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx>{`
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

export default UserDetailsModal;