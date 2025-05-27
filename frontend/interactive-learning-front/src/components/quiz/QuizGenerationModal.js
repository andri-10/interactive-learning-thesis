import React, { useState } from 'react';
import Modal from '../common/Modal';

const QuizGenerationModal = ({ isOpen, onClose, onGenerate, documentTitle }) => {
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [quizTitle, setQuizTitle] = useState(`Quiz for ${documentTitle}`);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onGenerate(numberOfQuestions, quizTitle);
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate New Quiz">
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
            onClick={onClose}
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
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Generating...' : 'Generate Quiz'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default QuizGenerationModal;