import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useMicrobit } from '../context/MicrobitContext';

const QuizTaking = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [microbitMode, setMicrobitMode] = useState(false);
  const [microbitConnected, setMicrobitConnected] = useState(false);
  
  const { lastMovement, lastButton } = useMicrobit();

  useEffect(() => {
    fetchQuiz();
    checkMicrobitConnection();
  }, [quizId]);

  // Handle micro:bit movements when in micro:bit mode
  useEffect(() => {
    if (microbitMode && lastMovement.movement && quiz && quiz.questions[currentQuestionIndex] && lastMovement.timestamp) {
      // Only process movements that happened after micro:bit mode was enabled
      const movementTime = new Date(lastMovement.timestamp).getTime();
      const currentTime = Date.now();
      
      // Only process recent movements (within last 2 seconds)
      if (currentTime - movementTime < 2000) {
        handleMicrobitMovement(lastMovement.movement);
      }
    }
  }, [lastMovement, microbitMode, currentQuestionIndex, quiz]);

  // Handle micro:bit button presses for navigation
  useEffect(() => {
    if (microbitMode && lastButton.button && lastButton.timestamp) {
      const buttonTime = new Date(lastButton.timestamp).getTime();
      const currentTime = Date.now();
      
      // Only process recent button presses (within last 2 seconds)
      if (currentTime - buttonTime < 2000) {
        handleMicrobitButton(lastButton.button);
      }
    }
  }, [lastButton, microbitMode]);

  const fetchQuiz = async () => {
    try {
      const response = await api.get(`/quizzes/${quizId}`);
      setQuiz(response.data);
    } catch (error) {
      setError('Failed to load quiz');
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkMicrobitConnection = async () => {
    try {
      const response = await api.get('/microbit/status');
      setMicrobitConnected(response.data.connected);
    } catch (error) {
      console.error('Error checking micro:bit status:', error);
    }
  };

  const handleMicrobitMovement = (movement) => {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    let selectedAnswer = null;

    if (currentQuestion.questionType === 'TRUE_FALSE') {
      // TRUE_FALSE: LEFT = True (0), RIGHT = False (1)
      if (movement === 'LEFT') {
        selectedAnswer = 0; // True
      } else if (movement === 'RIGHT') {
        selectedAnswer = 1; // False
      }
    } else if (currentQuestion.questionType === 'MULTIPLE_CHOICE') {
      // MULTIPLE_CHOICE: LEFT = A (0), FORWARD = B (1), RIGHT = C (2), BACKWARD = D (3)
      switch (movement) {
        case 'LEFT':
          selectedAnswer = 0; // A
          break;
        case 'FORWARD':
          selectedAnswer = 1; // B
          break;
        case 'RIGHT':
          selectedAnswer = 2; // C
          break;
        case 'BACKWARD':
          selectedAnswer = 3; // D
          break;
      }
    }

    if (selectedAnswer !== null && selectedAnswer < currentQuestion.options.length) {
      handleAnswer(currentQuestion.id, selectedAnswer);
      console.log(`🎮 Micro:bit selected: ${currentQuestion.options[selectedAnswer]}`);
    }
  };

  const handleMicrobitButton = (button) => {
    if (button === 'BUTTON_A') {
      goToPrevious();
    } else if (button === 'BUTTON_B') {
      // If on last question, finish quiz
      if (currentQuestionIndex === quiz.questions.length - 1) {
        finishQuiz();
      } else {
        goToNext();
      }
    }
  };

  const getMicrobitInstructions = () => {
    if (!quiz || !quiz.questions[currentQuestionIndex]) return '';
    
    const questionType = quiz.questions[currentQuestionIndex].questionType;
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
    
    if (questionType === 'TRUE_FALSE') {
      return `🎮 Micro:bit Mode Active: Tilt LEFT(True), RIGHT(False) | Buttons: A(Previous), B(${isLastQuestion ? 'Finish' : 'Next'})`;
    } else if (questionType === 'MULTIPLE_CHOICE') {
      return `🎮 Micro:bit Mode Active: Tilt LEFT(A), FORWARD(B), RIGHT(C), BACKWARD(D) | Buttons: A(Previous), B(${isLastQuestion ? 'Finish' : 'Next'})`;
    }
    
    return '🎮 Micro:bit Mode Active: Use device movements to answer questions!';
  };

  const startMicrobitMode = async () => {
    try {
      const userId = 1; // Get from auth context if needed
      const response = await api.post(`/microbit/quiz/${quizId}/start?userId=${userId}`);
      
      if (response.data) {
        setMicrobitMode(true);
        console.log('✅ Micro:bit mode started successfully');
        
        // Clear any existing micro:bit state to prevent old movements from being processed
        setTimeout(() => {
          console.log('🧹 Cleared previous micro:bit state');
        }, 100);
      }
    } catch (error) {
      console.error('❌ Failed to start micro:bit mode:', error);
      alert('Failed to start micro:bit mode: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const stopMicrobitMode = async () => {
    try {
      await api.post(`/microbit/quiz/${quizId}/stop`);
      setMicrobitMode(false);
      console.log('✅ Micro:bit mode stopped');
    } catch (error) {
      console.error('❌ Failed to stop micro:bit mode:', error);
    }
  };

  const handleAnswer = (questionId, answerIndex) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: answerIndex
    });
  };

  const goToNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const finishQuiz = async () => {
    if (microbitMode) {
      await stopMicrobitMode();
    }
    
    navigate('/quiz-results', {
      state: {
        quiz: quiz,
        userAnswers: userAnswers
      }
    });
  };

  const exitQuiz = async () => {
    if (window.confirm('Are you sure you want to exit the quiz? Your progress will be lost.')) {
      if (microbitMode) {
        await stopMicrobitMode();
      }
      navigate('/documents');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📚</div>
          <div>Loading quiz...</div>
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
        height: '100vh',
        color: 'var(--error)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <div style={{ fontSize: '18px', marginBottom: '16px' }}>{error}</div>
        <button onClick={() => navigate('/documents')} className="btn-primary">
          Back to Documents
        </button>
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
        <div style={{ fontSize: '18px', marginBottom: '16px', textAlign: 'center' }}>
          No questions found in this quiz
        </div>
        <button onClick={() => navigate('/documents')} className="btn-primary">
          Back to Documents
        </button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const isCurrentQuestionAnswered = userAnswers[currentQuestion.id] !== undefined;
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--background)',
      padding: '20px'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '24px' }}>
            🧠 {quiz.title}
          </h1>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {microbitConnected && quiz?.microbitCompatible && (
              <button 
                onClick={microbitMode ? stopMicrobitMode : startMicrobitMode}
                style={{
                  padding: '8px 16px',
                  backgroundColor: microbitMode ? 'var(--success)' : 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                {microbitMode ? '🎮 Micro:bit ON' : '🎮 Enable Micro:bit'}
              </button>
            )}
            
            <button 
              onClick={exitQuiz}
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--text-secondary)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--error)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'var(--text-secondary)';
              }}
            >
              ❌ Exit Quiz
            </button>
          </div>
        </div>

        {microbitConnected && quiz?.microbitCompatible && (
          <div style={{
            padding: '12px',
            backgroundColor: microbitMode ? 'var(--success)' : 'var(--background)',
            color: microbitMode ? 'white' : 'var(--text-primary)',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px',
            border: microbitMode ? 'none' : '1px solid var(--border)'
          }}>
            {microbitMode ? getMicrobitInstructions() : '🎮 Micro:bit available - Click "Enable Micro:bit" to use physical controls'}
          </div>
        )}
        
        <div style={{ 
          width: '100%', 
          height: '12px', 
          backgroundColor: 'var(--border)', 
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
            transition: 'width 0.5s ease',
            borderRadius: '6px'
          }} />
        </div>
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '12px', 
          color: 'var(--text-secondary)',
          fontSize: '14px'
        }}>
          <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
          <span>{answeredCount} of {quiz.questions.length} answered</span>
        </div>
      </div>

      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        backgroundColor: 'var(--surface)',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        border: '1px solid var(--border)',
        minHeight: '500px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '30px',
          backgroundColor: 'var(--primary)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          {currentQuestionIndex + 1}/{quiz.questions.length}
        </div>

        <h2 style={{ 
          fontSize: '28px', 
          marginBottom: '40px', 
          color: 'var(--text-primary)',
          lineHeight: '1.4',
          paddingRight: '80px'
        }}>
          {currentQuestion.questionText}
        </h2>

        <div style={{ flex: 1, marginBottom: '30px' }}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = userAnswers[currentQuestion.id] === index;
            
            return (
              <button
                key={index}
                onClick={() => handleAnswer(currentQuestion.id, index)}
                disabled={microbitMode}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '20px 24px',
                  marginBottom: '16px',
                  backgroundColor: isSelected ? 'var(--primary)' : 'var(--background)',
                  color: isSelected ? 'white' : 'var(--text-primary)',
                  border: `3px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: '16px',
                  cursor: microbitMode ? 'not-allowed' : 'pointer',
                  fontSize: '18px',
                  textAlign: 'left',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  opacity: microbitMode ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isSelected && !microbitMode) {
                    e.target.style.backgroundColor = 'var(--surface)';
                    e.target.style.borderColor = 'var(--primary)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected && !microbitMode) {
                    e.target.style.backgroundColor = 'var(--background)';
                    e.target.style.borderColor = 'var(--border)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                <span style={{ 
                  marginRight: '16px', 
                  fontWeight: 'bold',
                  fontSize: '20px',
                  color: isSelected ? 'white' : 'var(--primary)'
                }}>
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
                {isSelected && (
                  <span style={{ 
                    position: 'absolute',
                    right: '24px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '24px'
                  }}>
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={goToPrevious}
            disabled={currentQuestionIndex === 0 || microbitMode}
            style={{
              padding: '15px 30px',
              backgroundColor: (currentQuestionIndex === 0 || microbitMode) ? 'var(--border)' : 'var(--secondary)',
              color: (currentQuestionIndex === 0 || microbitMode) ? 'var(--text-secondary)' : 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: (currentQuestionIndex === 0 || microbitMode) ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.2s',
              opacity: (currentQuestionIndex === 0 || microbitMode) ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (currentQuestionIndex !== 0 && !microbitMode) {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentQuestionIndex !== 0 && !microbitMode) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            ← Previous
          </button>

          <div style={{ 
            textAlign: 'center',
            color: 'var(--text-secondary)', 
            fontSize: '14px'
          }}>
            {microbitMode ? (
              <span style={{ color: 'var(--primary)', fontWeight: '600' }}>
                🎮 Use micro:bit to navigate
              </span>
            ) : isCurrentQuestionAnswered ? (
              <span style={{ color: 'var(--success)', fontWeight: '600' }}>
                ✓ Question answered
              </span>
            ) : (
              <span>Select an answer to continue</span>
            )}
          </div>

          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <button
              onClick={finishQuiz}
              disabled={!isCurrentQuestionAnswered && !microbitMode}
              style={{
                padding: '15px 30px',
                backgroundColor: (!isCurrentQuestionAnswered && !microbitMode) ? 'var(--border)' : 'var(--success)',
                color: (!isCurrentQuestionAnswered && !microbitMode) ? 'var(--text-secondary)' : 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: (!isCurrentQuestionAnswered && !microbitMode) ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.2s',
                opacity: (!isCurrentQuestionAnswered && !microbitMode) ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (isCurrentQuestionAnswered || microbitMode) {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (isCurrentQuestionAnswered || microbitMode) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              🏁 Finish Quiz
            </button>
          ) : (
            <button
              onClick={goToNext}
              disabled={(!isCurrentQuestionAnswered && !microbitMode)}
              className="btn-primary"
              style={{
                padding: '15px 30px',
                fontSize: '16px',
                fontWeight: '600',
                opacity: (!isCurrentQuestionAnswered && !microbitMode) ? 0.5 : 1,
                cursor: (!isCurrentQuestionAnswered && !microbitMode) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (isCurrentQuestionAnswered || microbitMode) {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (isCurrentQuestionAnswered || microbitMode) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizTaking;