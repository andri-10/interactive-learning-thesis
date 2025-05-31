import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/common/Navigation';
import api from '../services/api';

const Quizzes = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

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

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await api.delete(`/quizzes/${quizId}`);
        showToast('Quiz deleted successfully', 'success');
        setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz.id !== quizId));
      } catch (error) {
        showToast('Failed to delete quiz', 'error');
        console.error('Error deleting quiz:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🧠</div>
            <div>Loading quizzes...</div>
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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <div style={{ fontSize: '18px', marginBottom: '16px' }}>{error}</div>
          <button onClick={fetchQuizzes} className="btn-primary">
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
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ 
            color: 'var(--text-primary)', 
            fontSize: '32px',
            fontWeight: 'bold',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            🧠 My Quizzes ({quizzes.length})
          </h1>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '16px',
            margin: '8px 0 0 0'
          }}>
            Take interactive quizzes generated from your documents
          </p>
        </div>

        {/* Quizzes Display */}
        {quizzes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>🧠</div>
            <h2 style={{ fontSize: '24px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              No quizzes yet
            </h2>
            <p style={{ fontSize: '16px', marginBottom: '30px' }}>
              Upload documents and generate quizzes to get started
            </p>
            <button 
              onClick={() => navigate('/documents')}
              className="btn-primary"
              style={{ fontSize: '16px', padding: '12px 24px' }}
            >
              📄 Go to Documents
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                style={{
                  backgroundColor: 'var(--surface)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid var(--border)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                }}
              >
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ 
                    margin: '0 0 8px 0', 
                    color: 'var(--text-primary)', 
                    fontSize: '20px',
                    fontWeight: '600'
                  }}>
                    🧠 {quiz.title}
                  </h3>
                  
                  {quiz.description && (
                    <p style={{ 
                      color: 'var(--text-secondary)', 
                      fontSize: '14px',
                      margin: '0 0 12px 0',
                      lineHeight: '1.4'
                    }}>
                      {quiz.description}
                    </p>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  gap: '16px',
                  marginBottom: '16px',
                  fontSize: '14px',
                  color: 'var(--text-secondary)'
                }}>
                  <span>❓ {quiz.questions?.length || 0} questions</span>
                  <span>🎯 {quiz.microbitCompatible ? 'Micro:bit Ready' : 'Standard'}</span>
                </div>

                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  marginBottom: '16px'
                }}>
                  Created: {formatDate(quiz.createdAt)}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleStartQuiz(quiz.id)}
                    className="btn-primary"
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      fontSize: '14px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    🚀 Start Quiz
                  </button>
                  
                  <button
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: 'var(--error)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#dc2626';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'var(--error)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
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
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000
          }}>
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Quizzes;