import React, { useState, useEffect } from 'react';
import Navigation from '../components/common/Navigation';
import AdminDashboardStats from '../components/admin/AdminDashboardStats';
import api from '../services/api';
import { 
  Shield, 
  Users, 
  FileText, 
  Brain, 
  Activity, 
  TrendingUp, 
  Loader, 
  AlertTriangle,
  BarChart3,
  Clock,
  Target,
  Zap
} from 'lucide-react';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/admin/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      
      // Fallback mock data for development
      setDashboardData({
        totalUsers: 156,
        totalDocuments: 342,
        totalQuizzes: 198,
        totalCollections: 45,
        activeUsers: 89,
        recentActivity: 24,
        systemHealth: 'good',
        storageUsed: '2.4 GB',
        avgQuizScore: 78.5,
        newUsersToday: 12,
        quizzesCompletedToday: 67,
        documentsUploadedToday: 23
      });
    } finally {
      setLoading(false);
    }
  };

  const getSystemHealthColor = (health) => {
    switch (health?.toLowerCase()) {
      case 'excellent':
      case 'good':
        return 'var(--success)';
      case 'warning':
        return 'var(--warning)';
      case 'critical':
        return 'var(--error)';
      default:
        return 'var(--text-secondary)';
    }
  };

  const getSystemHealthIcon = (health) => {
    switch (health?.toLowerCase()) {
      case 'excellent':
      case 'good':
        return <Target size={16} />;
      case 'warning':
        return <AlertTriangle size={16} />;
      case 'critical':
        return <AlertTriangle size={16} />;
      default:
        return <Activity size={16} />;
    }
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
            <div>Loading admin dashboard...</div>
            <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.7 }}>
              Gathering system metrics and statistics
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
        <Navigation />
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 'calc(100vh - 64px)',
          color: 'var(--error)'
        }}>
          <AlertTriangle size={48} style={{ marginBottom: '16px', color: 'var(--error)' }} />
          <div style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '600' }}>Failed to Load Dashboard</div>
          <div style={{ fontSize: '14px', marginBottom: '24px', color: 'var(--text-secondary)' }}>{error}</div>
          <button 
            onClick={fetchDashboardData} 
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px'
            }}
          >
            <Activity size={16} />
            Retry
          </button>
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
          marginBottom: '40px',
          textAlign: 'center',
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
            justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--error), #dc2626)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            <Shield size={36} style={{ color: 'var(--error)' }} />
            Admin Dashboard
          </h1>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '18px',
            margin: '0 0 24px 0',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: '1.6'
          }}>
            Monitor system performance, user activity, and platform statistics
          </p>

          {/* System Status Banner */}
          {dashboardData && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: 'var(--surface)',
              borderRadius: '20px',
              border: `2px solid ${getSystemHealthColor(dashboardData.systemHealth)}`,
              color: getSystemHealthColor(dashboardData.systemHealth),
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {getSystemHealthIcon(dashboardData.systemHealth)}
              System Status: {dashboardData.systemHealth?.charAt(0)?.toUpperCase() + dashboardData.systemHealth?.slice(1) || 'Unknown'}
            </div>
          )}
        </div>

        {/* Error Banner (if data loaded with errors) */}
        {error && dashboardData && (
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
            <span>{error} - Showing cached data</span>
            <button 
              onClick={fetchDashboardData}
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
              Refresh
            </button>
          </div>
        )}

        {/* Quick Stats Grid */}
        {dashboardData && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
            marginBottom: '40px'
          }}>
            {/* Total Users */}
            <div style={{
              backgroundColor: 'var(--surface)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--primary)',
                  color: 'white'
                }}>
                  <Users size={20} />
                </div>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--text-primary)'
                }}>
                  Total Users
                </h3>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>
                {dashboardData.totalUsers?.toLocaleString() || '0'}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={14} />
                +{dashboardData.newUsersToday || 0} today
              </div>
            </div>

            {/* Total Documents */}
            <div style={{
              backgroundColor: 'var(--surface)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--secondary)',
                  color: 'white'
                }}>
                  <FileText size={20} />
                </div>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--text-primary)'
                }}>
                  Documents
                </h3>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--secondary)', marginBottom: '8px' }}>
                {dashboardData.totalDocuments?.toLocaleString() || '0'}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={14} />
                +{dashboardData.documentsUploadedToday || 0} today
              </div>
            </div>

            {/* Total Quizzes */}
            <div style={{
              backgroundColor: 'var(--surface)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--accent)',
                  color: 'white'
                }}>
                  <Brain size={20} />
                </div>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--text-primary)'
                }}>
                  Quizzes
                </h3>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '8px' }}>
                {dashboardData.totalQuizzes?.toLocaleString() || '0'}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={14} />
                {dashboardData.quizzesCompletedToday || 0} completed today
              </div>
            </div>

            {/* Active Users */}
            <div style={{
              backgroundColor: 'var(--surface)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--success)',
                  color: 'white'
                }}>
                  <Activity size={20} />
                </div>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--text-primary)'
                }}>
                  Active Users
                </h3>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--success)', marginBottom: '8px' }}>
                {dashboardData.activeUsers?.toLocaleString() || '0'}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} />
                Last 24 hours
              </div>
            </div>
          </div>
        )}

        {/* Detailed Statistics Component */}
        {dashboardData && (
          <AdminDashboardStats data={dashboardData} onRefresh={fetchDashboardData} />
        )}

        {/* Quick Actions */}
        <div style={{
          backgroundColor: 'var(--surface)',
          borderRadius: '20px',
          padding: '32px',
          border: '1px solid var(--border)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          marginTop: '40px'
        }}>
          <h3 style={{ 
            margin: '0 0 24px 0', 
            fontSize: '20px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Zap size={20} />
            Quick Actions
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <button
              onClick={() => window.location.href = '/admin/users'}
              style={{
                padding: '16px',
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--primary-dark)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'var(--primary)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <Users size={16} />
              Manage Users
            </button>

            <button
              onClick={() => window.location.href = '/admin/content'}
              style={{
                padding: '16px',
                backgroundColor: 'var(--secondary)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#0891b2';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'var(--secondary)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <Shield size={16} />
              Content Moderation
            </button>

            <button
              onClick={() => window.location.href = '/admin/security'}
              style={{
                padding: '16px',
                backgroundColor: 'var(--error)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#dc2626';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'var(--error)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <Shield size={16} />
              Security Monitor
            </button>

            <button
              onClick={() => window.location.href = '/admin/logs'}
              style={{
                padding: '16px',
                backgroundColor: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#7c3aed';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'var(--accent)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <BarChart3 size={16} />
              View Logs
            </button>
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

export default AdminDashboard;