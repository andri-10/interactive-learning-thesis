import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/common/Navigation';
import api from '../services/api';
import { 
  Brain, 
  Play, 
  Trash2, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Loader, 
  FileText, 
  Zap,
  Target,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Award,
  Activity,
  X,
  AlertCircle
} from 'lucide-react';

const Quizzes = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);

  useEffect(() => {
    console.log('Quizzes component mounted - fetching quizzes');
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      console.log('Fetching all quizzes...');
      const response = await api.get('/quizzes');
      console.log('Quizzes received:', response.data?.length || 0, 'quizzes');
      setQuizzes(response.data || []);
      setError('');
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setError('Failed to load quizzes');
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleStartQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  const handleDeleteQuiz = (quiz) => {
    setQuizToDelete(quiz);
    setShowDeleteModal(true);
  };

  const confirmDeleteQuiz = async () => {
    try {
      await api.delete(`/quizzes/${quizToDelete.id}`);
      showToast('Quiz deleted successfully', 'success');
      setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz.id !== quizToDelete.id));
    } catch (error) {
      showToast('Failed to delete quiz', 'error');
      console.error('Error deleting quiz:', error);
    } finally {
      setShowDeleteModal(false);
      setQuizToDelete(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just created';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  const getDifficultyColor = (questionCount) => {
    if (questionCount <= 5) return 'var(--success)';
    if (questionCount <= 10) return 'var(--warning)';
    return 'var(--error)';
  };

  const getDifficultyLabel = (questionCount) => {
    if (questionCount <= 5) return 'Quick';
    if (questionCount <= 10) return 'Medium';
    return 'Challenge';
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
            <div>Loading your quizzes...</div>
            <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.7 }}>
              Preparing your learning adventures
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
          <div style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '600' }}>Oops! Something went wrong</div>
          <div style={{ fontSize: '14px', marginBottom: '24px', color: 'var(--text-secondary)' }}>{error}</div>
          <button 
            onClick={fetchQuizzes} 
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px'
            }}
          >
            <Activity size={16} />
            Try Again
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
            background: 'linear-gradient(135deg, var(--accent), var(--primary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            <Brain size={36} style={{ color: 'var(--accent)' }} />
            Interactive Quizzes ({quizzes.length})
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
            Challenge yourself with AI-generated quizzes and experience interactive learning with micro:bit technology
          </p>
          
          {quizzes.length > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              marginTop: '20px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: 'var(--surface)',
                borderRadius: '20px',
                border: '1px solid var(--border)'
              }}>
                <Target size={16} style={{ color: 'var(--success)' }} />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  {quizzes.filter(q => q.microbitCompatible).length} Micro:bit Ready
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: 'var(--surface)',
                borderRadius: '20px',
                border: '1px solid var(--border)'
              }}>
                <TrendingUp size={16} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  {quizzes.reduce((acc, q) => acc + (q.questions?.length || 0), 0)} Total Questions
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quizzes Display */}
        {quizzes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
            <div style={{
              padding: '40px',
              borderRadius: '20px',
              backgroundColor: 'var(--surface)',
              border: '2px dashed var(--border)',
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              <Brain size={80} style={{ marginBottom: '20px', color: 'var(--text-secondary)' }} />
              <h2 style={{ fontSize: '24px', marginBottom: '12px', color: 'var(--text-primary)' }}>
                No quizzes yet
              </h2>
              <p style={{ fontSize: '16px', marginBottom: '30px', lineHeight: '1.5' }}>
                Upload documents and generate quizzes to start your interactive learning journey
              </p>
              <button 
                onClick={() => navigate('/documents')}
                className="btn-primary"
                style={{ 
                  fontSize: '16px', 
                  padding: '12px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: '0 auto'
                }}
              >
                <FileText size={16} />
                Go to Documents
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: '24px',
            marginBottom: '30px'
          }}>
            {quizzes.map((quiz) => {
              const questionCount = quiz.questions?.length || 0;
              const difficultyColor = getDifficultyColor(questionCount);
              const difficultyLabel = getDifficultyLabel(questionCount);
              
              return (
                <div
                  key={quiz.id}
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderRadius: '20px',
                    padding: '28px',
                    border: '1px solid var(--border)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                  }}
                >
                  {/* Decorative corner accent */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '60px',
                    height: '60px',
                    background: `linear-gradient(135deg, ${difficultyColor}, ${difficultyColor}66)`,
                    clipPath: 'polygon(100% 0, 0 0, 100% 100%)'
                  }} />

                  {/* Header */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                      <div style={{
                        padding: '12px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--accent)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Brain size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ 
                          margin: '0 0 4px 0', 
                          color: 'var(--text-primary)', 
                          fontSize: '20px',
                          fontWeight: '600',
                          lineHeight: '1.3'
                        }}>
                          {quiz.title}
                        </h3>
                        
                        {quiz.description && (
                          <p style={{ 
                            color: 'var(--text-secondary)', 
                            fontSize: '14px',
                            margin: 0,
                            lineHeight: '1.4'
                          }}>
                            {quiz.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    marginBottom: '20px',
                    padding: '16px',
                    backgroundColor: 'var(--background)',
                    borderRadius: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={14} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                        {questionCount} questions
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Award size={14} style={{ color: difficultyColor }} />
                      <span style={{ fontSize: '13px', color: difficultyColor, fontWeight: '500' }}>
                        {difficultyLabel}
                      </span>
                    </div>

                    {quiz.microbitCompatible && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Zap size={14} style={{ color: 'var(--success)' }} />
                        <span style={{ fontSize: '13px', color: 'var(--success)', fontWeight: '500' }}>
                          Interactive
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Meta Information */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '24px',
                    fontSize: '12px',
                    color: 'var(--text-secondary)'
                  }}>
                    <Calendar size={12} />
                    <span>Created {getRelativeTime(quiz.createdAt)}</span>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => handleStartQuiz(quiz.id)}
                      style={{
                        flex: 1,
                        padding: '14px 20px',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <Play size={16} />
                      Start Quiz
                    </button>
                    
                    <button
                      onClick={() => handleDeleteQuiz(quiz)}
                      style={{
                        padding: '14px 16px',
                        backgroundColor: 'transparent',
                        color: 'var(--error)',
                        border: '2px solid var(--error)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'var(--error)';
                        e.target.style.color = 'white';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = 'var(--error)';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Custom Delete Confirmation Modal */}
        {showDeleteModal && quizToDelete && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{
              backgroundColor: 'var(--surface)',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border)',
              animation: 'slideInScale 0.3s ease-out'
            }}>
              {/* Modal Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '20px'
              }}>
                <div style={{
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: '#fee2e2',
                  color: 'var(--error)'
                }}>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 style={{
                    margin: 0,
                    fontSize: '20px',
                    fontWeight: '600',
                    color: 'var(--text-primary)'
                  }}>
                    Delete Quiz?
                  </h3>
                  <p style={{
                    margin: '4px 0 0 0',
                    fontSize: '14px',
                    color: 'var(--text-secondary)'
                  }}>
                    This action cannot be undone
                  </p>
                </div>
              </div>

              {/* Modal Content */}
              <div style={{
                marginBottom: '28px',
                padding: '20px',
                backgroundColor: 'var(--background)',
                borderRadius: '12px',
                border: '1px solid var(--border)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    padding: '8px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--accent)',
                    color: 'white'
                  }}>
                    <Brain size={16} />
                  </div>
                  <h4 style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'var(--text-primary)'
                  }}>
                    {quizToDelete.title}
                  </h4>
                </div>
                
                <p style={{
                  margin: '0 0 16px 0',
                  fontSize: '15px',
                  color: 'var(--text-primary)',
                  lineHeight: '1.5'
                }}>
                  Are you sure you want to delete this quiz? All associated progress and data will be permanently removed.
                </p>
                
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  fontSize: '14px',
                  color: 'var(--text-secondary)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={14} />
                    {quizToDelete.questions?.length || 0} questions
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} />
                    Created {getRelativeTime(quizToDelete.createdAt)}
                  </div>
                  {quizToDelete.microbitCompatible && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Zap size={14} />
                      Interactive
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)',
                    border: '2px solid var(--border)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--background)';
                    e.target.style.borderColor = 'var(--primary)';
                    e.target.style.color = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.borderColor = 'var(--border)';
                    e.target.style.color = 'var(--text-secondary)';
                  }}
                >
                  <X size={14} />
                  Cancel
                </button>
                
                <button
                  onClick={confirmDeleteQuiz}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'var(--error)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#dc2626';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'var(--error)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <Trash2 size={14} />
                  Delete Quiz
                </button>
              </div>
            </div>
          </div>
        )}

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
            {toast.type === 'success' ? (
              <CheckCircle size={18} />
            ) : (
              <AlertTriangle size={18} />
            )}
            {toast.message}
          </div>
        )}
      </div>

      {/* Add CSS animations */}
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
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideInScale {
          from {
            transform: translateY(-20px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
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

export default Quizzes;