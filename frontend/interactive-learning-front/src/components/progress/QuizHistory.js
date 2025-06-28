import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Clock, 
  Target, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Award,
  RefreshCw,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import api from '../../services/api';

const QuizHistory = ({ userId, onQuizSelect }) => {
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('completedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchQuizHistory();
  }, [userId, sortBy, sortOrder]);

  const fetchQuizHistory = async () => {
    try {
      setLoading(true);
      setError('');
      
      const endpoint = userId ? `/progress/user/${userId}` : '/progress';
      const response = await api.get(endpoint);
      
      setQuizHistory(response.data?.content || response.data || []);
    } catch (error) {
      console.error('Error fetching quiz history:', error);
      setError('Failed to load quiz history');
      
      // Mock data for development
      setQuizHistory([
        {
          id: 1,
          quizId: 101,
          quizTitle: 'Advanced Mathematics',
          score: 85,
          totalQuestions: 20,
          correctAnswers: 17,
          completedAt: '2024-12-28T10:30:00Z',
          duration: 15,
          subject: 'Mathematics',
          difficulty: 'Hard',
          status: 'completed'
        },
        {
          id: 2,
          quizId: 102,
          quizTitle: 'Physics Fundamentals',
          score: 92,
          totalQuestions: 15,
          correctAnswers: 14,
          completedAt: '2024-12-27T14:20:00Z',
          duration: 12,
          subject: 'Physics',
          difficulty: 'Medium',
          status: 'completed'
        },
        {
          id: 3,
          quizId: 103,
          quizTitle: 'Chemistry Basics',
          score: 76,
          totalQuestions: 25,
          correctAnswers: 19,
          completedAt: '2024-12-26T09:15:00Z',
          duration: 18,
          subject: 'Chemistry',
          difficulty: 'Easy',
          status: 'completed'
        },
        {
          id: 4,
          quizId: 104,
          quizTitle: 'History Timeline',
          score: 88,
          totalQuestions: 12,
          correctAnswers: 11,
          completedAt: '2024-12-25T16:45:00Z',
          duration: 10,
          subject: 'History',
          difficulty: 'Medium',
          status: 'completed'
        },
        {
          id: 5,
          quizId: 105,
          quizTitle: 'Literature Analysis',
          score: 94,
          totalQuestions: 18,
          correctAnswers: 17,
          completedAt: '2024-12-24T11:30:00Z',
          duration: 22,
          subject: 'Literature',
          difficulty: 'Hard',
          status: 'completed'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'var(--success)';
      case 'medium': return 'var(--warning)';
      case 'hard': return 'var(--error)';
      default: return 'var(--text-secondary)';
    }
  };

  const getFilteredAndSortedHistory = () => {
    let filtered = quizHistory.filter(quiz =>
      quiz.quizTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'completedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  };

  const getPaginatedHistory = () => {
    const filtered = getFilteredAndSortedHistory();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const totalItems = getFilteredAndSortedHistory().length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const calculateStats = () => {
    if (quizHistory.length === 0) return { avgScore: 0, totalTime: 0, bestScore: 0, trend: 0 };
    
    const avgScore = quizHistory.reduce((sum, quiz) => sum + quiz.score, 0) / quizHistory.length;
    const totalTime = quizHistory.reduce((sum, quiz) => sum + quiz.duration, 0);
    const bestScore = Math.max(...quizHistory.map(quiz => quiz.score));
    
    // Calculate trend (last 3 vs previous 3)
    const recent = quizHistory.slice(0, 3);
    const previous = quizHistory.slice(3, 6);
    const recentAvg = recent.length > 0 ? recent.reduce((sum, quiz) => sum + quiz.score, 0) / recent.length : 0;
    const previousAvg = previous.length > 0 ? previous.reduce((sum, quiz) => sum + quiz.score, 0) / previous.length : 0;
    const trend = recentAvg - previousAvg;
    
    return { avgScore, totalTime, bestScore, trend };
  };

  const stats = calculateStats();

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
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: 'var(--primary)',
            color: 'white'
          }}>
            <Brain size={24} />
          </div>
          <div>
            <h3 style={{ 
              margin: 0, 
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              Quiz History
            </h3>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '14px',
              color: 'var(--text-secondary)'
            }}>
              Track your quiz performance and progress
            </p>
          </div>
        </div>

        <button
          onClick={fetchQuizHistory}
          disabled={loading}
          style={{
            padding: '10px 16px',
            backgroundColor: loading ? 'var(--border)' : 'var(--secondary)',
            color: loading ? 'var(--text-secondary)' : 'white',
            border: 'none',
            borderRadius: '8px',
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
      </div>

      {/* Stats Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          padding: '16px',
          backgroundColor: 'var(--background)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px' }}>
            {Math.round(stats.avgScore)}%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Average Score</div>
        </div>
        
        <div style={{
          padding: '16px',
          backgroundColor: 'var(--background)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--secondary)', marginBottom: '4px' }}>
            {Math.floor(stats.totalTime / 60)}h {stats.totalTime % 60}m
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Time</div>
        </div>
        
        <div style={{
          padding: '16px',
          backgroundColor: 'var(--background)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--success)', marginBottom: '4px' }}>
            {stats.bestScore}%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Best Score</div>
        </div>
        
        <div style={{
          padding: '16px',
          backgroundColor: 'var(--background)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: stats.trend >= 0 ? 'var(--success)' : 'var(--error)', 
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}>
            {stats.trend >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            {stats.trend >= 0 ? '+' : ''}{Math.round(stats.trend)}%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Recent Trend</div>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
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
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 8px 8px 32px',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>

        {/* Sort Options */}
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split('-');
            setSortBy(field);
            setSortOrder(order);
          }}
          style={{
            padding: '8px 12px',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'white'
          }}
        >
          <option value="completedAt-desc">Latest First</option>
          <option value="completedAt-asc">Oldest First</option>
          <option value="score-desc">Highest Score</option>
          <option value="score-asc">Lowest Score</option>
          <option value="duration-desc">Longest Time</option>
          <option value="duration-asc">Shortest Time</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: 'var(--error)',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          {error} - Showing sample data
        </div>
      )}

      {/* Quiz List */}
      {loading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
          color: 'var(--text-secondary)'
        }}>
          <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
        </div>
      ) : getPaginatedHistory().length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'var(--text-secondary)'
        }}>
          <Brain size={64} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <div style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '600' }}>
            No quiz history found
          </div>
          <div style={{ fontSize: '14px' }}>
            {searchTerm ? 'Try adjusting your search terms' : 'Start taking quizzes to see your history here'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {getPaginatedHistory().map((quiz) => (
            <div
              key={quiz.id}
              style={{
                padding: '20px',
                backgroundColor: 'var(--background)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                cursor: onQuizSelect ? 'pointer' : 'default',
                transition: 'all 0.2s'
              }}
              onClick={() => onQuizSelect && onQuizSelect(quiz)}
              onMouseEnter={(e) => {
                if (onQuizSelect) {
                  e.target.style.backgroundColor = '#f8fafc';
                  e.target.style.borderColor = 'var(--primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (onQuizSelect) {
                  e.target.style.backgroundColor = 'var(--background)';
                  e.target.style.borderColor = 'var(--border)';
                }
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '16px'
              }}>
                {/* Quiz Info */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px'
                  }}>
                    <h4 style={{
                      margin: 0,
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'var(--text-primary)'
                    }}>
                      {quiz.quizTitle}
                    </h4>
                    
                    {quiz.subject && (
                      <span style={{
                        padding: '2px 8px',
                        fontSize: '11px',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        borderRadius: '12px',
                        fontWeight: '500'
                      }}>
                        {quiz.subject}
                      </span>
                    )}
                    
                    {quiz.difficulty && (
                      <span style={{
                        padding: '2px 8px',
                        fontSize: '11px',
                        backgroundColor: getDifficultyColor(quiz.difficulty),
                        color: 'white',
                        borderRadius: '12px',
                        fontWeight: '500'
                      }}>
                        {quiz.difficulty}
                      </span>
                    )}
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    fontSize: '14px',
                    color: 'var(--text-secondary)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Target size={12} />
                      <span>{quiz.correctAnswers}/{quiz.totalQuestions} correct</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      <span>{quiz.duration}m</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      <span>{getRelativeTime(quiz.completedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: getScoreColor(quiz.score)
                  }}>
                    {getScoreIcon(quiz.score)}
                    <span style={{
                      fontSize: '20px',
                      fontWeight: 'bold'
                    }}>
                      {quiz.score}%
                    </span>
                  </div>
                  
                  {onQuizSelect && (
                    <button
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuizSelect(quiz);
                      }}
                    >
                      <Eye size={10} />
                      View
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px',
          padding: '16px 0'
        }}>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} quizzes
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

            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Page {currentPage} of {totalPages}
            </span>

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

export default QuizHistory;