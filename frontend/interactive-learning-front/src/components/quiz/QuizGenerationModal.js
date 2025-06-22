import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { 
  Brain, 
  Zap, 
  X, 
  CheckCircle2, 
  HelpCircle, 
  Hash, 
  FileText,
  Sparkles,
  Loader,
  Settings,
  Target
} from 'lucide-react';

const QuizGenerationModal = ({ isOpen, onClose, onGenerate, documentTitle }) => {
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [quizTitle, setQuizTitle] = useState('');
  const [questionType, setQuestionType] = useState('MULTIPLE_CHOICE');
  const [difficulty, setDifficulty] = useState(2);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Update quiz title when document changes
  useEffect(() => {
    if (documentTitle) {
      setQuizTitle(`${documentTitle} - AI Quiz`);
    }
  }, [documentTitle]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!quizTitle.trim()) {
      newErrors.quizTitle = 'Quiz title is required';
    } else if (quizTitle.trim().length < 3) {
      newErrors.quizTitle = 'Quiz title must be at least 3 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      await onGenerate(numberOfQuestions, quizTitle.trim(), questionType);
      handleClose();
    } catch (error) {
      console.error('Quiz generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setNumberOfQuestions(5);
    setQuestionType('MULTIPLE_CHOICE');
    setDifficulty(2);
    setLoading(false);
    setErrors({});
    onClose();
  };

  const getDifficultyLabel = (level) => {
    switch (level) {
      case 1: return { label: 'Easy', desc: 'Basic comprehension questions', color: 'var(--success)' };
      case 2: return { label: 'Medium', desc: 'Analytical thinking required', color: '#f59e0b' };
      case 3: return { label: 'Hard', desc: 'Complex reasoning and synthesis', color: 'var(--error)' };
      default: return { label: 'Medium', desc: 'Analytical thinking required', color: '#f59e0b' };
    }
  };

  const currentDifficulty = getDifficultyLabel(difficulty);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
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
            <Brain size={20} />
          </div>
          Generate AI-Powered Quiz
        </div>
      }
      maxWidth="600px"
    >
      {/* Header Info */}
      <div style={{
        padding: '16px',
        backgroundColor: 'var(--background)',
        borderRadius: '12px',
        marginBottom: '24px',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <FileText size={16} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Source Document</span>
        </div>
        <p style={{ 
          margin: 0, 
          color: 'var(--text-secondary)', 
          fontSize: '14px',
          lineHeight: '1.4'
        }}>
          {documentTitle || 'Unknown Document'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Quiz Title */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600',
            color: 'var(--text-primary)',
            fontSize: '14px'
          }}>
            Quiz Title *
          </label>
          <input
            type="text"
            value={quizTitle}
            onChange={(e) => {
              setQuizTitle(e.target.value);
              if (errors.quizTitle) {
                setErrors({ ...errors, quizTitle: null });
              }
            }}
            placeholder="Enter a descriptive title for your quiz"
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `2px solid ${errors.quizTitle ? 'var(--error)' : 'var(--border)'}`,
              borderRadius: '8px',
              fontSize: '16px',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => !errors.quizTitle && (e.target.style.borderColor = 'var(--primary)')}
            onBlur={(e) => !errors.quizTitle && (e.target.style.borderColor = 'var(--border)')}
          />
          {errors.quizTitle && (
            <div style={{ 
              color: 'var(--error)', 
              fontSize: '12px', 
              marginTop: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <X size={12} />
              {errors.quizTitle}
            </div>
          )}
        </div>

        {/* Question Type Selection */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '12px', 
            fontWeight: '600',
            color: 'var(--text-primary)',
            fontSize: '14px'
          }}>
            Question Type
          </label>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Multiple Choice Option */}
            <label style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              padding: '20px 16px',
              border: `2px solid ${questionType === 'MULTIPLE_CHOICE' ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: '12px',
              backgroundColor: questionType === 'MULTIPLE_CHOICE' ? 'var(--primary)' : 'var(--surface)',
              color: questionType === 'MULTIPLE_CHOICE' ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <input
                type="radio"
                name="questionType"
                value="MULTIPLE_CHOICE"
                checked={questionType === 'MULTIPLE_CHOICE'}
                onChange={(e) => setQuestionType(e.target.value)}
                style={{ display: 'none' }}
              />
              
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: questionType === 'MULTIPLE_CHOICE' ? 'rgba(255,255,255,0.2)' : 'var(--primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <HelpCircle size={20} />
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
                  Multiple Choice
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  opacity: 0.8,
                  lineHeight: '1.3'
                }}>
                  4 options per question
                </div>
              </div>
              
              {questionType === 'MULTIPLE_CHOICE' && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircle2 size={16} />
                </div>
              )}
            </label>
            
            {/* True/False Option */}
            <label style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              padding: '20px 16px',
              border: `2px solid ${questionType === 'TRUE_FALSE' ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: '12px',
              backgroundColor: questionType === 'TRUE_FALSE' ? 'var(--primary)' : 'var(--surface)',
              color: questionType === 'TRUE_FALSE' ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <input
                type="radio"
                name="questionType"
                value="TRUE_FALSE"
                checked={questionType === 'TRUE_FALSE'}
                onChange={(e) => setQuestionType(e.target.value)}
                style={{ display: 'none' }}
              />
              
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: questionType === 'TRUE_FALSE' ? 'rgba(255,255,255,0.2)' : 'var(--secondary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle2 size={20} />
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
                  True/False
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  opacity: 0.8,
                  lineHeight: '1.3'
                }}>
                  Simple binary choices
                </div>
              </div>
              
              {questionType === 'TRUE_FALSE' && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircle2 size={16} />
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Number of Questions */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600',
            color: 'var(--text-primary)',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Hash size={14} />
            Number of Questions
          </label>
          <select
            value={numberOfQuestions}
            onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid var(--border)',
              borderRadius: '8px',
              fontSize: '16px',
              backgroundColor: 'white',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          >
            <option value={3}>3 Questions (Quick Test)</option>
            <option value={5}>5 Questions (Standard)</option>
            <option value={10}>10 Questions (Comprehensive)</option>
            <option value={15}>15 Questions (Detailed)</option>
            <option value={20}>20 Questions (Extensive)</option>
          </select>
        </div>

        {/* Difficulty Level */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '12px', 
            fontWeight: '600',
            color: 'var(--text-primary)',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Target size={14} />
            Difficulty Level
          </label>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            {[1, 2, 3].map((level) => {
              const diffInfo = getDifficultyLabel(level);
              const isSelected = difficulty === level;
              
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  style={{
                    padding: '12px 8px',
                    border: `2px solid ${isSelected ? diffInfo.color : 'var(--border)'}`,
                    borderRadius: '8px',
                    backgroundColor: isSelected ? diffInfo.color : 'transparent',
                    color: isSelected ? 'white' : diffInfo.color,
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                >
                  {diffInfo.label}
                </button>
              );
            })}
          </div>
          
          <div style={{
            padding: '12px',
            backgroundColor: 'var(--background)',
            borderRadius: '8px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Settings size={12} />
            {currentDifficulty.desc}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'flex-end',
          paddingTop: '20px',
          borderTop: '1px solid var(--border)'
        }}>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            style={{
              padding: '12px 24px',
              border: '2px solid var(--border)',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = 'var(--background)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <X size={16} />
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading || !quizTitle.trim()}
            className="btn-primary"
            style={{ 
              opacity: (loading || !quizTitle.trim()) ? 0.6 : 1,
              cursor: (loading || !quizTitle.trim()) ? 'not-allowed' : 'pointer',
              padding: '12px 24px',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: loading ? 'var(--border)' : 'linear-gradient(135deg, var(--primary), var(--secondary))',
              border: 'none',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? (
              <>
                <Loader size={16} className="animate-spin" />
                Generating AI Quiz...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate with AI
              </>
            )}
          </button>
        </div>
      </form>

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

export default QuizGenerationModal;