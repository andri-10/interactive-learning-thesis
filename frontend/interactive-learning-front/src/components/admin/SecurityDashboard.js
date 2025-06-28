import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Globe,
  Clock,
  Activity,
  AlertTriangle,
  Eye,
  LogIn
} from 'lucide-react';

const SecurityDashboard = ({ data, onRefresh, refreshing = false }) => {
  
  const formatPercentage = (value) => {
    return `${Math.round(value || 0)}%`;
  };

  const formatNumber = (value) => {
    return (value || 0).toLocaleString();
  };

  const getTrendIcon = (trend) => {
    if (!trend) return null;
    const isPositive = trend.startsWith('+');
    const isNegative = trend.startsWith('-');
    
    if (isPositive) return <TrendingUp size={12} style={{ color: 'var(--success)' }} />;
    if (isNegative) return <TrendingDown size={12} style={{ color: 'var(--error)' }} />;
    return null;
  };

  const getTrendColor = (trend) => {
    if (!trend) return 'var(--text-secondary)';
    if (trend.startsWith('+')) return 'var(--success)';
    if (trend.startsWith('-')) return 'var(--error)';
    return 'var(--text-secondary)';
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
      {/* Header */}
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
            backgroundColor: 'var(--error)',
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
              Security Analytics
            </h3>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '14px',
              color: 'var(--text-secondary)'
            }}>
              Real-time security metrics and threat monitoring
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
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

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Authentication Metrics */}
        <div style={{
          padding: '24px',
          backgroundColor: 'var(--background)',
          borderRadius: '16px',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <LogIn size={18} style={{ color: 'var(--primary)' }} />
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Authentication
            </h4>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total Login Attempts</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {formatNumber(data?.totalLoginAttempts)}
                </span>
                {getTrendIcon(data?.trends?.loginAttempts)}
                <span style={{ fontSize: '12px', color: getTrendColor(data?.trends?.loginAttempts) }}>
                  {data?.trends?.loginAttempts}
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Failed Attempts</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--error)' }}>
                  {formatNumber(data?.failedLoginAttempts)}
                </span>
                {getTrendIcon(data?.trends?.failedLogins)}
                <span style={{ fontSize: '12px', color: getTrendColor(data?.trends?.failedLogins) }}>
                  {data?.trends?.failedLogins}
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Success Rate</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--success)' }}>
                {formatPercentage(data?.loginSuccessRate)}
              </span>
            </div>
          </div>
        </div>

        {/* Session Metrics */}
        <div style={{
          padding: '24px',
          backgroundColor: 'var(--background)',
          borderRadius: '16px',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Activity size={18} style={{ color: 'var(--success)' }} />
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Session Activity
            </h4>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Active Sessions</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--success)' }}>
                {formatNumber(data?.activeSessionsCount)}
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Avg. Session Duration</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                {data?.averageSessionDuration ? `${Math.round(data.averageSessionDuration)}m` : 'N/A'}
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Unique IP Addresses</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--secondary)' }}>
                {formatNumber(data?.uniqueIpAddresses)}
              </span>
            </div>
          </div>
        </div>

        {/* Security Events */}
        <div style={{
          padding: '24px',
          backgroundColor: 'var(--background)',
          borderRadius: '16px',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Security Events
            </h4>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Locked Accounts</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--error)' }}>
                  {formatNumber(data?.lockedAccountsCount)}
                </span>
                {getTrendIcon(data?.trends?.lockedAccounts)}
                <span style={{ fontSize: '12px', color: getTrendColor(data?.trends?.lockedAccounts) }}>
                  {data?.trends?.lockedAccounts}
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Suspicious Activities</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--warning)' }}>
                  {formatNumber(data?.suspiciousActivities)}
                </span>
                {getTrendIcon(data?.trends?.suspiciousActivity)}
                <span style={{ fontSize: '12px', color: getTrendColor(data?.trends?.suspiciousActivity) }}>
                  {data?.trends?.suspiciousActivity}
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Recent Events (24h)</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--accent)' }}>
                {formatNumber(data?.recentSecurityEvents)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Score Summary */}
      <div style={{
        padding: '24px',
        backgroundColor: 'var(--background)',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        textAlign: 'center'
      }}>
        <h4 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: 'var(--text-primary)'
        }}>
          Overall Security Health
        </h4>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '16px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: data?.securityScore >= 80 ? 'var(--success)' : data?.securityScore >= 60 ? 'var(--warning)' : 'var(--error)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            {data?.securityScore || 0}%
          </div>
          
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
              Security Score
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {data?.securityScore >= 80 ? 'Excellent' : data?.securityScore >= 60 ? 'Good' : 'Needs Attention'}
            </div>
          </div>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
          fontSize: '12px'
        }}>
          <div style={{ 
            padding: '8px',
            backgroundColor: 'var(--surface)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Eye size={14} style={{ color: 'var(--secondary)' }} />
            <span>Active Monitoring</span>
          </div>
          
          <div style={{ 
            padding: '8px',
            backgroundColor: 'var(--surface)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Globe size={14} style={{ color: 'var(--accent)' }} />
            <span>IP Tracking</span>
          </div>
          
          <div style={{ 
            padding: '8px',
            backgroundColor: 'var(--surface)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Clock size={14} style={{ color: 'var(--primary)' }} />
            <span>Real-time Alerts</span>
          </div>
        </div>
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

export default SecurityDashboard; 