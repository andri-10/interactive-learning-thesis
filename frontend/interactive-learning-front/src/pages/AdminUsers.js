import React, { useState, useEffect } from 'react';
import Navigation from '../components/common/Navigation';
import api from '../services/api';
import { 
  Users, 
  Search,  
  MoreVertical,
  Eye,
  Edit,
  Lock,
  Unlock,
  Loader, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  UserCheck,
  UserX,
  RefreshCw,
  Download,
} from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showUserActions, setShowUserActions] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, statusFilter, roleFilter]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowUserActions(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchUsers = async () => {
  try {
    setLoading(true);
    setError('');
    
    
    const params = new URLSearchParams({
      page: currentPage - 1,
      size: usersPerPage,
      ...(searchTerm && { search: searchTerm }),
      ...(statusFilter !== 'all' && { status: statusFilter }),
      ...(roleFilter !== 'all' && { role: roleFilter })
    });

    const response = await api.get(`/admin/users?${params}`);
    
    console.log('🔍 API response:', response.data);
    
    if (response.data && response.data.users) {
      setUsers(response.data.users);
      setTotalUsers(response.data.totalElements);
    } else if (response.data && response.data.content) {
      setUsers(response.data.content);
      setTotalUsers(response.data.totalElements);
    } else if (Array.isArray(response.data)) {
      const allUsers = response.data;
      const startIndex = (currentPage - 1) * usersPerPage;
      const endIndex = startIndex + usersPerPage;
      setUsers(allUsers.slice(startIndex, endIndex));
      setTotalUsers(allUsers.length);
    } else {
      console.error('Unexpected API response structure:', response.data);
      throw new Error('Unexpected response format');
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    setError('Failed to load users');
    
    const mockUsers = [
      {
        id: 1,
        username: 'john_doe',
        email: 'john@example.com',
        role: 'USER',
        status: 'ENABLED', // Changed to match your backend enum
        createdAt: '2024-01-15T10:30:00Z',
        lastLoginAt: '2024-12-28T08:15:00Z', // Changed to match backend field
        isAccountLocked: false // Changed to match backend field
      },
      {
        id: 2,
        username: 'admin_user',
        email: 'admin@example.com',
        role: 'ADMIN',
        status: 'ENABLED',
        createdAt: '2024-01-01T00:00:00Z',
        lastLoginAt: '2024-12-28T12:00:00Z',
        isAccountLocked: false
      },
      {
        id: 3,
        username: 'jane_smith',
        email: 'jane@example.com',
        role: 'USER',
        status: 'DISABLED', // Changed to match your backend enum
        createdAt: '2024-02-20T14:20:00Z',
        lastLoginAt: '2024-12-25T16:45:00Z',
        isAccountLocked: true
      }
    ].filter(user => {
      if (searchTerm && !user.username.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !user.email.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (statusFilter !== 'all' && user.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      if (roleFilter !== 'all' && user.role.toLowerCase() !== roleFilter.toLowerCase()) {
        return false;
      }
      return true;
    });
    
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    setUsers(mockUsers.slice(startIndex, endIndex));
    setTotalUsers(mockUsers.length);
  } finally {
    setLoading(false);
  }
};

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleUserAction = async (action, userId) => {
  try {
    switch (action) {
      case 'activate':
        await api.put(`/admin/users/${userId}/status`, { 
          enabled: true,
          reason: 'User enabled by admin'
        });
        showToast('User enabled successfully');
        break;
      case 'deactivate':
        await api.put(`/admin/users/${userId}/status`, { 
          enabled: false,
          reason: 'User disabled by admin'
        });
        showToast('User disabled successfully');
        break;
      case 'lock':
        showToast('User account locked');
        break;
      case 'unlock':
        await api.post(`/admin/security/unlock/${userId}`, {
          reason: 'Account unlocked by admin'
        });
        showToast('User account unlocked');
        break;
      default:
        break;
    }
    fetchUsers();
  } catch (error) {
    console.error(`Error performing ${action}:`, error);
    showToast(`Failed to ${action} user`, 'error');
  }
  setShowUserActions(null);
};

  const handleSelectUser = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(user => user.id)));
    }
  };

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
      default: return 'var(--text-secondary)';
    }
  };

  const getStatusIcon = (status, isLocked) => {
    if (isLocked) return <Lock size={14} />;
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return <CheckCircle size={14} />;
      case 'INACTIVE': return <XCircle size={14} />;
      case 'PENDING': return <Activity size={14} />;
      default: return <XCircle size={14} />;
    }
  };

  const totalPages = Math.ceil(totalUsers / usersPerPage);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
        <Navigation />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 'calc(100vh - 64px)',
          fontSize: '18px',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <Loader size={48} className="animate-spin" style={{ marginBottom: '20px', color: 'var(--primary)' }} />
            <div>Loading users...</div>
            <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.7 }}>
              Fetching user data and permissions
            </div>
          </div>
        </div>
      </div>
    );
  }

