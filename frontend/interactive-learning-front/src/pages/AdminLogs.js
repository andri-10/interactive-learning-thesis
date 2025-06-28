import React, { useState, useEffect } from 'react';
import Navigation from '../components/common/Navigation';
import LogsViewer from '../components/admin/LogsViewer';
import LogsFilter from '../components/admin/LogsFilter';
import api from '../services/api';
import { 
  Shield, 
  Activity, 
  Users, 
  AlertTriangle,
  Clock,
  Loader,
  RefreshCw,
  Download,
  BarChart3,
  Archive,
  Search
} from 'lucide-react';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(25);
  const [totalLogs, setTotalLogs] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    logType: 'all',
    severity: 'all',
    dateRange: '24h',
    userId: ''
  });

  const logTabs = [
    { 
      id: 'recent', 
      label: 'Recent Activity', 
      icon: Clock,
      endpoint: '/admin/logs/recent',
      description: 'Latest system activities and user actions'
    },
    { 
      id: 'security', 
      label: 'Security Logs', 
      icon: Shield,
      endpoint: '/admin/logs/security',
      description: 'Authentication and security-related events'
    },
    { 
      id: 'admin', 
      label: 'Admin Actions', 
      icon: Users,
      endpoint: '/admin/logs/admin-actions',
      description: 'Administrative actions and changes'
    },
    { 
      id: 'user', 
      label: 'User Activity', 
      icon: Activity,
      endpoint: '/admin/logs/user',
      description: 'User interactions and content activities'
    }
  ];

  useEffect(() => {
    fetchLogs();
  }, [activeTab, currentPage, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      
      const currentTabConfig = logTabs.find(tab => tab.id === activeTab);
      const params = new URLSearchParams({
        page: currentPage - 1,
        size: logsPerPage,
        ...(filters.search && { search: filters.search }),
        ...(filters.logType !== 'all' && { type: filters.logType }),
        ...(filters.severity !== 'all' && { severity: filters.severity }),
        ...(filters.dateRange !== 'all' && { range: filters.dateRange }),
        ...(filters.userId && { userId: filters.userId })
      });

      const response = await api.get(`${currentTabConfig.endpoint}?${params}`);
      
      if (response.data.content) {
        setLogs(response.data.content);
        setTotalLogs(response.data.totalElements);
      } else {
        setLogs(response.data || []);
        setTotalLogs(response.data?.length || 0);
      }

    } catch (error) {
      console.error('Error fetching logs:', error);
      setError('Failed to load logs');
      
      // Mock data for development
      const mockLogs = generateMockLogs(activeTab);
      setLogs(mockLogs);
      setTotalLogs(mockLogs.length);
    } finally {
      setLoading(false);
    }
  };

  const generateMockLogs = (tabType) => {
    const baseTime = new Date();
    const logs = [];
    
    for (let i = 0; i < 15; i++) {
      const timestamp = new Date(baseTime.getTime() - (i * 1000 * 60 * Math.random() * 60));
      
      let logEntry;
      switch (tabType) {
        case 'security':
          logEntry = {
            id: i + 1,
            timestamp: timestamp.toISOString(),
            action: ['LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'PASSWORD_CHANGE', 'ACCOUNT_LOCKED'][Math.floor(Math.random() * 5)],
            severity: ['info', 'warning', 'error'][Math.floor(Math.random() * 3)],
            userId: 100 + Math.floor(Math.random() * 50),
            userName: ['john_doe', 'jane_smith', 'admin_user', 'bob_wilson'][Math.floor(Math.random() * 4)],
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
            userAgent: 'Chrome/120.0.0.0',
            details: 'Security event occurred'
          };
          break;
        case 'admin':
          logEntry = {
            id: i + 1,
            timestamp: timestamp.toISOString(),
            action: ['USER_CREATED', 'USER_DELETED', 'CONTENT_MODERATED', 'SYSTEM_CONFIG_CHANGED', 'BULK_ACTION'][Math.floor(Math.random() * 5)],
            severity: ['info', 'warning'][Math.floor(Math.random() * 2)],
            adminUserId: 1,
            adminUserName: 'admin_user',
            targetUserId: 100 + Math.floor(Math.random() * 50),
            details: 'Administrative action performed',
            changes: 'User status changed from ACTIVE to INACTIVE'
          };
          break;
        case 'user':
          logEntry = {
            id: i + 1,
            timestamp: timestamp.toISOString(),
            action: ['DOCUMENT_UPLOADED', 'QUIZ_COMPLETED', 'QUIZ_STARTED', 'PROFILE_UPDATED', 'COLLECTION_CREATED'][Math.floor(Math.random() * 5)],
            severity: 'info',
            userId: 100 + Math.floor(Math.random() * 50),
            userName: ['john_doe', 'jane_smith', 'student_user'][Math.floor(Math.random() * 3)],
            resourceId: Math.floor(Math.random() * 100),
            resourceType: ['document', 'quiz', 'collection'][Math.floor(Math.random() * 3)],
            details: 'User activity recorded'
          };
          break;
        default: // recent
          logEntry = {
            id: i + 1,
            timestamp: timestamp.toISOString(),
            action: ['LOGIN', 'DOCUMENT_UPLOAD', 'QUIZ_COMPLETE', 'USER_REGISTER', 'CONTENT_DELETE'][Math.floor(Math.random() * 5)],
            severity: ['info', 'warning'][Math.floor(Math.random() * 2)],
            userId: 100 + Math.floor(Math.random() * 50),
            userName: ['john_doe', 'jane_smith', 'new_user'][Math.floor(Math.random() * 3)],
            details: 'Recent system activity'
          };
      }
      
      logs.push(logEntry);
    }
    
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleExport = () => {
    // Mock export functionality
    console.log('Exporting logs...', { activeTab, filters });
  };

  const totalPages = Math.ceil(totalLogs / logsPerPage);

  if (loading && logs.length === 0) {
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
            <div>Loading audit logs...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <Navigation />
      
      <div className="container" style={{ marginTop: '30px', paddingBottom: '40px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', padding: '0 20px' }}>
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
            <Archive size={36} style={{ color: 'var(--error)' }} />
            Audit Logs
          </h1>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '18px',
            margin: 0,
            lineHeight: '1.6'
          }}>
            Monitor system activities, security events, and user actions
          </p>
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
              onClick={fetchLogs}
              style={{
                marginLeft: 'auto',
                padding: '4px 12px',
                fontSize: '12px',
                backgroundColor: '#d97706',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Content */}
        <div style={{
          backgroundColor: 'var(--surface)',
          borderRadius: '20px',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--background)',
            borderBottom: '2px solid var(--border)',
            overflow: 'auto'
          }}>
            {logTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '20px 24px',
                  backgroundColor: activeTab === id ? 'var(--surface)' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === id ? '3px solid var(--primary)' : '3px solid transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: activeTab === id ? 'var(--primary)' : 'var(--text-secondary)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  minWidth: 'fit-content'
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
          <div style={{ padding: '24px' }}>
            {/* Tab Description */}
            <div style={{
              padding: '16px',
              backgroundColor: 'var(--background)',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: 'var(--text-secondary)',
                lineHeight: '1.5'
              }}>
                {logTabs.find(tab => tab.id === activeTab)?.description}
              </p>
            </div>

            {/* Controls */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <LogsFilter
                filters={filters}
                onFilterChange={handleFilterChange}
                logType={activeTab}
              />
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={fetchLogs}
                  disabled={loading}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: loading ? 'var(--border)' : 'var(--secondary)',
                    color: loading ? 'var(--text-secondary)' : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  Refresh
                </button>
                
                <button
                  onClick={handleExport}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: 'var(--accent)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
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

            {/* Logs Viewer */}
            <LogsViewer
              logs={logs}
              loading={loading}
              logType={activeTab}
            />

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
                  Showing {((currentPage - 1) * logsPerPage) + 1} to {Math.min(currentPage * logsPerPage, totalLogs)} of {totalLogs} entries
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
                      fontSize: '14px'
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
                            minWidth: '40px'
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
                      fontSize: '14px'
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
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

export default AdminLogs;