import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Target,
  Activity,
  Calendar,
  BookOpen,
  Award,
  Clock
} from 'lucide-react';

const ProgressCharts = ({ data, weeklyProgress = [], monthlyActivity }) => {
  
  const renderWeeklyChart = () => {
    const maxScore = Math.max(...weeklyProgress, 100);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return (
      <div style={{
        padding: '24px',
        backgroundColor: 'var(--background)',
        borderRadius: '16px',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Calendar size={18} style={{ color: 'var(--primary)' }} />
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
            Weekly Progress
          </h4>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'end',
          justifyContent: 'space-between',
          gap: '8px',
          height: '120px',
          marginBottom: '16px'
        }}>
          {weeklyProgress.map((score, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: '32px',
                  height: `${(score / maxScore) * 100}px`,
                  backgroundColor: score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--error)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  cursor: 'pointer'
                }}
                title={`${days[index]}: ${score}%`}
              >
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '10px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap'
                }}>
                  {score}%
                </div>
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                marginTop: '8px'
              }}>
                {days[index]}
              </div>
            </div>
          ))}
        </div>
        
        <div style={{
          fontSize: '12px',
          color: 'var(--text-secondary)',
          textAlign: 'center'
        }}>
          Average quiz scores for the last 7 days
        </div>
      </div>
    );
  };

  const renderSubjectPerformance = () => {
    const subjects = data?.subjectPerformance || [];
    const maxScore = Math.max(...subjects.map(s => s.score), 100);
    
    return (
      <div style={{
        padding: '24px',
        backgroundColor: 'var(--background)',
        borderRadius: '16px',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <BookOpen size={18} style={{ color: 'var(--secondary)' }} />
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
            Subject Performance
          </h4>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {subjects.map((subject, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '500',
                  color: 'var(--text-primary)' 
                }}>
                  {subject.subject}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '600',
                    color: subject.score >= 80 ? 'var(--success)' : subject.score >= 60 ? 'var(--warning)' : 'var(--error)'
                  }}>
                    {subject.score}%
                  </span>
                  <span style={{ 
                    fontSize: '12px', 
                    color: 'var(--text-secondary)' 
                  }}>
                    ({subject.count} quizzes)
                  </span>
                </div>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--border)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(subject.score / maxScore) * 100}%`,
                  height: '100%',
                  backgroundColor: subject.score >= 80 ? 'var(--success)' : subject.score >= 60 ? 'var(--warning)' : 'var(--error)',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          ))}
        </div>
        
        {subjects.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-secondary)'
          }}>
            <BookOpen size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <div style={{ fontSize: '16px', marginBottom: '4px' }}>No subject data</div>
            <div style={{ fontSize: '14px' }}>Complete quizzes to see subject performance</div>
          </div>
        )}
      </div>
    );
  };

  const renderAccuracyTrend = () => {
    const accuracyData = data?.accuracyTrend || [];
    const maxValue = Math.max(...accuracyData, 100);
    const minValue = Math.min(...accuracyData, 0);
    const range = maxValue - minValue;
    
    return (
      <div style={{
        padding: '24px',
        backgroundColor: 'var(--background)',
        borderRadius: '16px',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <TrendingUp size={18} style={{ color: 'var(--success)' }} />
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
            Accuracy Trend
          </h4>
        </div>
        
        <div style={{
          height: '120px',
          position: 'relative',
          padding: '10px 0'
        }}>
          <svg
            width="100%"
            height="100%"
            style={{ overflow: 'visible' }}
          >
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((value) => (
              <line
                key={value}
                x1="0"
                y1={`${((100 - value) / 100) * 100}%`}
                x2="100%"
                y2={`${((100 - value) / 100) * 100}%`}
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            ))}
            
            {/* Trend line */}
            {accuracyData.length > 1 && (
              <polyline
                points={accuracyData.map((value, index) => 
                  `${(index / (accuracyData.length - 1)) * 100},${((100 - value) / 100) * 100}`
                ).join(' ')}
                fill="none"
                stroke="var(--success)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            
            {/* Data points */}
            {accuracyData.map((value, index) => (
              <circle
                key={index}
                cx={`${(index / (accuracyData.length - 1)) * 100}%`}
                cy={`${((100 - value) / 100) * 100}%`}
                r="4"
                fill="var(--success)"
                stroke="white"
                strokeWidth="2"
              >
                <title>{`Session ${index + 1}: ${value}%`}</title>
              </circle>
            ))}
          </svg>
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          marginTop: '12px'
        }}>
          <span>Last 7 sessions</span>
          <span>
            Avg: {accuracyData.length > 0 ? Math.round(accuracyData.reduce((a, b) => a + b, 0) / accuracyData.length) : 0}%
          </span>
        </div>
      </div>
    );
  };

  const renderMonthlyActivity = () => {
    if (!monthlyActivity) return null;
    
    const maxQuizzes = Math.max(...monthlyActivity.quizzes, 10);
    const maxTime = Math.max(...monthlyActivity.time, 60);
    
    return (
      <div style={{
        padding: '24px',
        backgroundColor: 'var(--background)',
        borderRadius: '16px',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <BarChart3 size={18} style={{ color: 'var(--accent)' }} />
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
            Monthly Activity
          </h4>
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'end',
          gap: '16px',
          height: '120px',
          marginBottom: '16px'
        }}>
          {monthlyActivity.labels.map((label, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                gap: '4px'
              }}
            >
              {/* Quizzes bar */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '24px',
                  height: `${(monthlyActivity.quizzes[index] / maxQuizzes) * 60}px`,
                  backgroundColor: 'var(--primary)',
                  borderRadius: '2px',
                  transition: 'all 0.3s ease'
                }}
                title={`${label}: ${monthlyActivity.quizzes[index]} quizzes`}
              />
              
              {/* Time bar */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '24px',
                  height: `${(monthlyActivity.time[index] / maxTime) * 60}px`,
                  backgroundColor: 'var(--secondary)',
                  borderRadius: '2px',
                  transition: 'all 0.3s ease'
                }}
                title={`${label}: ${monthlyActivity.time[index]} minutes`}
              />
              
              <div style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                textAlign: 'center',
                marginTop: '8px'
              }}>
                {label}
              </div>
            </div>
          ))}
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          fontSize: '12px',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: 'var(--primary)',
              borderRadius: '2px'
            }} />
            <span>Quizzes</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: 'var(--secondary)',
              borderRadius: '2px'
            }} />
            <span>Study Time (min)</span>
          </div>
        </div>
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
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '32px',
        paddingBottom: '20px',
        borderBottom: '2px solid var(--border)'
      }}>
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
            Progress Analytics
          </h3>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '14px',
            color: 'var(--text-secondary)'
          }}>
            Visual insights into your learning journey
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px'
      }}>
        {renderWeeklyChart()}
        {renderAccuracyTrend()}
        {renderSubjectPerformance()}
        {renderMonthlyActivity()}
      </div>
    </div>
  );
};

export default ProgressCharts;