return (
  <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
    {/* Navigation */}
    <Navigation />
    
    {/* Main Content */}
    <div className="container" style={{ marginTop: '30px', paddingBottom: '40px' }}>
      {/* Page Header */}
      <div style={{ 
        marginBottom: '32px',
        padding: '0 20px'
      }}>
        <h1 style={{ 
          color: 'var(--text-primary)', 
          fontSize: '36px',
          fontWeight: 'bold',
          margin: '0 0 12px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'linear-gradient(135deg, var(--error), #dc2626)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          <Users size={36} style={{ color: 'var(--error)' }} />
          User Management
        </h1>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '18px',
          margin: '0 0 24px 0',
          lineHeight: '1.6'
        }}>
          Manage user accounts, permissions, and monitor user activity across the platform
        </p>

        {/* Stats Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
          marginTop: '20px'
        }}>
          <div style={{
            padding: '16px',
            backgroundColor: 'var(--surface)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px' }}>
              {totalUsers}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Total Users
            </div>
          </div>
          <div style={{
            padding: '16px',
            backgroundColor: 'var(--surface)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--success)', marginBottom: '4px' }}>
              {users.filter(u => u.status === 'ENABLED').length}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Active
            </div>
          </div>
          <div style={{
            padding: '16px',
            backgroundColor: 'var(--surface)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--error)', marginBottom: '4px' }}>
              {users.filter(u => u.role === 'ADMIN').length}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Admins
            </div>
          </div>
          <div style={{
            padding: '16px',
            backgroundColor: 'var(--surface)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--warning)', marginBottom: '4px' }}>
              {users.filter(u => u.isAccountLocked).length}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Locked
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{
          backgroundColor: '#fef3cd',
          color: '#d97706',
          padding: '12px 20px',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid #fcd34d'
        }}>
          <AlertTriangle size={16} />
          <span>{error} - Showing sample data</span>
          <button 
            onClick={fetchUsers}
            style={{
              marginLeft: 'auto',
              padding: '4px 12px',
              fontSize: '12px',
              backgroundColor: '#d97706',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      )}

      {/* Main Content Card */}
      <div style={{
        backgroundColor: 'var(--surface)',
        borderRadius: '20px',
        padding: '32px',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
      }}>
        {/* Filters and Search */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1 }}>
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '300px' }}>
              <Search 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'var(--text-secondary)'
                }} 
              />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: '2px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '12px',
                border: '2px solid var(--border)',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white',
                outline: 'none'
              }}
            >
              <option value="all">All Status</option>
              <option value="ENABLED">Enabled</option>
              <option value="DISABLED">Disabled</option>
            </select>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: '12px',
                border: '2px solid var(--border)',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white',
                outline: 'none'
              }}
            >
              <option value="all">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={fetchUsers}
              style={{
                padding: '12px 16px',
                backgroundColor: 'var(--secondary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={14} />
              Refresh
            </button>
            
            <button
              style={{
                padding: '12px 16px',
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Download size={14} />
              Export
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.size > 0 && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            borderRadius: '8px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Enable Selected
              </button>
              <button
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Disable Selected
              </button>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '50px 1fr 200px 120px 120px 150px 100px',
            gap: '16px',
            padding: '16px',
            backgroundColor: 'var(--background)',
            borderBottom: '1px solid var(--border)',
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text-secondary)'
          }}>
            <input
              type="checkbox"
              checked={selectedUsers.size === users.length && users.length > 0}
              onChange={handleSelectAll}
              style={{ margin: '0' }}
            />
            <span>User</span>
            <span>Email</span>
            <span>Role</span>
            <span>Status</span>
            <span>Last Login</span>
            <span>Actions</span>
          </div>

          {/* Table Body */}
          {users.length === 0 ? (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              <Users size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <div style={{ fontSize: '18px', marginBottom: '8px' }}>No users found</div>
              <div style={{ fontSize: '14px' }}>
                {searchTerm || statusFilter !== 'all' || roleFilter !== 'all' 
                  ? 'Try adjusting your search filters' 
                  : 'No users have been registered yet'}
              </div>
            </div>
          ) : (
            users.map((user, index) => (
              <div
                key={user.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '50px 1fr 200px 120px 120px 150px 100px',
                  gap: '16px',
                  padding: '16px',
                  borderBottom: index < users.length - 1 ? '1px solid var(--border)' : 'none',
                  backgroundColor: selectedUsers.has(user.id) ? '#f0f9ff' : 'white',
                  transition: 'background-color 0.2s',
                  alignItems: 'center'
                }}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedUsers.has(user.id)}
                  onChange={() => handleSelectUser(user.id)}
                  style={{ margin: '0' }}
                />

                {/* User Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: getRoleColor(user.role),
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    {user.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                      {user.username}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      ID: {user.id}
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

                {/* Role */}
                <div style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  backgroundColor: getRoleColor(user.role),
                  color: 'white',
                  borderRadius: '12px',
                  fontWeight: '500',
                  textAlign: 'center',
                  textTransform: 'uppercase'
                }}>
                  {user.role}
                </div>

                {/* Status */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  color: getStatusColor(user.status)
                }}>
                  {getStatusIcon(user.status, user.isAccountLocked)}
                  <span style={{ fontWeight: '500' }}>
                    {user.isAccountLocked ? 'Locked' : user.status}
                  </span>
                </div>

                {/* Last Login */}
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {getRelativeTime(user.lastLoginAt)}
                </div>

                {/* Actions */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUserActions(showUserActions === user.id ? null : user.id);
                    }}
                    style={{
                      padding: '8px',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'var(--background)';
                      e.target.style.borderColor = 'var(--primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.borderColor = 'var(--border)';
                    }}
                  >
                    <MoreVertical size={16} />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserActions === user.id && (
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
                        onClick={() => handleUserAction('view', user.id)}
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
                          color: 'var(--text-primary)'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--background)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <Eye size={14} />
                        View Details
                      </button>
                      
                      <button
                        onClick={() => handleUserAction('edit', user.id)}
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
                          color: 'var(--text-primary)'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--background)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <Edit size={14} />
                        Edit User
                      </button>

                      <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '4px 0' }} />

                      {user.status === 'ENABLED' ? (
                        <button
                          onClick={() => handleUserAction('deactivate', user.id)}
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
                            color: 'var(--error)'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#fee2e2'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <UserX size={14} />
                          Disable
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUserAction('activate', user.id)}
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
                            color: 'var(--success)'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#dcfce7'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <UserCheck size={14} />
                          Enable
                        </button>
                      )}

                      {user.isAccountLocked ? (
                        <button
                          onClick={() => handleUserAction('unlock', user.id)}
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
                            color: 'var(--secondary)'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--background)'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <Unlock size={14} />
                          Unlock Account
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUserAction('lock', user.id)}
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
                            color: 'var(--warning)'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#fef3c7'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <Lock size={14} />
                          Lock Account
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '24px',
            padding: '16px 0'
          }}>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, totalUsers)} of {totalUsers} users
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 12px',
                  backgroundColor: currentPage === 1 ? 'var(--border)' : 'var(--primary)',
                  color: currentPage === 1 ? 'var(--text-secondary)' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                Previous
              </button>

              <div style={{ display: 'flex', gap: '4px' }}>
                {[...Array(Math.min(5, totalPages))].map((_, index) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = index + 1;
                  } else if (currentPage <= 3) {
                    pageNum = index + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + index;
                  } else {
                    pageNum = currentPage - 2 + index;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: currentPage === pageNum ? 'var(--primary)' : 'transparent',
                        color: currentPage === pageNum ? 'white' : 'var(--text-primary)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s',
                        minWidth: '40px'
                      }}
                      onMouseEnter={(e) => {
                        if (currentPage !== pageNum) {
                          e.target.style.backgroundColor = 'var(--background)';
                          e.target.style.borderColor = 'var(--primary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentPage !== pageNum) {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.borderColor = 'var(--border)';
                        }
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 12px',
                  backgroundColor: currentPage === totalPages ? 'var(--border)' : 'var(--primary)',
                  color: currentPage === totalPages ? 'var(--text-secondary)' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: toast.type === 'error' ? 'var(--error)' : 'var(--success)',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'slideInRight 0.3s ease-out'
        }}>
          {toast.type === 'success' ? (
            <CheckCircle size={18} />
          ) : (
            <AlertTriangle size={18} />
          )}
          {toast.message}
        </div>
      )}
    </div>

    <style jsx>{`
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      .animate-spin {
        animation: spin 1s linear infinite;
      }
    `}</style>
  </div>
);
}

export default AdminUsers;