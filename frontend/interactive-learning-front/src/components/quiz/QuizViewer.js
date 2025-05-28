import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import api from '../../services/api';

const QuizViewer = ({ isOpen, onClose, quizId, quizTitle }) => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && quizId) {
      fetchQuiz();
    }
  }, [isOpen, quizId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/quizzes/${quizId}`);
      setQuiz(response.data);
    } catch (error) {
      setError('Failed to load quiz');
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderQuestion = (question, index) => {
    return (
      <div key={question.id} style={{ 
        marginBottom: '24px', 
        padding: '20px', 
        border: '1px solid var(--border)', 
        borderRadius: '8px',
        backgroundColor: 'var(--background)'
      }}>
        <h4 style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>
          Question {index + 1}: {question.questionText}
        </h4>
        
        {question.questionType === 'MULTIPLE_CHOICE' && (
          <div style={{ marginBottom: '12px' }}>
            {question.options.map((option, optionIndex) => (
              <div 
                key={optionIndex}
                style={{
                  padding: '8px 12px',
                  margin: '4px 0',
                  borderRadius: '6px',
                  backgroundColor: optionIndex === question.correctOptionIndex 
                    ? 'var(--success)' 
                    : 'var(--surface)',
                  color: optionIndex === question.correctOptionIndex 
                    ? 'white' 
                    : 'var(--text-primary)',
                  border: '1px solid var(--border)'
                }}
              >
                {String.fromCharCode(65 + optionIndex)}. {option}
                {optionIndex === question.correctOptionIndex && ' ✓'}
              </div>
            ))}
          </div>
        )}
        
        {question.questionType === 'TRUE_FALSE' && (
          <div style={{ marginBottom: '12px' }}>
            {question.options.map((option, optionIndex) => (
              <div 
                key={optionIndex}
                style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  margin: '4px 8px 4px 0',
                  borderRadius: '6px',
                  backgroundColor: optionIndex === question.correctOptionIndex 
                    ? 'var(--success)' 
                    : 'var(--surface)',
                  color: optionIndex === question.correctOptionIndex 
                    ? 'white' 
                    : 'var(--text-primary)',
                  border: '1px solid var(--border)'
                }}
              >
                {option}
                {optionIndex === question.correctOptionIndex && ' ✓'}
              </div>
            ))}
          </div>
        )}
        
        {question.explanation && (
          <div style={{
            padding: '12px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            borderRadius: '6px',
            fontSize: '14px'
          }}>
            <strong>Explanation:</strong> {question.explanation}
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={quizTitle} maxWidth="800px">
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div>Loading quiz...</div>
        </div>
      )}
      
      {error && (
        <div style={{ color: 'var(--error)', textAlign: 'center', padding: '20px' }}>
          {error}
        </div>
      )}
      
      {quiz && (
        <div>
          <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: 'var(--background)', borderRadius: '8px' }}>
            <p><strong>Questions:</strong> {quiz.questions?.length || 0}</p>
            <p><strong>Micro:bit Compatible:</strong> {quiz.microbitCompatible ? 'Yes' : 'No'}</p>
            <p><strong>Created:</strong> {new Date(quiz.createdAt).toLocaleDateString()}</p>
          </div>
          
          {quiz.questions && quiz.questions.length > 0 ? (
            <div>
              {quiz.questions.map((question, index) => renderQuestion(question, index))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              No questions found in this quiz.
            </p>
          )}
          
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button
              onClick={onClose}
              className="btn-primary"
            >
              Close Quiz
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default QuizViewer;