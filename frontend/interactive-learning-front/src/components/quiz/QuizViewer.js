import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import api from '../../services/api';
import { 
  Brain, 
  HelpCircle, 
  CheckCircle2, 
  X, 
  Lightbulb, 
  Calendar, 
  Hash, 
  Cpu, 
  FileText,
  Loader,
  AlertTriangle,
  Eye,
  Target,
  Clock
} from 'lucide-react';

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
      setError('');
      const response = await api.get(`/quizzes/${quizId}`);
      setQuiz(response.data);
    } catch (error) {
      setError('Failed to load quiz');
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQuestionTypeIcon = (questionType) => {
    switch (questionType) {
      case 'MULTIPLE_CHOICE':
        return <HelpCircle size={16} style={{ color: 'var(--primary)' }} />;
      case 'TRUE_FALSE':
        return <CheckCircle2 size={16} style={{ color: 'var(--secondary)' }} />;
      default:
        return <HelpCircle size={16} style={{ color: 'var(--text-secondary)' }} />;
    }
  };

  const getQuestionTypeLabel = (questionType) => {
    switch (questionType) {
      case 'MULTIPLE_CHOICE':
        return 'Multiple Choice';
      case 'TRUE_FALSE':
        return 'True/False';
      default:
        return 'Unknown';
    }
  };

  const renderQuestion = (question, index) => {
    return (
      <div key={question.id} style={{ 
        marginBottom: '24px', 
        border: '1px solid var(--border)', 
        borderRadius: '12px',
        backgroundColor: 'var(--surface)',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
      }}>
        {/* Question Header */}
        <div style={{
          padding: '16px 20px',
          backgroundColor: 'var(--background)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              padding: '6px',
              borderRadius: '6px',
              backgroundColor: 'var(--primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {getQuestionTypeIcon(question.questionType)}
            </div>
            <span style={{ 
              fontWeight: '600', 
              color: 'var(--text-primary)',
              fontSize: '14px'
            }}>
              Question {index + 1}
            </span>
            <span style={{
              padding: '2px 8px',
              fontSize: '11px',
              backgroundColor: question.questionType === 'MULTIPLE_CHOICE' ? 'var(--primary)' : 'var(--secondary)',
              color: 'white',
              borderRadius: '10px',
              fontWeight: '500'
            }}>
              {getQuestionTypeLabel(question.questionType)}
            </span>
          </div>
          
          {question.difficultyLevel && (
            <div style={{
              padding: '4px 8px',
              fontSize: '11px',
              backgroundColor: question.difficultyLevel === 1 ? 'var(--success)' : 
                              question.difficultyLevel === 3 ? 'var(--error)' : '#f59e0b',
              color: 'white',
              borderRadius: '8px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Target size={10} />
              {question.difficultyLevel === 1 ? 'Easy' : 
               question.difficultyLevel === 3 ? 'Hard' : 'Medium'}
            </div>
          )}
        </div>

        {/* Question Content */}
        <div style={{ padding: '20px' }}>
          {/* Question Text */}
          <h4 style={{ 
            marginBottom: '20px', 
            color: 'var(--text-primary)',
            fontSize: '16px',
            lineHeight: '1.5',
            fontWeight: '500'
          }}>
            {question.questionText}
          </h4>
          
          {/* Answer Options */}
          {question.questionType === 'MULTIPLE_CHOICE' && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {question.options.map((option, optionIndex) => {
                  const isCorrect = optionIndex === question.correctOptionIndex;
                  
                  return (
                    <div 
                      key={optionIndex}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        backgroundColor: isCorrect ? 'var(--success)' : 'var(--background)',
                        border: `1px solid ${isCorrect ? 'var(--success)' : 'var(--border)'}`,
                        color: isCorrect ? 'white' : 'var(--text-primary)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: isCorrect ? 'rgba(255,255,255,0.2)' : 'var(--primary)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: '600',
                        flexShrink: 0
                      }}>
                        {String.fromCharCode(65 + optionIndex)}
                      </div>
                      <span style={{ flex: 1, fontSize: '14px' }}>{option}</span>
                      {isCorrect && (
                        <CheckCircle2 size={16} style={{ color: 'white' }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {question.questionType === 'TRUE_FALSE' && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                {question.options.map((option, optionIndex) => {
                  const isCorrect = optionIndex === question.correctOptionIndex;
                  
                  return (
                    <div 
                      key={optionIndex}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        backgroundColor: isCorrect ? 'var(--success)' : 'var(--background)',
                        border: `1px solid ${isCorrect ? 'var(--success)' : 'var(--border)'}`,
                        color: isCorrect ? 'white' : 'var(--text-primary)',
                        fontSize: '14px',
                        fontWeight: '500',
                        minWidth: '100px',
                        justifyContent: 'center'
                      }}
                    >
                      <span>{option}</span>
                      {isCorrect && (
                        <CheckCircle2 size={16} style={{ color: 'white' }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Explanation */}
          {question.explanation && (
            <div style={{
              padding: '16px',
              backgroundColor: 'var(--primary)',
              color: 'white',
              borderRadius: '8px',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                marginBottom: '8px',
                fontWeight: '600'
              }}>
                <Lightbulb size={16} />
                Explanation
              </div>
              <div>{question.explanation}</div>
            </div>
          )}
        </div>
      </div>
    );
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

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Eye size={20} />
          </div>
          Quiz Preview
        </div>
      }
      maxWidth="900px"
    >
      {loading && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: '60px',
          gap: '16px'
        }}>
          <Loader size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>Loading quiz...</span>
        </div>
      )}
      
      {error && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: '40px',
          color: 'var(--error)'
        }}>
          <AlertTriangle size={32} style={{ marginBottom: '16px' }} />
          <div style={{ fontSize: '16px', marginBottom: '16px' }}>{error}</div>
          <button onClick={fetchQuiz} className="btn-primary">
            Try Again
          </button>
        </div>
      )}
      
      {quiz && (
        <div>
          {/* Quiz Header Info */}
          <div style={{ 
            marginBottom: '32px', 
            padding: '20px', 
            background: 'linear-gradient(135deg, var(--background) 0%, #f1f5f9 100%)',
            borderRadius: '12px',
            border: '1px solid var(--border)'
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              color: 'var(--text-primary)',
              fontSize: '20px',
              fontWeight: '600'
            }}>
              {quizTitle || quiz.title}
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Hash size={16} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <strong>{quiz.questions?.length || 0}</strong> Questions
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={16} style={{ color: quiz.microbitCompatible ? 'var(--success)' : 'var(--text-secondary)' }} />
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Micro:bit: <strong>{quiz.microbitCompatible ? 'Compatible' : 'Not Compatible'}</strong>
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} style={{ color: 'var(--secondary)' }} />
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <strong>{formatDate(quiz.createdAt)}</strong>
                </span>
              </div>
            </div>
          </div>
          
          {/* Questions */}
          {quiz.questions && quiz.questions.length > 0 ? (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '24px',
                paddingBottom: '12px',
                borderBottom: '2px solid var(--border)'
              }}>
                <Brain size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  Quiz Questions
                </h3>
              </div>
              
              {quiz.questions.map((question, index) => renderQuestion(question, index))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              color: 'var(--text-secondary)'
            }}>
              <FileText size={48} style={{ marginBottom: '16px', color: 'var(--text-secondary)' }} />
              <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--text-primary)' }}>
                No Questions Found
              </h3>
              <p>This quiz doesn't contain any questions yet.</p>
            </div>
          )}
          
          {/* Footer Actions */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '32px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border)'
          }}>
            <button
              onClick={onClose}
              className="btn-primary"
              style={{
                padding: '12px 32px',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto'
              }}
            >
              <X size={16} />
              Close Preview
            </button>
          </div>
        </div>
      )}

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </Modal>
  );
};

export default QuizViewer;