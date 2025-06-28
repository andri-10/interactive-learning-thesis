import React, { useState, useEffect } from 'react';
import { 
  X, 
  Brain, 
  Target, 
  Clock,
  Calendar,
  Award,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  User,
  FileText,
  Activity,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api';

const ProgressModal = ({ isOpen, onClose, quiz, userId }) => {
  const [progressDetails, setProgressDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen && (quiz || userId)) {
      fetchProgressDetails();
    }
  }, [isOpen, quiz, userId]);

  const fetchProgressDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      let endpoint;
      if (quiz && userId) {
        endpoint = `/progress/user/${userId}/quiz/${quiz.quizId}`;
      } else if (quiz) {
        endpoint = `/progress/quiz/${quiz.quizId}`;
      } else if (userId) {
        endpoint = `/progress/user/${userId}`;
      }
      
      const response = await api.get(endpoint);
      setProgressDetails(response.data);
    } catch (error) {
      console.error('Error fetching progress details:', error);
      setError('Failed to load progress details');
      
      // Mock detailed progress data
      if (quiz) {
        setProgressDetails({
          quiz: quiz,
          attempts: [
            {
              id: 1,
              score: quiz.score,
              completedAt: quiz.completedAt,
              duration: quiz.duration,
              correctAnswers: quiz.correctAnswers,
              totalQuestions: quiz.totalQuestions,
              answers: [
                { questionId: 1, correct: true, timeSpent: 45, selectedAnswer: 'A', correctAnswer: 'A' },
                { questionId: 2, correct: false, timeSpent: 62, selectedAnswer: 'B', correctAnswer: 'C' },
                { questionId: 3, correct: true, timeSpent: 38, selectedAnswer: 'D', correctAnswer: 'D' },
                // ... more answers
              ]
            }
          ],
          statistics: {
            totalAttempts: 1,
            bestScore: quiz.score,
            averageScore: quiz.score,
            averageTime: quiz.duration,
            improvementTrend: 0,
            weakAreas: ['Algebra', 'Geometry'],
            strongAreas: ['Calculus', 'Statistics']
          }
        });
      } else {
        // User overall progress
        setProgressDetails({
          user: { id: userId, username: 'Current User' },
          overallStats: {
            totalQuizzes: 24,
            totalTime: 360,
            averageScore: 82.5,
            bestScore: 96,
            completionRate: 87.3,
            streak: 5,
            level: 'Intermediate',
            achievements: 8
          },
          recentPerformance: [85, 78, 92, 76, 88, 94, 82],
          subjectBreakdown: [
            { subject: 'Mathematics', quizzes: 8, avgScore: 85, bestScore: 96 },
            { subject: 'Physics', quizzes: 6, avgScore: 78, bestScore: 89 },
            { subject: 'Chemistry', quizzes: 5, avgScore: 82, bestScore: 92 },
            { subject: 'History', quizzes: 5, avgScore: 88, bestScore: 94 }
          ]
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'var(--success)';
    if (score >= 80) return '#10b981';
    if (score >= 70) return 'var(--warning)';
    if (score >= 60) return '#f59e0b';
    return 'var(--error)';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return <CheckCircle size={16} />;
    if (score >= 60) return <AlertTriangle size={16} />;
    return <XCircle size={16} />;
  };

  const renderQuizDetails = () => {
    if (!progressDetails?.quiz) return null;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Quiz Header */}
        <div style={{
          padding: '20px',
          backgroundColor: 'var(--background)',
          borderRadius: '12px',
          border: '1px solid var(--border)'
        }}>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: 'var(--text-primary)'
          }}>
            {progressDetails.quiz.quizTitle}
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '16px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: getScoreColor(progressDetails.quiz.score),
                marginBottom: '4px'
              }}>
                {progressDetails.quiz.score}%
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Final Score</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: 'var(--primary)',
                marginBottom: '4px'
              }}>
                {progressDetails.quiz.correctAnswers}/{progressDetails.quiz.totalQuestions}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Correct</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: 'var(--secondary)',
                marginBottom: '4px'
              }}>
                {progressDetails.quiz.duration}m
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Duration</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'var(--text-primary)',
                marginBottom: '4px'
              }}>
                {formatDate(progressDetails.quiz.completedAt).split(',')[0]}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Completed</div>
            </div>
          </div>
        </div>

        {/* Performance Analysis */}
        {progressDetails.statistics && (
          <div style={{
            padding: '20px',
            backgroundColor: 'var(--background)',
            borderRadius: '12px',
            border: '1px solid var(--border)'
          }}>
            <h4 style={{
              margin: '0 0 16px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              Performance Analysis
            </h4>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              {progressDetails.statistics.strongAreas?.length > 0 && (
                <div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--success)',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <CheckCircle size={14} />
                    Strong Areas
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {progressDetails.statistics.strongAreas.join(', ')}
                  </div>
                </div>
              )}
              
              {progressDetails.statistics.weakAreas?.length > 0 && (
                <div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--warning)',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <AlertTriangle size={14} />
                    Areas for Improvement
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {progressDetails.statistics.weakAreas.join(', ')}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderUserProgress = () => {
    if (!progressDetails?.overallStats) return null;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Overall Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px'
        }}>
          {[
            { label: 'Total Quizzes', value: progressDetails.overallStats.totalQuizzes, color: 'var(--primary)', icon: Brain },
            { label: 'Avg Score', value: `${Math.round(progressDetails.overallStats.averageScore)}%`, color: 'var(--success)', icon: Target },
            { label: 'Study Time', value: `${Math.floor(progressDetails.overallStats.totalTime / 60)}h`, color: 'var(--secondary)', icon: Clock },
            { label: 'Current Streak', value: `${progressDetails.overallStats.streak}d`, color: 'var(--accent)', icon: Award }
          ].map((stat, index) => (
            <div key={index} style={{
              padding: '16px',
              backgroundColor: 'var(--background)',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              textAlign: 'center'
            }}>
              <div style={{
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: stat.color,
                color: 'white',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px'
              }}>
                <stat.icon size={16} />
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: stat.color,
                marginBottom: '4px'
              }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Subject Breakdown */}
        {progressDetails.subjectBreakdown && (
          <div style={{
            padding: '20px',
            backgroundColor: 'var(--background)',
            borderRadius: '12px',
            border: '1px solid var(--border)'
          }}>
            <h4 style={{
              margin: '0 0 16px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              Subject Performance
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {progressDetails.subjectBreakdown.map((subject, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: 'var(--surface)',
                  borderRadius: '8px'
                }}>
                  <div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      marginBottom: '2px'
                    }}>
                      {subject.subject}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)'
                    }}>
                      {subject.quizzes} quiz{subject.quizzes !== 1 ? 'es' : ''}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: getScoreColor(subject.avgScore),
                      marginBottom: '2px'
                    }}>
                      {Math.round(subject.avgScore)}%
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: 'var(--text-secondary)'
                    }}>
                      Best: {subject.bestScore}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Performance Trend */}
        {progressDetails.recentPerformance && (
          <div style={{
            padding: '20px',
            backgroundColor: 'var(--background)',
            borderRadius: '12px',
            border: '1px solid var(--border)'
          }}>
            <h4 style={{
              margin: '0 0 16px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              Recent Performance Trend
            </h4>
            
            <div style={{
              display: 'flex',
              alignItems: 'end',
              justifyContent: 'space-between',
              gap: '4px',
              height: '60px',
              marginBottom: '8px'
            }}>
              {progressDetails.recentPerformance.map((score, index) => (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    height: `${(score / 100) * 60}px`,
                    backgroundColor: getScoreColor(score),
                    borderRadius: '2px',
                    position: 'relative'
                  }}
                  title={`Quiz ${index + 1}: ${score}%`}
                />
              ))}
            </div>
            
            <div style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              textAlign: 'center'
            }}>
              Last {progressDetails.recentPerformance.length} quiz scores
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'var(--surface)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '2px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: quiz ? 'var(--primary)' : 'var(--accent)',
              color: 'white'
            }}>
              {quiz ? <Brain size={20} /> : <BarChart3 size={20} />}
            </div>
            <div>
              <h2 style={{ 
                margin: '0 0 4px 0', 
                fontSize: '20px',
                fontWeight: '700',
                color: 'var(--text-primary)'
              }}>
                {quiz ? 'Quiz Details' : 'Progress Overview'}
              </h2>
              <p style={{ 
                margin: 0, 
                fontSize: '14px', 
                color: 'var(--text-secondary)' 
              }}>
                {quiz ? `Detailed analysis of ${quiz.quizTitle}` : 'Comprehensive learning progress'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--error)';
              e.target.style.borderColor = 'var(--error)';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = 'var(--border)';
              e.target.style.color = 'var(--text-primary)';
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation (only for user progress) */}
        {!quiz && (
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--background)',
            borderBottom: '1px solid var(--border)'
          }}>
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'subjects', label: 'Subjects', icon: FileText },
              { id: 'trends', label: 'Trends', icon: TrendingUp }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  padding: '16px 20px',
                  backgroundColor: activeTab === id ? 'var(--surface)' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === id ? '2px solid var(--primary)' : '2px solid transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: activeTab === id ? 'var(--primary)' : 'var(--text-secondary)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Modal Content */}
        <div style={{
          padding: '24px 32px',
          overflow: 'auto',
          flex: 1
        }}>
          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              color: 'var(--error)',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px'
            }}>
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px',
              flexDirection: 'column',
              gap: '16px',
              color: 'var(--text-secondary)'
            }}>
              <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
              <div>Loading progress details...</div>
            </div>
          ) : (
            <>
              {quiz ? renderQuizDetails() : renderUserProgress()}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '20px 32px',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--background)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Clock size={12} />
            Last updated: {new Date().toLocaleTimeString()}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {quiz && (
              <button
                style={{
                  padding: '10px 16px',
                  backgroundColor: 'var(--secondary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#0891b2'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--secondary)'}
              >
                Retake Quiz
              </button>
            )}
            
            <button
              onClick={onClose}
              style={{
                padding: '10px 16px',
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primary-dark)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--primary)'}
            >
              Close
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

export default ProgressModal;