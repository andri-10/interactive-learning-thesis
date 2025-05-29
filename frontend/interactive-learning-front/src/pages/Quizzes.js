import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Toast from '../components/common/Toast';

const Quizzes = () => {
  const { user, logout } = useAuth();
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        fontSize: '18px',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🧠</div>
          <div>Loading quizzes...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        color: 'var(--error)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <div style={{ fontSize: '18px', marginBottom: '16px' }}>{error}</div>
        <button onClick={fetchQuizzes} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: 'var(--text-primary)', margin: 0 }}>
          🧠 My Quizzes ({quizzes.length})
        </h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Welcome, {user?.username}!</span>
          <button 
            onClick={logout}
            className="btn-primary"
            style={{ backgroundColor: 'var(--error)', padding: '8px 16px', fontSize: '14px' }}
          >
            Logout
          </button>
        </div>
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
                    fontSize: '14px'
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
                    fontSize: '14px'
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
  );
};

export default Quizzes;