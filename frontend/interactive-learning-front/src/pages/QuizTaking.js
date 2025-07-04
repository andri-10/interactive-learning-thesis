import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useMicrobit } from '../context/MicrobitContext';
import { 
  Brain, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Zap, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Loader, 
  Target,
  Flag,
  Play,
  Pause,
  RotateCcw,
  Activity,
  Gamepad2,
  BookOpen,
  Award,
  Eye,
  ArrowLeft,
  ArrowRight,
  LogOut
} from 'lucide-react';

const QuizTaking = () => {
  const location = useLocation();
  const { user } = useAuth(); // Added useAuth hook

  console.log('Current user:', user);
  console.log('Token in localStorage:', localStorage.getItem('token'));

  if (!location.pathname.startsWith('/quiz/')) {
    console.log('Not on quiz route, skipping component render');
    return null;
  }

  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [microbitMode, setMicrobitMode] = useState(false);
  const [microbitConnected, setMicrobitConnected] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  
  const { lastMovement, lastButton } = useMicrobit();

   useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!quizId || quizId === 'undefined' || isNaN(parseInt(quizId))) {
      console.error('Invalid quiz ID:', quizId);
      navigate('/quizzes', { replace: true });
      return;
    }
    
    fetchQuiz();
    checkMicrobitConnection();
  }, [quizId, navigate]);

  useEffect(() => {
    if (microbitMode && lastMovement.movement && quiz && quiz.questions[currentQuestionIndex] && lastMovement.timestamp) {
      const movementTime = new Date(lastMovement.timestamp).getTime();
      const currentTime = Date.now();
      
      if (currentTime - movementTime < 2000) {
        handleMicrobitMovement(lastMovement.movement);
      }
    }
  }, [lastMovement, microbitMode, currentQuestionIndex, quiz]);

  useEffect(() => {
    if (microbitMode && lastButton.button && lastButton.timestamp) {
      const buttonTime = new Date(lastButton.timestamp).getTime();
      const currentTime = Date.now();
      
      if (currentTime - buttonTime < 2000) {
        handleMicrobitButton(lastButton.button);
      }
    }
  }, [lastButton, microbitMode]);

    const fetchQuiz = async () => {
      try {
        console.log('Fetching quiz with ID:', quizId);
        const response = await api.get(`/quizzes/${quizId}`);
        console.log('Quiz data received:', response.data);
        setQuiz(response.data);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        setError('Failed to load quiz');
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
      if (movement === 'LEFT') {
        selectedAnswer = 0; // True
      } else if (movement === 'RIGHT') {
        selectedAnswer = 1; // False
      }
    } else if (currentQuestion.questionType === 'MULTIPLE_CHOICE') {
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
      return `Tilt LEFT (True) or RIGHT (False) • Buttons: A (Previous) • B (${isLastQuestion ? 'Finish' : 'Next'})`;
    } else if (questionType === 'MULTIPLE_CHOICE') {
      return `Tilt LEFT (A) • FORWARD (B) • RIGHT (C) • BACKWARD (D) • Buttons: A (Previous) • B (${isLastQuestion ? 'Finish' : 'Next'})`;
    }
    
    return 'Use device movements to answer questions!';
  };

  const startMicrobitMode = async () => {
    try {
      const userId = user?.id || 1; // Use actual user ID
      const response = await api.post(`/microbit/quiz/${quizId}/start?userId=${userId}`);
      
      if (response.data) {
        setMicrobitMode(true);
        console.log('✅ Micro:bit mode started successfully');
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
    console.log('Setting answer:', { questionId, answerIndex });
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
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

  // FIXED: Added progress calculation and creation functions
  const calculateQuizResults = () => {
    if (!quiz?.questions?.length) {
      throw new Error('No valid quiz data found');
    }

    let correctAnswers = 0;
    
    quiz.questions.forEach((question) => {
      const userAnswer = userAnswers[question.id];
      const isCorrect = userAnswer !== undefined && userAnswer === question.correctOptionIndex;
      
      if (isCorrect) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
    
    return {
      score,
      correctAnswers,
      totalQuestions: quiz.questions.length,
      timeElapsed
    };
  };

  const createProgressRecord = async (results) => {
  try {
    console.log('=== PROGRESS CREATION DEBUG ===');
    console.log('Current user:', user);
    console.log('Token in localStorage:', localStorage.getItem('token'));
    
    // FIXED: Format the payload to match backend UserProgress entity expectations
    const progressData = {
      user: {
        id: user?.id || 1  // Backend expects nested user object
      },
      quiz: {
        id: parseInt(quizId)  // Backend expects nested quiz object  
      },
      score: results.score,
      correctAnswers: results.correctAnswers,
      totalQuestions: results.totalQuestions,
      timeElapsed: results.timeElapsed,
      completedAt: new Date().toISOString()
    };

    console.log('Progress data payload (FIXED FORMAT):', progressData);
    console.log('Making POST request to /progress...');

    const response = await api.post('/progress', progressData);
    console.log('✅ Progress record created successfully!', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Failed to create progress record:', error);
    console.error('Error response data:', error.response?.data);
    
    // Don't throw - continue to show results even if progress fails
    console.warn('⚠️ Continuing without progress record...');
  }
};

   const finishQuiz = async () => {
    console.log('=== FINISH QUIZ DEBUG START ===');
    
    if (isFinishing) {
      console.log('❌ Already finishing, preventing double click');
      return;
    }
    
    setIsFinishing(true);
    
    try {
      if (!quiz?.questions?.length) {
        throw new Error('No valid quiz data found');
      }
      
      console.log('✅ Quiz validation passed');
      
      if (microbitMode) {
        console.log('🎮 Stopping microbit mode...');
        await stopMicrobitMode();
      }

      // FIXED: Calculate results and create progress record
      const results = calculateQuizResults();
      console.log('📊 Quiz results calculated:', results);

      // FIXED: Create progress record in backend
      await createProgressRecord(results);
      
      const resultsPayload = {
        quiz: {
          id: quiz.id || quizId,
          title: quiz.title || 'Untitled Quiz',
          questions: quiz.questions,
          microbitCompatible: quiz.microbitCompatible || false
        },
        userAnswers: userAnswers,
        timeElapsed: timeElapsed,
        timestamp: Date.now(),
        debugInfo: {
          originalQuizId: quizId,
          questionsCount: quiz.questions.length,
          answersCount: Object.keys(userAnswers).length
        }
      };
      
      try {
        const jsonString = JSON.stringify(resultsPayload);
        sessionStorage.setItem('quizResultsData', jsonString);
        
        const storedData = sessionStorage.getItem('quizResultsData');
        if (!storedData) {
          throw new Error('Failed to store data in sessionStorage');
        }
        
        const verifyData = JSON.parse(storedData);
        if (!verifyData.quiz?.questions?.length) {
          throw new Error('Stored data is corrupted');
        }
        
        console.log('✅ Data successfully stored and verified in sessionStorage');
        
      } catch (storageError) {
        console.error('❌ SessionStorage error:', storageError);
        throw new Error('Failed to store quiz results: ' + storageError.message);
      }
      
      console.log('⏳ Waiting before navigation...');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('🧭 Navigating to quiz results...');
      navigate('/quiz-results', { 
        replace: true,
        state: {
          fromQuiz: true,
          timestamp: Date.now(),
          quizId: quiz.id
        }
      });
      
      console.log('✅ Navigation completed');
      
    } catch (error) {
      console.error('❌ FINISH QUIZ ERROR:', error);
      setError(`Failed to finish quiz: ${error.message}`);
      setIsFinishing(false);
    }
    
    console.log('=== FINISH QUIZ DEBUG END ===');
  };

  const exitQuiz = async () => {
    setShowExitModal(true);
  };

  const confirmExit = async () => {
    if (microbitMode) {
      await stopMicrobitMode();
    }
    navigate('/quizzes');
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const cleanOptionText = (optionText, index) => {
  const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
  
  const patterns = [
    new RegExp(`^${optionLetter}\\)\\s*`, 'i'), // "A) text"
    new RegExp(`^${optionLetter}\\.\\s*`, 'i'), // "A. text"
    new RegExp(`^${optionLetter}\\s+`, 'i'),    // "A text"
    new RegExp(`^${optionLetter}-\\s*`, 'i'),   // "A- text"
    new RegExp(`^${optionLetter}:\\s*`, 'i'),   // "A: text"
  ];
  
  let cleanText = optionText;
  
  for (const pattern of patterns) {
    if (pattern.test(cleanText)) {
      cleanText = cleanText.replace(pattern, '');
      break;
    }
  }
  
  if (cleanText.trim().toLowerCase() === optionLetter.toLowerCase()) {
    cleanText = optionText;
  }
  
  return cleanText.trim();
};

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: 'var(--background)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader size={48} className="animate-spin" style={{ marginBottom: '20px', color: 'var(--primary)' }} />
          <div style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Loading your quiz...
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Preparing questions and micro:bit integration
          </div>
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
        backgroundColor: 'var(--background)',
        padding: '20px'
      }}>
        <AlertTriangle size={64} style={{ marginBottom: '20px', color: 'var(--error)' }} />
        <div style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: '600' }}>
          Unable to Load Quiz
        </div>
        <div style={{ fontSize: '16px', marginBottom: '24px', color: 'var(--text-secondary)', textAlign: 'center' }}>
          {error}
        </div>
        <button 
          onClick={() => navigate('/quizzes')} 
          className="btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px'
          }}
        >
          <ArrowLeft size={16} />
          Back to Quizzes
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
        height: '100vh',
        backgroundColor: 'var(--background)',
        padding: '20px'
      }}>
        <BookOpen size={64} style={{ marginBottom: '20px', color: 'var(--text-secondary)' }} />
        <div style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: '600' }}>
          Empty Quiz
        </div>
        <div style={{ fontSize: '16px', marginBottom: '24px', color: 'var(--text-secondary)', textAlign: 'center' }}>
          No questions found in this quiz
        </div>
        <button 
          onClick={() => navigate('/quizzes')} 
          className="btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px'
          }}
        >
          <ArrowLeft size={16} />
          Back to Quizzes
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
      background: 'linear-gradient(135deg, var(--background) 0%, #f1f5f9 100%)'
    }}>
      {/* Header Bar */}
      <div style={{
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '16px 0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Quiz Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent)',
              color: 'white'
            }}>
              <Brain size={20} />
            </div>
            <div>
              <h1 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '20px', fontWeight: '600' }}>
                {quiz.title}
              </h1>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Interactive Quiz Session
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Timer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              backgroundColor: 'var(--background)',
              borderRadius: '8px',
              fontSize: '14px',
              color: 'var(--text-secondary)'
            }}>
              <Clock size={16} />
              {formatTime(timeElapsed)}
            </div>

            {/* Micro:bit Toggle */}
            {microbitConnected && quiz?.microbitCompatible && (
              <button 
                onClick={microbitMode ? stopMicrobitMode : startMicrobitMode}
                style={{
                  padding: '8px 16px',
                  backgroundColor: microbitMode ? 'var(--success)' : 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                {microbitMode ? (
                  <>
                    <Pause size={14} />
                    Micro:bit ON
                  </>
                ) : (
                  <>
                    <Gamepad2 size={14} />
                    Enable Micro:bit
                  </>
                )}
              </button>
            )}
            
            {/* Exit Button */}
            <button 
              onClick={exitQuiz}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: 'var(--error)',
                border: '2px solid var(--error)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--error)';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'var(--error)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <X size={14} />
              Exit
            </button>
          </div>
        </div>
      </div>

      {/* Micro:bit Instructions */}
      {microbitConnected && quiz?.microbitCompatible && (
        <div style={{
          backgroundColor: microbitMode ? 'var(--success)' : 'var(--primary)',
          color: 'white',
          padding: '12px 0',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            {microbitMode ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Activity size={16} />
                {getMicrobitInstructions()}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Gamepad2 size={16} />
                Micro:bit ready - Click "Enable Micro:bit" to use physical controls
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progress Section */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px 20px 0'
      }}>
        {/* Progress Bar */}
        <div style={{ 
          width: '100%', 
          height: '8px', 
          backgroundColor: 'var(--border)', 
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '16px'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: '4px'
          }} />
        </div>

        {/* Progress Stats */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              backgroundColor: 'var(--surface)',
              borderRadius: '16px',
              border: '1px solid var(--border)'
            }}>
              <Target size={14} style={{ color: 'var(--success)' }} />
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                {answeredCount} answered
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {microbitMode && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: 'var(--success)',
                color: 'white',
                borderRadius: '16px',
                fontSize: '13px',
                fontWeight: '500'
              }}>
                <Zap size={14} />
                Interactive Mode
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '0 20px 40px'
      }}>
        <div style={{ 
          backgroundColor: 'var(--surface)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid var(--border)',
          minHeight: '500px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
        }}>
          {/* Question Type Badge */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: 'var(--accent)',
            color: 'white',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            <Eye size={14} />
            {currentQuestionIndex + 1}/{quiz.questions.length}
          </div>

          {/* Question Text */}
          <h2 style={{ 
            fontSize: '32px', 
            marginBottom: '40px', 
            color: 'var(--text-primary)',
            lineHeight: '1.4',
            paddingRight: '120px',
            fontWeight: '600'
          }}>
            {currentQuestion.questionText}
          </h2>

          {/* Answer Options */}
          <div style={{ flex: 1, marginBottom: '40px' }}>
            {currentQuestion.options.map((option, index) => {
              const isSelected = userAnswers[currentQuestion.id] === index;
              const optionLetter = String.fromCharCode(65 + index);
              const cleanedOptionText = cleanOptionText(option, index);
              
              return (
                <div
                  key={`${currentQuestion.id}-${index}`}
                  onClick={() => !microbitMode && handleAnswer(currentQuestion.id, index)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0',
                    marginBottom: '16px',
                    borderRadius: '16px',
                    cursor: microbitMode ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: microbitMode ? 0.7 : 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    font: 'inherit',
                    color: 'inherit',
                    textAlign: 'left',
                    textDecoration: 'none',
                    boxSizing: 'border-box'
                  }}
                  onMouseEnter={(e) => {
                    if (!microbitMode) {
                      e.target.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!microbitMode) {
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <div style={{
                    width: '100%',
                    padding: '20px 24px',
                    backgroundColor: isSelected ? '#6366f1' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#1f2937',
                    border: `2px solid ${isSelected ? '#6366f1' : '#e5e7eb'}`,
                    borderRadius: '16px',
                    fontSize: '18px',
                    fontWeight: '500',
                    boxShadow: isSelected 
                      ? '0 4px 12px rgba(99, 102, 241, 0.2)' 
                      : '0 2px 4px rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'all 0.3s ease',
                    backgroundImage: 'none !important',
                    backgroundClip: 'border-box'
                  }}>
                    {/* Option letter badge */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : '#6366f1',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      flexShrink: 0,
                      border: isSelected ? '2px solid rgba(255, 255, 255, 0.3)' : 'none'
                    }}>
                      {optionLetter}
                    </div>
                    
                    {/* Option text */}
                    <span style={{ 
                      flex: 1,
                      color: isSelected ? '#ffffff' : '#1f2937',
                      fontWeight: '500',
                      lineHeight: '1.4'
                    }}>
                      {cleanedOptionText}
                    </span>
                    
                    {/* Check icon for selected */}
                    {isSelected && (
                      <CheckCircle size={24} style={{ 
                        color: '#ffffff',
                        flexShrink: 0
                      }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Navigation Controls */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            paddingTop: '24px',
            borderTop: '1px solid var(--border)'
          }}>
            {/* Previous Button */}
            <button
              onClick={goToPrevious}
              disabled={currentQuestionIndex === 0 || microbitMode}
              style={{
                padding: '16px 24px',
                backgroundColor: (currentQuestionIndex === 0 || microbitMode) ? 'var(--border)' : 'var(--secondary)',
                color: (currentQuestionIndex === 0 || microbitMode) ? 'var(--text-secondary)' : 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: (currentQuestionIndex === 0 || microbitMode) ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.2s',
                opacity: (currentQuestionIndex === 0 || microbitMode) ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (currentQuestionIndex !== 0 && !microbitMode) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(6, 182, 212, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentQuestionIndex !== 0 && !microbitMode) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              <ChevronLeft size={18} />
              Previous
            </button>

            {/* Status Indicator */}
            <div style={{ 
              textAlign: 'center',
              color: 'var(--text-secondary)', 
              fontSize: '14px'
            }}>
              {microbitMode ? (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  color: 'var(--primary)', 
                  fontWeight: '600' 
                }}>
                  <Gamepad2 size={16} />
                  Use micro:bit to navigate
                </div>
              ) : isCurrentQuestionAnswered ? (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                 gap: '8px',
                  color: 'var(--success)', 
                  fontWeight: '600' 
                }}>
                  <CheckCircle size={16} />
                  Question answered
                </div>
              ) : (
                <div>Select an answer to continue</div>
              )}
            </div>

            {/* Next/Finish Button */}
            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <button
                onClick={finishQuiz}
                disabled={!isCurrentQuestionAnswered && !microbitMode}
                style={{
                  padding: '16px 24px',
                  backgroundColor: (!isCurrentQuestionAnswered && !microbitMode) ? 'var(--border)' : 'var(--success)',
                  color: (!isCurrentQuestionAnswered && !microbitMode) ? 'var(--text-secondary)' : 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: (!isCurrentQuestionAnswered && !microbitMode) ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  opacity: (!isCurrentQuestionAnswered && !microbitMode) ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (isCurrentQuestionAnswered || microbitMode) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isCurrentQuestionAnswered || microbitMode) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                <Flag size={18} />
                Finish Quiz
              </button>
            ) : (
              <button
                onClick={goToNext}
                disabled={(!isCurrentQuestionAnswered && !microbitMode)}
                style={{
                  padding: '16px 24px',
                  backgroundColor: (!isCurrentQuestionAnswered && !microbitMode) ? 'var(--border)' : 'var(--primary)',
                  color: (!isCurrentQuestionAnswered && !microbitMode) ? 'var(--text-secondary)' : 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: (!isCurrentQuestionAnswered && !microbitMode) ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  opacity: (!isCurrentQuestionAnswered && !microbitMode) ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (isCurrentQuestionAnswered || microbitMode) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isCurrentQuestionAnswered || microbitMode) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                Next
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Custom Exit Confirmation Modal */}
      {showExitModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            backgroundColor: 'var(--surface)',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '480px',
            width: '90%',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border)',
            animation: 'slideInScale 0.3s ease-out'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '20px'
            }}>
              <div style={{
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: '#fee2e2',
                color: 'var(--error)'
              }}>
                <LogOut size={24} />
              </div>
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: '600',
                  color: 'var(--text-primary)'
                }}>
                  Exit Quiz?
                </h3>
                <p style={{
                  margin: '4px 0 0 0',
                  fontSize: '14px',
                  color: 'var(--text-secondary)'
                }}>
                  This action cannot be undone
                </p>
              </div>
            </div>

            {/* Modal Content */}
            <div style={{
              marginBottom: '28px',
              padding: '20px',
              backgroundColor: 'var(--background)',
              borderRadius: '12px',
              border: '1px solid var(--border)'
            }}>
              <p style={{
                margin: '0 0 16px 0',
                fontSize: '16px',
                color: 'var(--text-primary)',
                lineHeight: '1.5'
              }}>
                Are you sure you want to exit the quiz? Your progress will be lost.
              </p>
              
              <div style={{
                display: 'flex',
                gap: '16px',
                fontSize: '14px',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Target size={14} />
                  {answeredCount}/{quiz?.questions?.length || 0} answered
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} />
                  {formatTime(timeElapsed)} elapsed
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowExitModal(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '2px solid var(--border)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--background)';
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.color = 'var(--primary)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.color = 'var(--text-secondary)';
                }}
              >
                <RotateCcw size={14} />
                Continue Quiz
              </button>
              
              <button
                onClick={confirmExit}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--error)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#dc2626';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'var(--error)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <LogOut size={14} />
                Exit Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes slideInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideInScale {
          from {
            transform: translateY(-20px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        .animate-slide-up {
          animation: slideInUp 0.5s ease-out;
        }
        
        .animate-pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default QuizTaking;