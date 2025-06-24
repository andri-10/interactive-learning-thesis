import React, { useState } from 'react';
import Modal from '../common/Modal';
import { 
  Brain, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  Loader,
  FileText,
  Target,
  Sparkles,
  Info
} from 'lucide-react';

const QuizGenerationModal = ({ isOpen, onClose, onGenerate, documentTitle }) => {
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [quizTitle, setQuizTitle] = useState('');
  const [questionType, setQuestionType] = useState('MULTIPLE_CHOICE');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generationProgress, setGenerationProgress] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!quizTitle.trim()) {
      setError('Please enter a quiz title');
      return;
    }

    if (numberOfQuestions < 1 || numberOfQuestions > 15) {
      setError('Number of questions must be between 1 and 15');
      return;
    }

    setGenerating(true);
    setError('');
    setGenerationProgress('Preparing to generate questions...');

    try {
      // Show progress updates
      setTimeout(() => setGenerationProgress('Analyzing document content...'), 1000);
      setTimeout(() => setGenerationProgress('Generating questions with AI...'), 2000);
      setTimeout(() => setGenerationProgress('Validating question quality...'), 4000);
      
      // Call with fixed difficulty = 2 (medium)
      await onGenerate(numberOfQuestions, quizTitle.trim(), questionType);
      
      setGenerationProgress('Quiz generated successfully!');
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1000);
      
    } catch (err) {
      console.error('Quiz generation error:', err);
      setError(err.message || 'Failed to generate quiz. Please try again.');
      setGenerationProgress('');
    } finally {
      if (!error) {
        setTimeout(() => setGenerating(false), 1000);
      } else {
        setGenerating(false);
      }
    }
  };

  const resetForm = () => {
    setError('');
    setQuizTitle('');
    setNumberOfQuestions(5);
    setQuestionType('MULTIPLE_CHOICE');
    setGenerationProgress('');
  };

  const handleClose = () => {
    if (!generating) {
      resetForm();
      onClose();
    }
  };

  const getRecommendedQuestionCount = () => {
    if (numberOfQuestions <= 3) return "Quick review";
    if (numberOfQuestions <= 7) return "Standard quiz";
    if (numberOfQuestions <= 12) return "Comprehensive test";
    return "Extended assessment";
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Generate AI Quiz" maxWidth="600px">
      <div style={{ padding: '0' }}>
        {/* Header Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px',
          padding: '24px',
          backgroundColor: 'var(--background)',
          borderRadius: '12px',
          border: '1px solid var(--border)'
        }}>
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: 'var(--primary)',
            color: 'white'
          }}>
            <Sparkles size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              AI-Powered Quiz Generation
            </h3>
            <p style={{
              margin: '6px 0 0 0',
              fontSize: '14px',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FileText size={14} />
              <strong>{documentTitle}</strong>
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        {generating && generationProgress && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            backgroundColor: '#f0f9ff',
            color: 'var(--primary)',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #bae6fd'
          }}>
            <Loader size={16} className="animate-spin" />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              {generationProgress}
            </span>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            backgroundColor: '#fee2e2',
            color: 'var(--error)',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #fecaca'
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Quiz Title */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              Quiz Title *
            </label>
            <input
              type="text"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="Enter a descriptive title for your quiz"
              disabled={generating}
              maxLength={100}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid var(--border)',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
                backgroundColor: generating ? 'var(--background)' : 'white'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
            <div style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              marginTop: '4px'
            }}>
              {quizTitle.length}/100 characters
            </div>
          </div>

          {/* Number of Questions */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              Number of Questions
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="range"
                min="1"
                max="15"
                value={numberOfQuestions}
                onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
                disabled={generating}
                style={{
                  flex: 1,
                  height: '6px',
                  borderRadius: '3px',
                  background: 'var(--border)',
                  outline: 'none',
                  appearance: 'none'
                }}
              />
              <div style={{
                minWidth: '60px',
                padding: '8px 12px',
                backgroundColor: 'var(--primary)',
                color: 'white',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                textAlign: 'center'
              }}>
                {numberOfQuestions}
              </div>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              marginTop: '6px'
            }}>
              <span>Quick (1)</span>
              <span style={{ 
                backgroundColor: 'var(--surface)', 
                padding: '2px 8px', 
                borderRadius: '4px',
                fontWeight: '500'
              }}>
                {getRecommendedQuestionCount()}
              </span>
              <span>Extended (15)</span>
            </div>
          </div>

          {/* Question Type */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              marginBottom: '12px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              Question Type
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setQuestionType('MULTIPLE_CHOICE')}
                disabled={generating}
                style={{
                  flex: 1,
                  padding: '20px 16px',
                  backgroundColor: questionType === 'MULTIPLE_CHOICE' ? 'var(--primary)' : 'var(--background)',
                  color: questionType === 'MULTIPLE_CHOICE' ? 'white' : 'var(--text-primary)',
                  border: `2px solid ${questionType === 'MULTIPLE_CHOICE' ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: '12px',
                  cursor: generating ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: generating ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!generating && questionType !== 'MULTIPLE_CHOICE') {
                    e.target.style.borderColor = 'var(--primary)';
                    e.target.style.backgroundColor = 'var(--surface)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!generating && questionType !== 'MULTIPLE_CHOICE') {
                    e.target.style.borderColor = 'var(--border)';
                    e.target.style.backgroundColor = 'var(--background)';
                  }
                }}
              >
                <Target size={20} />
                <div>
                  <div style={{ fontWeight: '600' }}>Multiple Choice</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>A, B, C, D options</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setQuestionType('TRUE_FALSE')}
                disabled={generating}
                style={{
                  flex: 1,
                  padding: '20px 16px',
                  backgroundColor: questionType === 'TRUE_FALSE' ? 'var(--primary)' : 'var(--background)',
                  color: questionType === 'TRUE_FALSE' ? 'white' : 'var(--text-primary)',
                  border: `2px solid ${questionType === 'TRUE_FALSE' ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: '12px',
                  cursor: generating ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: generating ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!generating && questionType !== 'TRUE_FALSE') {
                    e.target.style.borderColor = 'var(--primary)';
                    e.target.style.backgroundColor = 'var(--surface)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!generating && questionType !== 'TRUE_FALSE') {
                    e.target.style.borderColor = 'var(--border)';
                    e.target.style.backgroundColor = 'var(--background)';
                  }
                }}
              >
                <CheckCircle size={20} />
                <div>
                  <div style={{ fontWeight: '600' }}>True / False</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>Statement verification</div>
                </div>
              </button>
            </div>
          </div>

          {/* AI Features Info */}
          <div style={{
            padding: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Brain size={16} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--primary)' }}>
                AI-Enhanced Generation
              </span>
            </div>
            <ul style={{
              margin: 0,
              paddingLeft: '16px',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: '1.6'
            }}>
              <li>Intelligent content analysis and concept extraction</li>
              <li>Educational best practices and quality validation</li>
              <li>Balanced difficulty and meaningful distractors</li>
              <li>English-only output with clear, professional language</li>
            </ul>
          </div>

          {/* Tips Section */}
          {!generating && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#fffbeb',
              borderRadius: '8px',
              border: '1px solid #fcd34d',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <Info size={14} style={{ color: '#d97706', marginTop: '2px', flexShrink: 0 }} />
                <div style={{ fontSize: '12px', color: '#92400e', lineHeight: '1.4' }}>
                  <strong>Tip:</strong> For best results, ensure your document contains substantial content. 
                  The AI works best with educational materials, articles, or detailed explanations.
                </div>
              </div>
            </div>
          )}

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
              disabled={generating}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                border: '2px solid var(--border)',
                borderRadius: '8px',
                cursor: generating ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
                opacity: generating ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!generating) {
                  e.target.style.backgroundColor = 'var(--background)';
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!generating) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.color = 'var(--text-secondary)';
                }
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={generating || !quizTitle.trim()}
              style={{
                padding: '12px 32px',
                backgroundColor: (generating || !quizTitle.trim()) ? 'var(--border)' : 'var(--primary)',
                color: (generating || !quizTitle.trim()) ? 'var(--text-secondary)' : 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: (generating || !quizTitle.trim()) ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: '160px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                if (!generating && quizTitle.trim()) {
                  e.target.style.backgroundColor = 'var(--primary-dark)';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!generating && quizTitle.trim()) {
                  e.target.style.backgroundColor = 'var(--primary)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              {generating ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Generate Quiz
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }

        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }

        input[type="range"]::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }

        input[type="range"]::-webkit-slider-track {
          height: 6px;
          border-radius: 3px;
          background: var(--border);
        }

        input[type="range"]::-moz-range-track {
          height: 6px;
          border-radius: 3px;
          background: var(--border);
          border: none;
        }
      `}</style>
    </Modal>
  );
};

export default QuizGenerationModal;