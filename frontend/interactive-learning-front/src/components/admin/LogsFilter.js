import React from 'react';
import { Search, Filter, Calendar, User, AlertTriangle } from 'lucide-react';

const LogsFilter = ({ filters, onFilterChange, logType }) => {
  
  const handleFilterUpdate = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const getLogTypeOptions = () => {
    const commonOptions = [
      { value: 'all', label: 'All Types' }
    ];

    switch (logType) {
      case 'security':
        return [
          ...commonOptions,
          { value: 'login', label: 'Login Events' },
          { value: 'logout', label: 'Logout Events' },
          { value: 'auth_failed', label: 'Failed Authentication' },
          { value: 'password', label: 'Password Changes' },
          { value: 'account_locked', label: 'Account Locks' }
        ];
      case 'admin':
        return [
          ...commonOptions,
          { value: 'user_management', label: 'User Management' },
          { value: 'content_moderation', label: 'Content Moderation' },
          { value: 'system_config', label: 'System Configuration' },
          { value: 'bulk_actions', label: 'Bulk Actions' }
        ];
      case 'user':
        return [
          ...commonOptions,
          { value: 'document', label: 'Document Actions' },
          { value: 'quiz', label: 'Quiz Actions' },
          { value: 'profile', label: 'Profile Changes' },
          { value: 'collection', label: 'Collection Actions' }
        ];
      default:
        return [
          ...commonOptions,
          { value: 'system', label: 'System Events' },
          { value: 'user_action', label: 'User Actions' },
          { value: 'admin_action', label: 'Admin Actions' },
          { value: 'security', label: 'Security Events' }
        ];
    }
  };

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      flexWrap: 'wrap'
    }}>
      {/* Search Input */}
      <div style={{ position: 'relative', minWidth: '250px' }}>
        <Search 
          size={14} 
          style={{ 
            position: 'absolute', 
            left: '10px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: 'var(--text-secondary)'
          }} 
        />
        <input
          type="text"
          placeholder="Search logs..."
          value={filters.search}
          onChange={(e) => handleFilterUpdate('search', e.target.value)}
          style={{
            width: '100%',
            padding: '10px 10px 10px 32px',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      {/* Log Type Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
        <select
          value={filters.logType}
          onChange={(e) => handleFilterUpdate('logType', e.target.value)}
          style={{
            padding: '10px 12px',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'white',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          {getLogTypeOptions().map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Severity Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <AlertTriangle size={14} style={{ color: 'var(--text-secondary)' }} />
        <select
          value={filters.severity}
          onChange={(e) => handleFilterUpdate('severity', e.target.value)}
          style={{
            padding: '10px 12px',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'white',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="all">All Severities</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
          <option value="success">Success</option>
        </select>
      </div>

      {/* Date Range Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Calendar size={14} style={{ color: 'var(--text-secondary)' }} />
        <select
          value={filters.dateRange}
          onChange={(e) => handleFilterUpdate('dateRange', e.target.value)}
          style={{
            padding: '10px 12px',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'white',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* User ID Filter (for admin and user activity logs) */}
      {(logType === 'admin' || logType === 'user') && (
        <div style={{ position: 'relative', minWidth: '150px' }}>
          <User 
            size={14} 
            style={{ 
              position: 'absolute', 
              left: '10px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: 'var(--text-secondary)'
            }} 
          />
          <input
            type="text"
            placeholder="User ID..."
            value={filters.userId}
            onChange={(e) => handleFilterUpdate('userId', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 10px 10px 32px',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
      )}

      {/* Clear Filters */}
      {(filters.search || filters.logType !== 'all' || filters.severity !== 'all' || 
        filters.dateRange !== '24h' || filters.userId) && (
        <button
          onClick={() => onFilterChange({
            search: '',
            logType: 'all',
            severity: 'all',
            dateRange: '24h',
            userId: ''
          })}
          style={{
            padding: '10px 12px',
            backgroundColor: 'transparent',
            color: 'var(--error)',
            border: '1px solid var(--error)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'var(--error)';
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = 'var(--error)';
          }}
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default LogsFilter;