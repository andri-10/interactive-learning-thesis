import React, { useState, useEffect } from 'react';
import Navigation from '../components/common/Navigation';
import SecurityDashboard from '../components/admin/SecurityDashboard';
import LockedAccountsPanel from '../components/admin/LockedAccountsPanel';
import api from '../services/api';
import { 
  Shield, 
  AlertTriangle,
  Lock,
  Activity,
  Loader,
} from 'lucide-react';

const AdminSecurity = () => {
  const [securityData, setSecurityData] = useState(null);
  const [lockedAccounts, setLockedAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchSecurityData();
    fetchLockedAccounts();
  }, []);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/admin/security/dashboard');
      setSecurityData(response.data);
    } catch (error) {
      console.error('Error fetching security data:', error);
      setError('Failed to load security data');
      
      // Mock security data for development
      setSecurityData({
        totalLoginAttempts: 1247,
        failedLoginAttempts: 89,
        lockedAccountsCount: 3,
        suspiciousActivities: 12,
        activeSessionsCount: 156,
        recentSecurityEvents: 34,
        loginSuccessRate: 92.8,
        averageSessionDuration: 28.5,
        uniqueIpAddresses: 234,
        securityScore: 87,
        trends: {
          loginAttempts: '+5.2%',
          failedLogins: '-12.3%',
          lockedAccounts: '+0.8%',
          suspiciousActivity: '-23.1%'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLockedAccounts = async () => {
    try {
      const response = await api.get('/admin/security/locked-accounts');
      setLockedAccounts(response.data?.content || response.data || []);
    } catch (error) {
      console.error('Error fetching locked accounts:', error);
      
      // Mock locked accounts data
      setLockedAccounts([
        {
          id: 1,
          userId: 103,
          username: 'john_doe',
          email: 'john@example.com',
          lockedAt: '2024-12-28T10:30:00Z',
          reason: 'Multiple failed login attempts',
          failedAttempts: 5,
          lastAttemptAt: '2024-12-28T10:25:00Z',
          ipAddress: '192.168.1.100'
        },
        {
          id: 2,
          userId: 105,
          username: 'jane_smith',
          email: 'jane@example.com',
          lockedAt: '2024-12-28T09:15:00Z',
          reason: 'Suspicious login pattern',
          failedAttempts: 3,
          lastAttemptAt: '2024-12-28T09:10:00Z',
          ipAddress: '10.0.0.50'
        },
        {
          id: 3,
          userId: 107,
          username: 'test_user',
          email: 'test@example.com',
          lockedAt: '2024-12-27T16:45:00Z',
          reason: 'Manual lock by administrator',
          failedAttempts: 0,
          lastAttemptAt: null,
          ipAddress: '172.16.0.25'
        }
      ]);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchSecurityData(), fetchLockedAccounts()]);
    setTimeout(() => setRefreshing(false), 1000);
    showToast('Security data refreshed successfully');
  };

  const handleAccountAction = async (action, accountId) => {
    try {
      if (action === 'unlock') {
        await api.post(`/admin/security/unlock/${accountId}`);
        showToast('Account unlocked successfully');
      } else if (action === 'resetAttempts') {
        await api.post(`/admin/security/reset-attempts/${accountId}`);
        showToast('Login attempts reset successfully');
      }
      
      // Refresh data after action
      await fetchLockedAccounts();
      await fetchSecurityData();
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      showToast(`Failed to ${action} account`, 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

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
            <div>Loading security dashboard...</div>
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
            <Shield size={36} style={{ color: 'var(--error)' }} />
            Security Monitoring
          </h1>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '18px',
            margin: '0 0 24px 0',
            lineHeight: '1.6'
          }}>
            Monitor authentication, detect threats, and manage account security
          </p>

          {/* Quick Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              padding: '20px',
              backgroundColor: 'var(--surface)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: securityData?.securityScore >= 80 ? 'var(--success)' : securityData?.securityScore >= 60 ? 'var(--warning)' : 'var(--error)',
                color: 'white',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                <Shield size={20} />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {securityData?.securityScore || 0}%
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Security Score
              </div>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: 'var(--surface)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: 'var(--error)',
                color: 'white',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                <Lock size={20} />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--error)', marginBottom: '4px' }}>
                {securityData?.lockedAccountsCount || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Locked Accounts
              </div>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: 'var(--surface)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: 'var(--warning)',
                color: 'white',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                <AlertTriangle size={20} />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--warning)', marginBottom: '4px' }}>
                {securityData?.suspiciousActivities || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Suspicious Activities
              </div>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: 'var(--surface)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
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
                <Activity size={20} />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--success)', marginBottom: '4px' }}>
                {securityData?.activeSessionsCount || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Active Sessions
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
              onClick={handleRefresh}
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

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '24px'
        }}>
          {/* Security Dashboard */}
          <SecurityDashboard 
            data={securityData}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />

          {/* Locked Accounts Panel */}
          <LockedAccountsPanel
            accounts={lockedAccounts}
            onAccountAction={handleAccountAction}
            onRefresh={fetchLockedAccounts}
          />
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
            {toast.type === 'success' ? <Activity size={18} /> : <AlertTriangle size={18} />}
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
};

export default AdminSecurity;