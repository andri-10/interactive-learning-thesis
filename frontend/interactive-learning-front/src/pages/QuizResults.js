import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Star, 
  ThumbsUp, 
  Target, 
  Zap, 
  RotateCcw, 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  BarChart3, 
  Award, 
  TrendingUp, 
  Clock, 
  User,
  Share2,
  Download,
  ArrowLeft,
  PartyPopper,
  AlertTriangle
} from 'lucide-react';
import Navigation from '../components/common/Navigation';
import api from '../services/api';

const QuizResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [scoreAnimated, setScoreAnimated] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
  console.log('=== QUIZ RESULTS USEEFFECT START ===');
  
  if (results !== null) {
    console.log('Results already exist, skipping...');
    return;
  }
  
  const savedQuizData = sessionStorage.getItem('quizResultsData');
  console.log('SessionStorage data:', savedQuizData ? 'Found' : 'Not found');
  
  if (savedQuizData) {
    try {
      const parsedData = JSON.parse(savedQuizData);
      console.log('Parsed sessionStorage data:', parsedData);
      
      if (parsedData.quiz && 
          parsedData.quiz.questions && 
          Array.isArray(parsedData.quiz.questions) && 
          parsedData.quiz.questions.length > 0 && 
          parsedData.userAnswers && 
          typeof parsedData.userAnswers === 'object') {
        
        console.log('✅ SessionStorage data is valid');
        setQuiz(parsedData.quiz);
        setTimeElapsed(parsedData.timeElapsed || 0);
        calculateResults(parsedData.quiz, parsedData.userAnswers);
        
        setTimeout(() => {
          sessionStorage.removeItem('quizResultsData');
          console.log('🗑️ Removed sessionStorage data');
        }, 5000);
        
        return;
      } else {
        console.log('❌ SessionStorage data is invalid');
      }
    } catch (error) {
      console.error('Error parsing sessionStorage data:', error);
    }
  }

  console.log('Trying location.state...');
  if (location.state && location.state.quiz && location.state.userAnswers) {
    const { quiz: quizData, userAnswers, timeElapsed: elapsed } = location.state;
    console.log('Location.state data found');
    
    if (quizData.questions && Array.isArray(quizData.questions) && quizData.questions.length > 0) {
      console.log('✅ Location.state data is valid');
      setQuiz(quizData);
      setTimeElapsed(elapsed || 0);
      calculateResults(quizData, userAnswers);
      return;
    }
  }
  
  console.log('❌ No valid quiz data found');
  setError('No quiz results data found. Please retake the quiz.');
  setLoading(false);
  
  console.log('Current pathname:', window.location.pathname);
  if (window.location.pathname === '/quiz-results') {
    console.log('Setting up redirect timer...');
    const redirectTimer = setTimeout(() => {
      console.log('🧭 Redirecting to quizzes...');
      navigate('/quizzes', { replace: true });
    }, 5000);
    
    return () => {
      console.log('Clearing redirect timer');
      clearTimeout(redirectTimer);
    };
  }
  
  console.log('=== QUIZ RESULTS USEEFFECT END ===');
}, [location.state, navigate, results]);

  useEffect(() => {
    if (results && results.score >= 80) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
    
    setTimeout(() => setScoreAnimated(true), 500);
  }, [results]);

  const calculateResults = (quizData, userAnswers) => {
    try {
      if (!quizData?.questions || !Array.isArray(quizData.questions)) {
        throw new Error('Invalid quiz data structure');
      }

      let correctAnswers = 0;
      const questionResults = [];

      quizData.questions.forEach((question, index) => {
        const userAnswer = userAnswers[question.id];
        const isCorrect = userAnswer !== undefined && userAnswer === question.correctOptionIndex;
        
        if (isCorrect) {
          correctAnswers++;
        }

        questionResults.push({
          question: question.questionText,
          userAnswer: userAnswer !== undefined ? question.options[userAnswer] : 'Not answered',
          correctAnswer: question.options[question.correctOptionIndex],
          isCorrect: isCorrect,
          explanation: question.explanation || 'No explanation provided'
        });
      });

      const score = Math.round((correctAnswers / quizData.questions.length) * 100);
      
      const calculatedResults = {
        score: score,
        correctAnswers: correctAnswers,
        totalQuestions: quizData.questions.length,
        questionResults: questionResults
      };
      
      setResults(calculatedResults);
      setLoading(false);
      
    } catch (error) {
      console.error('Error calculating results:', error);
      setError('Error calculating quiz results');
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'var(--success)';
    if (score >= 80) return '#10b981';
    if (score >= 70) return '#f59e0b';
    if (score >= 60) return '#f97316';
    return 'var(--error)';
  };

  const getScoreIcon = (score) => {
    if (score >= 90) return Trophy;
    if (score >= 80) return Award;
    if (score >= 70) return Star;
    if (score >= 60) return ThumbsUp;
    return Target;
  };

  const getPerformanceMessage = (score) => {
    if (score >= 90) return "Outstanding! You've mastered this material!";
    if (score >= 80) return "Excellent work! You have a solid understanding!";
    if (score >= 70) return "Good job! You're on the right track!";
    if (score >= 60) return "Not bad! Some review will help you improve!";
    return "Keep practicing! You'll get there with more study!";
  };

  const retakeQuiz = () => {
    if (quiz?.id) {
      navigate(`/quiz/${quiz.id}`);
    } else {
      navigate('/quizzes');
    }
  };

  const goToQuizzes = () => {
    navigate('/quizzes');
  };

  const goToDocuments = () => {
    navigate('/documents');
  };

  const shareResults = async () => {
    const shareData = {
      title: `Quiz Results: ${quiz?.title || 'Quiz'}`,
      text: `I scored ${results?.score || 0}% on the "${quiz?.title || 'Quiz'}" quiz!`,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${shareData.text}\n\nTime taken: ${formatTime(timeElapsed)}\nCorrect answers: ${results?.correctAnswers}/${results?.totalQuestions}`
        );
        alert('Results copied to clipboard!');
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(`I scored ${results?.score || 0}% on "${quiz?.title || 'Quiz'}"!`);
        alert('Results copied to clipboard!');
      } catch (clipboardError) {
        console.error('Clipboard access failed:', clipboardError);
      }
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
        <Navigation />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 'calc(100vh - 64px)',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid var(--border)',
            borderTop: '4px solid var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <div style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>
            Calculating your results...
          </div>
        </div>
      </div>
    );
  }

  if (error || !results || !quiz) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
        <Navigation />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 'calc(100vh - 64px)',
          flexDirection: 'column',
          gap: '20px',
          textAlign: 'center',
          padding: '20px'
        }}>
          <AlertTriangle size={64} style={{ color: 'var(--error)' }} />
          <div style={{ fontSize: '24px', color: 'var(--text-primary)', fontWeight: '600' }}>
            Unable to Load Results
          </div>
          <div style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '400px' }}>
            {error || 'There was an issue loading your quiz results. This may happen if you navigated here directly or your session expired.'}
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button 
              onClick={goToQuizzes}
              style={{
                padding: '12px 24px',
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ArrowLeft size={16} />
              Back to Quizzes
            </button>
            <button 
              onClick={goToDocuments}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                border: '2px solid var(--border)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <BookOpen size={16} />
              Documents
            </button>
          </div>
        </div>
      </div>
    );
  }

  const ScoreIcon = getScoreIcon(results.score);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <Navigation />
      
      {showCelebration && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '100px',
            animation: 'bounce 1s ease-in-out infinite'
          }}>
            <PartyPopper size={100} style={{ color: 'var(--success)' }} />
          </div>
        </div>
      )}

      <div style={{ 
        maxWidth: '900px', 
        margin: '0 auto',
        padding: '30px 20px',
        paddingBottom: '40px'
      }}>
        <button
          onClick={goToQuizzes}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: 'transparent',
            border: '2px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '30px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'var(--background)';
            e.target.style.borderColor = 'var(--primary)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.borderColor = 'var(--border)';
          }}
        >
          <ArrowLeft size={16} />
          Back to Quizzes
        </button>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ 
            color: 'var(--text-primary)', 
            marginBottom: '12px',
            fontSize: '36px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Quiz Results
          </h1>
          <h2 style={{ 
            color: 'var(--text-secondary)', 
            fontWeight: '500',
            fontSize: '20px',
            margin: 0
          }}>
            {quiz?.title || 'Quiz Complete'}
          </h2>
        </div>

        <div style={{
          backgroundColor: 'var(--surface)',
          borderRadius: '24px',
          padding: '50px 40px',
          textAlign: 'center',
          marginBottom: '40px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
          border: '1px solid var(--border)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.03,
            backgroundImage: `radial-gradient(circle at 25% 25%, var(--primary) 2px, transparent 2px),
                             radial-gradient(circle at 75% 75%, var(--secondary) 2px, transparent 2px)`,
            backgroundSize: '50px 50px'
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ 
              marginBottom: '30px',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <div style={{
                padding: '20px',
                borderRadius: '50%',
                backgroundColor: getScoreColor(results.score),
                color: 'white',
                transform: scoreAnimated ? 'scale(1)' : 'scale(0)',
                transition: 'transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
              }}>
                <ScoreIcon size={48} />
              </div>
            </div>

            <div style={{ 
              fontSize: '64px', 
              fontWeight: 'bold', 
              color: getScoreColor(results.score),
              marginBottom: '16px',
              transform: scoreAnimated ? 'translateY(0)' : 'translateY(20px)',
              opacity: scoreAnimated ? 1 : 0,
              transition: 'all 0.6s ease-out 0.2s'
            }}>
              {results.score}%
            </div>

            <div style={{ 
              fontSize: '20px', 
              color: 'var(--text-primary)', 
              marginBottom: '12px',
              fontWeight: '600'
            }}>
              {getPerformanceMessage(results.score)}
            </div>

            <div style={{ 
              fontSize: '16px', 
              color: 'var(--text-secondary)', 
              marginBottom: '40px'
            }}>
              You answered {results.correctAnswers} out of {results.totalQuestions} questions correctly
              {timeElapsed > 0 && (
                <div style={{ marginTop: '8px' }}>
                  Time taken: {formatTime(timeElapsed)}
                </div>
              )}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '20px',
              marginBottom: '40px'
            }}>
              <div style={{
                padding: '16px',
                backgroundColor: 'var(--background)',
                borderRadius: '12px',
                border: '1px solid var(--border)'
              }}>
                <CheckCircle size={24} style={{ color: 'var(--success)', marginBottom: '8px' }} />
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {results.correctAnswers}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Correct
                </div>
              </div>
              
              <div style={{
                padding: '16px',
                backgroundColor: 'var(--background)',
                borderRadius: '12px',
                border: '1px solid var(--border)'
              }}>
                <XCircle size={24} style={{ color: 'var(--error)', marginBottom: '8px' }} />
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {results.totalQuestions - results.correctAnswers}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Incorrect
                </div>
              </div>
              
              <div style={{
                padding: '16px',
                backgroundColor: 'var(--background)',
                borderRadius: '12px',
                border: '1px solid var(--border)'
              }}>
                <BarChart3 size={24} style={{ color: 'var(--primary)', marginBottom: '8px' }} />
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {Math.round((results.correctAnswers / results.totalQuestions) * 100)}%
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Accuracy
                </div>
              </div>

              {timeElapsed > 0 && (
                <div style={{
                  padding: '16px',
                  backgroundColor: 'var(--background)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)'
                }}>
                  <Clock size={24} style={{ color: 'var(--secondary)', marginBottom: '8px' }} />
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    {formatTime(timeElapsed)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Duration
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={retakeQuiz}
                className="btn-primary"
                style={{ 
                  padding: '14px 28px', 
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <RotateCcw size={18} />
                Retake Quiz
              </button>
              
              <button
                onClick={shareResults}
                style={{
                  padding: '14px 28px',
                  fontSize: '16px',
                  backgroundColor: 'var(--secondary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#0891b2';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(6, 182, 212, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'var(--secondary)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <Share2 size={18} />
                Share Results
              </button>
              
              <button
                onClick={goToDocuments}
                style={{
                  padding: '14px 28px',
                  fontSize: '16px',
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  border: '2px solid var(--border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--background)';
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <BookOpen size={18} />
                Back to Documents
              </button>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--surface)',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid var(--border)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '30px',
            paddingBottom: '20px',
            borderBottom: '2px solid var(--border)'
          }}>
            <div style={{
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary)',
              color: 'white'
            }}>
              <BarChart3 size={24} />
            </div>
            <h3 style={{ 
              margin: 0, 
              color: 'var(--text-primary)',
              fontSize: '24px',
              fontWeight: '600'
            }}>
              Detailed Analysis
            </h3>
          </div>

          {results.questionResults.map((result, index) => (
            <div key={index} style={{
              marginBottom: '24px',
              padding: '24px',
              backgroundColor: 'var(--background)',
              borderRadius: '16px',
              border: `1px solid ${result.isCorrect ? 'var(--success)' : 'var(--error)'}`,
              borderLeft: `4px solid ${result.isCorrect ? 'var(--success)' : 'var(--error)'}`,
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                marginBottom: '16px' 
              }}>
                <div style={{
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: result.isCorrect ? 'var(--success)' : 'var(--error)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {result.isCorrect ? <CheckCircle size={16} /> : <XCircle size={16} />}
                </div>
                <h4 style={{ 
                  margin: 0, 
                  color: 'var(--text-primary)',
                  fontSize: '18px',
                  fontWeight: '600'
                }}>
                  Question {index + 1}
                </h4>
                <div style={{
                  marginLeft: 'auto',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  backgroundColor: result.isCorrect ? 'var(--success)' : 'var(--error)',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {result.isCorrect ? 'Correct' : 'Incorrect'}
                </div>
              </div>
              
              <p style={{ 
                marginBottom: '16px', 
                fontSize: '16px', 
                lineHeight: '1.6',
                color: 'var(--text-primary)',
                fontWeight: '500'
              }}>
                {result.question}
              </p>
              
              <div style={{ 
                display: 'grid',
                gap: '12px',
                marginBottom: result.explanation && result.explanation !== 'No explanation provided' ? '16px' : '0'
              }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: result.isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${result.isCorrect ? 'var(--success)' : 'var(--error)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <User size={16} style={{ color: result.isCorrect ? 'var(--success)' : 'var(--error)' }} />
                  <strong style={{ color: result.isCorrect ? 'var(--success)' : 'var(--error)' }}>
                    Your Answer:
                  </strong>
                  <span style={{ color: 'var(--text-primary)' }}>{result.userAnswer}</span>
                </div>
                
                {!result.isCorrect && (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid var(--success)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Target size={16} style={{ color: 'var(--success)' }} />
                    <strong style={{ color: 'var(--success)' }}>
                      Correct Answer:
                    </strong>
                    <span style={{ color: 'var(--text-primary)' }}>{result.correctAnswer}</span>
                  </div>
                )}
              </div>
              
              {result.explanation && result.explanation !== 'No explanation provided' && (
                <div style={{
                  padding: '16px',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <div>
                    <strong>Explanation:</strong> {result.explanation}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0,-8px,0);
          }
          70% {
            transform: translate3d(0,-4px,0);
          }
          90% {
            transform: translate3d(0,-2px,0);
          }
        }
      `}</style>
    </div>
  );
};

export default QuizResults;