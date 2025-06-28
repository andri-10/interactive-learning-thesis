import React, { useState, useRef, useEffect } from 'react';
import { 
  MoreVertical,
  Eye,
  Edit,
  Lock,
  Unlock,
  Users,
  CheckCircle,
  XCircle,
  Activity,
  UserCheck,
  UserX,
  Shield,
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronUp,
  ArrowUpDown
} from 'lucide-react';

const UserManagementTable = ({ 
  users = [], 
  selectedUsers = new Set(), 
  onSelectUser, 
  onSelectAll, 
  onUserAction,
  loading = false,
  sortConfig = { key: null, direction: 'asc' },
  onSort
}) => {
  const [showUserActions, setShowUserActions] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserActions(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
      case 'SUSPENDED': return '#f97316';
      default: return 'var(--text-secondary)';
    }
  };

  const getStatusIcon = (status, isLocked) => {
    if (isLocked) return <Lock size={14} />;
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return <CheckCircle size={14} />;
      case 'INACTIVE': return <XCircle size={14} />;
      case 'PENDING': return <Activity size={14} />;
      case 'SUSPENDED': return <AlertTriangle size={14} />;
      default: return <XCircle size={14} />;
    }
  };

  const handleActionClick = (action, user, event) => {
    event.stopPropagation();
    setShowUserActions(null);
    onUserAction(action, user);
  };

  const handleSort = (key) => {
    if (onSort) {
      onSort(key);
    }
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown size={12} style={{ opacity: 0.5 }} />;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUp size={12} /> : 
      <ChevronDown size={12} />;
  };

  const renderActionDropdown = (user) => (
    <div 
      ref={dropdownRef}
      style={{
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
        zIndex: 1000,
        animation: 'dropdownSlide 0.2s ease-out'
      }}
    >
      {/* View Details */}
      <button
        onClick={(e) => handleActionClick('view', user, e)}
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
          color: 'var(--text-primary)',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'var(--background)';
          e.target.style.color = 'var(--primary)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.color = 'var(--text-primary)';
        }}
      >
        <Eye size={16} />
        <span>View Details</span>
      </button>
      
      {/* Edit User */}
      <button
        onClick={(e) => handleActionClick('edit', user, e)}
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
          color: 'var(--text-primary)',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'var(--background)';
          e.target.style.color = 'var(--secondary)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.color = 'var(--text-primary)';
        }}
      >
        <Edit size={16} />
        <span>Edit User</span>
      </button>

      {/* Security Section */}
      <div style={{
        height: '1px',
        backgroundColor: 'var(--border)',
        margin: '6px 0'
      }} />

      {/* Activate/Deactivate */}
      {user.status?.toUpperCase() === 'ACTIVE' ? (
        <button
          onClick={(e) => handleActionClick('deactivate', user, e)}
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
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#fee2e2';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          <UserX size={16} />
          <span>Deactivate</span>
        </button>
      ) : (
        <button
          onClick={(e) => handleActionClick('activate', user, e)}
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
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#dcfce7';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          <UserCheck size={16} />
          <span>Activate</span>
        </button>
      )}

      {/* Lock/Unlock */}
      {user.isLocked ? (
        <button
          onClick={(e) => handleActionClick('unlock', user, e)}
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
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#e0f2fe';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          <Unlock size={16} />
          <span>Unlock Account</span>
        </button>
      ) : (
        <button
          onClick={(e) => handleActionClick('lock', user, e)}
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
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#fef3c7';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          <Lock size={16} />
          <span>Lock Account</span>
        </button>
      )}

      {/* Admin Actions */}
      {user.role?.toUpperCase() !== 'ADMIN' && (
        <>
          <div style={{
            height: '1px',
            backgroundColor: 'var(--border)',
            margin: '6px 0'
          }} />
          
          <button
            onClick={(e) => handleActionClick('makeAdmin', user, e)}
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
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f3e8ff';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            <Shield size={16} />
            <span>Make Admin</span>
          </button>
        </>
      )}
    </div>
  );

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: '16px',
      overflow: 'hidden',
      backgroundColor: 'var(--surface)'
    }}>
      {/* Table Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '60px 1fr 220px 140px 140px 160px 80px',
        gap: '16px',
        padding: '20px',
        backgroundColor: 'var(--background)',
        borderBottom: '2px solid var(--border)',
        fontSize: '14px',
        fontWeight: '600',
        color: 'var(--text-secondary)'
      }}>
        {/* Select All Checkbox */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={selectedUsers.size === users.length && users.length > 0}
            onChange={onSelectAll}
            style={{ 
              margin: '0',
              width: '16px',
              height: '16px',
              cursor: 'pointer'
            }}
          />
        </div>

        {/* Sortable Headers */}
        <button
          onClick={() => handleSort('username')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            textAlign: 'left',
            padding: '0'
          }}
        >
          <span>User</span>
          {getSortIcon('username')}
        </button>

        <button
          onClick={() => handleSort('email')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            textAlign: 'left',
            padding: '0'
          }}
        >
          <span>Email</span>
          {getSortIcon('email')}
        </button>

        <button
          onClick={() => handleSort('role')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            textAlign: 'left',
            padding: '0'
          }}
        >
          <span>Role</span>
          {getSortIcon('role')}
        </button>

        <button
          onClick={() => handleSort('status')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            textAlign: 'left',
            padding: '0'
          }}
        >
          <span>Status</span>
          {getSortIcon('status')}
        </button>

        <button
          onClick={() => handleSort('lastLogin')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            textAlign: 'left',
            padding: '0'
          }}
        >
          <span>Last Login</span>
          {getSortIcon('lastLogin')}
        </button>

        <span>Actions</span>
      </div>

      {/* Table Body */}
      {loading ? (
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
          <div style={{ fontSize: '16px' }}>Loading users...</div>
        </div>
      ) : users.length === 0 ? (
        <div style={{
          padding: '80px 20px',
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          <Users size={64} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <div style={{ fontSize: '20px', marginBottom: '8px', fontWeight: '600' }}>
            No users found
          </div>
          <div style={{ fontSize: '14px' }}>
            No users match your current search and filter criteria
          </div>
        </div>
      ) : (
        users.map((user, index) => (
          <div
            key={user.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr 220px 140px 140px 160px 80px',
              gap: '16px',
              padding: '20px',
              borderBottom: index < users.length - 1 ? '1px solid var(--border)' : 'none',
              backgroundColor: selectedUsers.has(user.id) 
                ? '#f0f9ff' 
                : hoveredRow === user.id 
                ? '#fafbfc' 
                : 'white',
              transition: 'all 0.2s ease',
              alignItems: 'center',
              cursor: 'pointer'
            }}
            onMouseEnter={() => setHoveredRow(user.id)}
            onMouseLeave={() => setHoveredRow(null)}
            onClick={() => onSelectUser && onSelectUser(user.id)}
          >
            {/* Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={selectedUsers.has(user.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelectUser && onSelectUser(user.id);
                }}
                style={{ 
                  margin: '0',
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* User Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: getRoleColor(user.role),
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: '700',
                flexShrink: 0,
                border: user.isLocked ? '2px solid var(--warning)' : 'none'
              }}>
                {user.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ 
                  fontWeight: '600', 
                  color: 'var(--text-primary)',
                  fontSize: '15px',
                  marginBottom: '2px'
                }}>
                  {user.username}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  ID: {user.id}
                  {user.isLocked && (
                    <Lock size={12} style={{ color: 'var(--warning)' }} />
                  )}
                </div>
              </div>
            </div>

            {/* Email */}
            <div style={{ 
              fontSize: '14px', 
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {user.email}
            </div>

            {/* Role Badge */}
            <div style={{
              padding: '6px 12px',
              fontSize: '12px',
              backgroundColor: getRoleColor(user.role),
              color: 'white',
              borderRadius: '16px',
              fontWeight: '600',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 'fit-content'
            }}>
              {user.role}
            </div>

            {/* Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: getStatusColor(user.status),
              fontWeight: '500'
            }}>
              {getStatusIcon(user.status, user.isLocked)}
              <span>
                {user.isLocked ? 'Locked' : user.status}
              </span>
            </div>

            {/* Last Login */}
            <div style={{ 
              fontSize: '13px', 
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Calendar size={12} />
              {getRelativeTime(user.lastLogin)}
            </div>

            {/* Actions */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUserActions(showUserActions === user.id ? null : user.id);
                }}
                style={{
                  padding: '10px',
                  backgroundColor: hoveredRow === user.id ? 'var(--background)' : 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--primary)';
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = hoveredRow === user.id ? 'var(--background)' : 'transparent';
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.color = 'var(--text-primary)';
                }}
              >
                <MoreVertical size={16} />
              </button>

              {/* Actions Dropdown */}
              {showUserActions === user.id && renderActionDropdown(user)}
            </div>
          </div>
        ))
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes dropdownSlide {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default UserManagementTable;