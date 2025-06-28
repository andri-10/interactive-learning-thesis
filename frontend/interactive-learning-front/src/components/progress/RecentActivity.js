import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Clock, 
  Brain,
  FileText,
  Award,
  Upload,
  Download,
  Edit,
  Trash2,
  User,
  RefreshCw,
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import api from '../../services/api';

const RecentActivity = ({ userId, limit = 10, showFilters = false }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRecentActivity();
  }, [userId, filter]);

  const fetchRecentActivity = async () => {
    try {
      setLoading(true);
      setError('');
      
      const endpoint = userId ? `/progress/user/${userId}` : '/progress/recent';
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(filter !== 'all' && { type: filter })
      });
      
      const response = await api.get(`${endpoint}?${params}`);
      setActivities(response.data?.content || response.data || []);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      setError('Failed to load recent activity');
      
      // Mock data for development
      setActivities([
        {
          id: 1,
          type: 'quiz_completed',
          title: 'Advanced Mathematics Quiz',
          description: 'Completed with 85% score',
          score: 85,
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          metadata: {
            duration: 15,
            questions: 20,
            subject: 'Mathematics'
          }
        },
        {
          id: 2,
          type: 'document_uploaded',
          title: 'Physics Study Notes',
          description: 'Uploaded new study material',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          metadata: {
            fileSize: '2.1 MB',
            pages: 15
          }
        },
        {
          id: 3,
          type: 'achievement_earned',
          title: 'Quiz Master',
          description: 'Completed 20 quizzes',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          metadata: {
            category: 'Learning',
            points: 100
          }
        },
        {
          id: 4,
          type: 'quiz_started',
          title: 'Chemistry Basics',
          description: 'Started new quiz attempt',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          metadata: {
            questions: 25,
            subject: 'Chemistry'
          }
        },
        {
          id: 5,
          type: 'collection_created',
          title: 'Science Materials',
          description: 'Created new study collection',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          metadata: {
            itemCount: 8
          }
        },
        {
          id: 6,
          type: 'document_downloaded',
          title: 'History Timeline Notes',
          description: 'Downloaded study material',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          metadata: {
            fileSize: '1.5 MB'
          }
        },
        {
          id: 7,
          type: 'quiz_completed',
          title: 'Literature Analysis',
          description: 'Completed with 92% score',
          score: 92,
          timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
          metadata: {
            duration: 22,
            questions: 18,
            subject: 'Literature'
          }
        },
        {
          id: 8,
          type: 'profile_updated',
          title: 'Profile Information',
          description: 'Updated learning preferences',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          metadata: {}
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'quiz_completed':
      case 'quiz_started':
        return 'var(--secondary)';
      case 'achievement_earned':
        return 'var(--accent)';
      case 'collection_created':
      case 'collection_updated':
        return 'var(--warning)';
      case 'profile_updated':
        return 'var(--text-secondary)';
      default:
        return 'var(--text-secondary)';
    }
  };

  const getActivityLevel = (type) => {
    switch (type) {
      case 'quiz_completed':
      case 'achievement_earned':
        return 'success';
      case 'quiz_started':
      case 'document_uploaded':
      case 'collection_created':
        return 'info';
      case 'document_downloaded':
      case 'profile_updated':
        return 'neutral';
      default:
        return 'info';
    }
  };

  const formatActivityTitle = (activity) => {
    switch (activity.type) {
      case 'quiz_completed':
        return `Completed: ${activity.title}`;
      case 'quiz_started':
        return `Started: ${activity.title}`;
      case 'document_uploaded':
        return `Uploaded: ${activity.title}`;
      case 'document_downloaded':
        return `Downloaded: ${activity.title}`;
      case 'achievement_earned':
        return `Earned: ${activity.title}`;
      case 'collection_created':
        return `Created: ${activity.title}`;
      case 'profile_updated':
        return `Updated: ${activity.title}`;
      default:
        return activity.title;
    }
  };

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'var(--success)';
    if (score >= 80) return '#10b981';
    if (score >= 70) return 'var(--warning)';
    if (score >= 60) return '#f59e0b';
    return 'var(--error)';
  };

  const getFilteredActivities = () => {
    if (filter === 'all') return activities;
    return activities.filter(activity => {
      switch (filter) {
        case 'quiz':
          return activity.type.includes('quiz');
        case 'document':
          return activity.type.includes('document');
        case 'achievement':
          return activity.type.includes('achievement');
        case 'collection':
          return activity.type.includes('collection');
        default:
          return true;
      }
    });
  };

  const filteredActivities = getFilteredActivities();

  return (
    <div style={{
      backgroundColor: 'var(--surface)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid var(--border)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} style={{ color: 'var(--accent)' }} />
          <h4 style={{ 
            margin: 0, 
            fontSize: '16px', 
            fontWeight: '600',
            color: 'var(--text-primary)'
          }}>
            Recent Activity
          </h4>
        </div>

        <button
          onClick={fetchRecentActivity}
          disabled={loading}
          style={{
            padding: '6px 12px',
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.borderColor = 'var(--primary)';
              e.target.style.color = 'var(--primary)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.borderColor = 'var(--border)';
              e.target.style.color = 'var(--text-secondary)';
            }
          }}
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          flexWrap: 'wrap'
        }}>
          {['all', 'quiz', 'document', 'achievement', 'collection'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              style={{
                padding: '4px 12px',
                fontSize: '12px',
                backgroundColor: filter === filterType ? 'var(--primary)' : 'transparent',
                color: filter === filterType ? 'white' : 'var(--text-secondary)',
                border: `1px solid ${filter === filterType ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'capitalize'
              }}
              onMouseEnter={(e) => {
                if (filter !== filterType) {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.color = 'var(--primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== filterType) {
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.color = 'var(--text-secondary)';
                }
              }}
            >
              {filterType === 'all' ? 'All' : filterType}
            </button>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: 'var(--error)',
          padding: '8px 12px',
          borderRadius: '6px',
          marginBottom: '16px',
          fontSize: '12px'
        }}>
          {error}
        </div>
      )}

      {/* Activity List */}
      {loading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '120px',
          color: 'var(--text-secondary)'
        }}>
          <RefreshCw size={24} className="animate-spin" style={{ color: 'var(--primary)' }} />
        </div>
      ) : filteredActivities.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: 'var(--text-secondary)'
        }}>
          <Activity size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
          <div style={{ fontSize: '14px', marginBottom: '4px' }}>No recent activity</div>
          <div style={{ fontSize: '12px' }}>
            {filter === 'all' ? 'Start learning to see your activity here' : `No ${filter} activity found`}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px',
                backgroundColor: 'var(--background)',
                borderRadius: '8px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--background)'}
            >
              {/* Activity Icon */}
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: getActivityColor(activity.type),
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px'
              }}>
                {getActivityIcon(activity.type)}
              </div>

              {/* Activity Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  marginBottom: '2px',
                  lineHeight: '1.3'
                }}>
                  {formatActivityTitle(activity)}
                </div>
                
                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  marginBottom: '4px',
                  lineHeight: '1.3'
                }}>
                  {activity.description}
                </div>

                {/* Activity Metadata */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  flexWrap: 'wrap'
                }}>
                  {activity.score && (
                    <span style={{ 
                      color: getScoreColor(activity.score),
                      fontWeight: '500'
                    }}>
                      Score: {activity.score}%
                    </span>
                  )}
                  
                  {activity.metadata?.duration && (
                    <span>Duration: {activity.metadata.duration}m</span>
                  )}
                  
                  {activity.metadata?.questions && (
                    <span>Questions: {activity.metadata.questions}</span>
                  )}
                  
                  {activity.metadata?.fileSize && (
                    <span>Size: {activity.metadata.fileSize}</span>
                  )}
                  
                  {activity.metadata?.subject && (
                    <span style={{ 
                      color: 'var(--primary)',
                      fontWeight: '500'
                    }}>
                      {activity.metadata.subject}
                    </span>
                  )}
                  
                  {activity.metadata?.points && (
                    <span style={{ 
                      color: 'var(--accent)',
                      fontWeight: '500'
                    }}>
                      +{activity.metadata.points} pts
                    </span>
                  )}
                </div>
              </div>

              {/* Timestamp */}
              <div style={{
                fontSize: '11px',
                color: 'var(--text-secondary)',
                flexShrink: 0,
                textAlign: 'right',
                marginTop: '2px'
              }}>
                {getRelativeTime(activity.timestamp)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Show More Button */}
      {!loading && filteredActivities.length >= limit && (
        <div style={{
          textAlign: 'center',
          marginTop: '16px'
        }}>
          <button
            style={{
              padding: '8px 16px',
              fontSize: '12px',
              backgroundColor: 'transparent',
              color: 'var(--primary)',
              border: '1px solid var(--primary)',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--primary)';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = 'var(--primary)';
            }}
          >
            View All Activity
          </button>
        </div>
      )}

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

export default RecentActivity; 