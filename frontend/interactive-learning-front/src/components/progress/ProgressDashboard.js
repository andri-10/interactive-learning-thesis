import React from 'react';
import { 
  User, 
  TrendingUp, 
  RefreshCw, 
  Target,
  Clock,
  Brain,
  FileText,
  Award,
  Activity,
  CheckCircle,
  Calendar,
  Zap,
  Trophy,
  Star
} from 'lucide-react';

const ProgressDashboard = ({ data, recentActivity = [], onRefresh, refreshing = false }) => {
  
  const formatTime = (minutes) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
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

  const getActivityIcon = (type) => {
    switch (type) {
      case 'quiz': return <Brain size={16} />;
      case 'document': return <FileText size={16} />;
      case 'achievement': return <Award size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'quiz': return 'var(--primary)';
      case 'document': return 'var(--secondary)';
      case 'achievement': return 'var(--accent)';
      default: return 'var(--text-secondary)';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--error)';
  };

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'var(--primary)';
      case 'intermediate': return 'var(--secondary)';
      case 'advanced': return 'var(--accent)';
      case 'expert': return 'var(--success)';
      default: return 'var(--text-secondary)';
    }
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
            backgroundColor: 'var(--primary)',
            color: 'white'
          }}>
            <User size={24} />
          </div>
          <div>
            <h3 style={{ 
              margin: 0, 
              fontSize: '24px',
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              Personal Dashboard
            </h3>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '14px',
              color: 'var(--text-secondary)'
            }}>
              Your learning progress and achievements
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={refreshing}
          style={{
            padding: '10px 16px',
            backgroundColor: refreshing ? 'var(--border)' : 'var(--secondary)',
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

      {/* Performance Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Learning Level */}
        <div style={{
          padding: '24px',
          backgroundColor: 'var(--background)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: getLevelColor(data?.level),
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            <Trophy size={24} />
          </div>
          <h4 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '18px', 
            fontWeight: '600',
            color: 'var(--text-primary)'
          }}>
            {data?.level || 'Beginner'}
          </h4>
          <p style={{ 
            margin: 0, 
            fontSize: '14px', 
            color: 'var(--text-secondary)' 
          }}>
            Current Level
          </p>
        </div>

        {/* Study Goal Progress */}
        <div style={{
          padding: '24px',
          backgroundColor: 'var(--background)',
          borderRadius: '16px',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Target size={18} style={{ color: 'var(--success)' }} />
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Daily Study Goal
            </h4>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Progress Today
              </span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                {data?.studyProgress || 0}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: 'var(--border)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${data?.studyProgress || 0}%`,
                height: '100%',
                backgroundColor: 'var(--success)',
                borderRadius: '4px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
          
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Goal: {data?.studyGoal || 30} minutes per day
          </div>
        </div>

        {/* Completion Rate */}
        <div style={{
          padding: '24px',
          backgroundColor: 'var(--background)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'var(--secondary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            {Math.round(data?.completionRate || 0)}%
          </div>
          <h4 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '18px', 
            fontWeight: '600',
            color: 'var(--text-primary)'
          }}>
            Completion Rate
          </h4>
          <p style={{ 
            margin: 0, 
            fontSize: '14px', 
            color: 'var(--text-secondary)' 
          }}>
            Quiz Success Rate
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          padding: '20px',
          backgroundColor: 'var(--background)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          borderLeft: '4px solid var(--primary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Brain size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Total Quizzes
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px' }}>
            {data?.totalQuizzes || 0}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Completed successfully
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
            <FileText size={16} style={{ color: 'var(--secondary)' }} />
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Documents
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--secondary)', marginBottom: '4px' }}>
            {data?.totalDocuments || 0}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Study materials uploaded
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
            <Award size={16} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Achievements
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '4px' }}>
            {data?.achievements || 0}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Badges earned
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
            <Zap size={16} style={{ color: 'var(--success)' }} />
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Current Streak
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--success)', marginBottom: '4px' }}>
            {data?.streak || 0}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Days in a row
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{
        padding: '24px',
        backgroundColor: 'var(--background)',
        borderRadius: '16px',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Clock size={18} style={{ color: 'var(--accent)' }} />
          <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
            Recent Activity
          </h4>
        </div>

        {recentActivity.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-secondary)'
          }}>
            <Activity size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <div style={{ fontSize: '16px', marginBottom: '4px' }}>No recent activity</div>
            <div style={{ fontSize: '14px' }}>Start taking quizzes to see your progress here</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentActivity.slice(0, 5).map((activity) => (
              <div
                key={activity.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: 'var(--surface)',
                  borderRadius: '8px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--surface)'}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: getActivityColor(activity.type),
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {getActivityIcon(activity.type)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '2px'
                  }}>
                    {activity.title}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {activity.type === 'quiz' && activity.score && (
                      <span style={{ 
                        color: getScoreColor(activity.score),
                        fontWeight: '500'
                      }}>
                        Score: {activity.score}%
                      </span>
                    )}
                    {activity.type === 'quiz' && activity.duration && (
                      <span>Duration: {activity.duration}m</span>
                    )}
                    {activity.type === 'document' && activity.action && (
                      <span style={{ textTransform: 'capitalize' }}>{activity.action}</span>
                    )}
                    {activity.type === 'achievement' && activity.description && (
                      <span>{activity.description}</span>
                    )}
                  </div>
                </div>

                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  textAlign: 'right',
                  flexShrink: 0
                }}>
                  {getRelativeTime(activity.completedAt)}
                </div>
              </div>
            ))}
          </div>
        )}
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

export default ProgressDashboard;