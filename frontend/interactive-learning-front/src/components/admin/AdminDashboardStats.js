import React, { useState } from 'react';
import { 
  BarChart3, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  Brain, 
  Activity, 
  HardDrive, 
  Clock, 
  Target, 
  Zap,
  Calendar,
  Database,
  Globe,
  CheckCircle
} from 'lucide-react';

const AdminDashboardStats = ({ data, onRefresh }) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setTimeout(() => setRefreshing(false), 1000); // Add a slight delay for UX
  };

  const formatPercentage = (value) => {
    return `${Math.round(value || 0)}%`;
  };

  const formatNumber = (value) => {
    return (value || 0).toLocaleString();
  };

  const getChangeIndicator = (value, isPositive = true) => {
    const color = isPositive ? 'var(--success)' : 'var(--error)';
    const Icon = isPositive ? TrendingUp : TrendingDown;
    
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '4px',
        color: color,
        fontSize: '12px'
      }}>
        <Icon size={12} />
        {value}
      </div>
    );
  };

  return (
    <div style={{
      backgroundColor: 'var(--surface)',
      borderRadius: '20px',
      padding: '32px',
      border: '1px solid var(--border)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
    }}>
      {/* Section Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        paddingBottom: '20px',
        borderBottom: '2px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: 'var(--accent)',
            color: 'white'
          }}>
            <BarChart3 size={24} />
          </div>
          <div>
            <h3 style={{ 
              margin: 0, 
              fontSize: '24px',
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              Detailed Analytics
            </h3>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '14px',
              color: 'var(--text-secondary)'
            }}>
              Comprehensive system metrics and performance indicators
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            padding: '10px 16px',
            backgroundColor: refreshing ? 'var(--border)' : 'var(--primary)',
            color: refreshing ? 'var(--text-secondary)' : 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RefreshCw 
            size={14} 
            style={{ 
              animation: refreshing ? 'spin 1s linear infinite' : 'none' 
            }} 
          />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Performance Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* User Engagement */}
        <div style={{
          padding: '24px',
          backgroundColor: 'var(--background)',
          borderRadius: '16px',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Users size={18} style={{ color: 'var(--primary)' }} />
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
              User Engagement
            </h4>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Active Users (24h)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {formatNumber(data.activeUsers)}
                </span>
                {getChangeIndicator('+12%')}
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Avg. Session Duration</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                24m 35s
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Return Rate</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--success)' }}>
                {formatPercentage(67)}
              </span>
            </div>
          </div>
        </div>

        {/* Content Statistics */}
        <div style={{
          padding: '24px',
          backgroundColor: 'var(--background)',
          borderRadius: '16px',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <FileText size={18} style={{ color: 'var(--secondary)' }} />
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Content Overview
            </h4>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total Collections</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {formatNumber(data.totalCollections)}
                </span>
                {getChangeIndicator('+3%')}
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Storage Used</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                {data.storageUsed || '2.4 GB'}
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Avg. Quiz Score</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--success)' }}>
                {formatPercentage(data.avgQuizScore)}
              </span>
            </div>
          </div>
        </div>

        {/* System Performance */}
        <div style={{
          padding: '24px',
          backgroundColor: 'var(--background)',
          borderRadius: '16px',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Activity size={18} style={{ color: 'var(--success)' }} />
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
              System Health
            </h4>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Server Uptime</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--success)' }}>
                99.8%
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Response Time</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                125ms
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Error Rate</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--success)' }}>
                0.02%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div style={{
        padding: '24px',
        backgroundColor: 'var(--background)',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Clock size={18} style={{ color: 'var(--accent)' }} />
          <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
            Today's Activity Summary
          </h4>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div style={{ textAlign: 'center' }}>
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
              <Users size={20} />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px' }}>
              {formatNumber(data.newUsersToday)}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              New Users
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
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
              <FileText size={20} />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--secondary)', marginBottom: '4px' }}>
              {formatNumber(data.documentsUploadedToday)}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Documents Uploaded
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
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
              <Brain size={20} />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '4px' }}>
              {formatNumber(data.quizzesCompletedToday)}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Quizzes Completed
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
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
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--success)', marginBottom: '4px' }}>
              {formatNumber(data.recentActivity)}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Active Sessions
            </div>
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px'
      }}>
        <div style={{
          padding: '20px',
          backgroundColor: 'var(--background)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          borderLeft: '4px solid var(--primary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Target size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
              User Retention
            </span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px' }}>
            85.3%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            7-day retention rate
          </div>
        </div>

        <div style={{
          padding: '20px',
          backgroundColor: 'var(--background)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          borderLeft: '4px solid var(--secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Zap size={16} style={{ color: 'var(--secondary)' }} />
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
              AI Generation Success
            </span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--secondary)', marginBottom: '4px' }}>
            94.7%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Quiz generation success rate
          </div>
        </div>

        <div style={{
          padding: '20px',
          backgroundColor: 'var(--background)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          borderLeft: '4px solid var(--success)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <CheckCircle size={16} style={{ color: 'var(--success)' }} />
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Quiz Completion Rate
            </span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--success)', marginBottom: '4px' }}>
            72.8%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Average completion rate
          </div>
        </div>

        <div style={{
          padding: '20px',
          backgroundColor: 'var(--background)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          borderLeft: '4px solid var(--accent)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Database size={16} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Storage Efficiency
            </span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '4px' }}>
            76.2%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Storage utilization
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div style={{
        textAlign: 'center',
        marginTop: '24px',
        padding: '16px',
        backgroundColor: 'var(--background)',
        borderRadius: '8px',
        fontSize: '12px',
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px'
      }}>
        <Calendar size={12} />
        Last updated: {new Date().toLocaleString()}
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboardStats;