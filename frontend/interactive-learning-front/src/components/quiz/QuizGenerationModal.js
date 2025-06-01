import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const QuizGenerationModal = ({ isOpen, onClose, onGenerate, documentTitle }) => {
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [quizTitle, setQuizTitle] = useState('');
  const [questionType, setQuestionType] = useState('MULTIPLE_CHOICE');
  const [loading, setLoading] = useState(false);

  // Update quiz title when document changes
  useEffect(() => {
    if (documentTitle) {
      setQuizTitle(`Quiz for ${documentTitle}`);
    }
  }, [documentTitle]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onGenerate(numberOfQuestions, quizTitle, questionType);
    setLoading(false);
    onClose();
  };

  const handleClose = () => {
    // Reset form when closing
    setNumberOfQuestions(5);
    setQuestionType('MULTIPLE_CHOICE');
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="🧠 Generate New Quiz with AI">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Quiz Title
          </label>
          <input
            type="text"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid var(--border)',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Question Type
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '12px 16px',
              border: `2px solid ${questionType === 'MULTIPLE_CHOICE' ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: '8px',
              backgroundColor: questionType === 'MULTIPLE_CHOICE' ? 'var(--primary)' : 'transparent',
              color: questionType === 'MULTIPLE_CHOICE' ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              flex: 1,
              textAlign: 'center'
            }}>
              <input
                type="radio"
                name="questionType"
                value="MULTIPLE_CHOICE"
                checked={questionType === 'MULTIPLE_CHOICE'}
                onChange={(e) => setQuestionType(e.target.value)}
                style={{ display: 'none' }}
              />
              <span>🔤 Multiple Choice</span>
            </label>
            
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '12px 16px',
              border: `2px solid ${questionType === 'TRUE_FALSE' ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: '8px',
              backgroundColor: questionType === 'TRUE_FALSE' ? 'var(--primary)' : 'transparent',
              color: questionType === 'TRUE_FALSE' ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              flex: 1,
              textAlign: 'center'
            }}>
              <input
                type="radio"
                name="questionType"
                value="TRUE_FALSE"
                checked={questionType === 'TRUE_FALSE'}
                onChange={(e) => setQuestionType(e.target.value)}
                style={{ display: 'none' }}
              />
              <span>✓✗ True/False</span>
            </label>
          </div>
          <small style={{ color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
            {questionType === 'MULTIPLE_CHOICE' 
              ? 'Each question will have 4 answer options' 
              : 'Each question will have True/False options'}
          </small>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Number of Questions
          </label>
          <select
            value={numberOfQuestions}
            onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid var(--border)',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          >
            <option value={3}>3 Questions</option>
            <option value={5}>5 Questions</option>
            <option value={10}>10 Questions</option>
            <option value={15}>15 Questions</option>
            <option value={20}>20 Questions</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={handleClose}
            style={{
              padding: '12px 24px',
              border: '2px solid var(--border)',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ 
              opacity: loading ? 0.6 : 1,
              padding: '12px 24px',
              fontSize: '16px'
            }}
          >
            {loading ? '🧠 Generating...' : '✨ Generate with AI'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default QuizGenerationModal;