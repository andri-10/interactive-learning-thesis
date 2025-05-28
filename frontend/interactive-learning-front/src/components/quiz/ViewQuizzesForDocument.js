import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ViewQuizzesForDocument = ({ documentId, refreshTrigger }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, [documentId, refreshTrigger]);

  const fetchQuizzes = async () => {
    try {
      const response = await api.get(`/quizzes/document/${documentId}`);
      setQuizzes(response.data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = (quiz) => {
    navigate(`/quiz/${quiz.id}`);
  };

  if (loading) return null;
  if (quizzes.length === 0) return null;

  return (
    <div style={{ marginTop: '12px', width: '100%' }}>
      <small style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>
        📝 Generated Quizzes ({quizzes.length}):
      </small>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
        {quizzes.map(quiz => (
          <button
            key={quiz.id}
            onClick={() => startQuiz(quiz)}
            style={{
              padding: '8px 12px',
              fontSize: '12px',
              backgroundColor: 'var(--secondary)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--primary)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'var(--secondary)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            🚀 {quiz.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ViewQuizzesForDocument;