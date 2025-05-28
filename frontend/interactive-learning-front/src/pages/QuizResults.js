import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

const QuizResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state) {
      const { quiz: quizData, userAnswers } = location.state;
      setQuiz(quizData);
      calculateResults(quizData, userAnswers);
    } else {
      navigate('/documents');
    }
  }, [location.state, navigate]);

  const calculateResults = (quizData, userAnswers) => {
    let correctAnswers = 0;
    const questionResults = [];

    quizData.questions.forEach((question) => {
      const userAnswer = userAnswers[question.id];
      const isCorrect = userAnswer === question.correctOptionIndex;
      
      if (isCorrect) {
        correctAnswers++;
      }

      questionResults.push({
        question: question.questionText,
        userAnswer: userAnswer !== undefined ? question.options[userAnswer] : 'Not answered',
        correctAnswer: question.options[question.correctOptionIndex],
        isCorrect: isCorrect,
        explanation: question.explanation
      });
    });

    const score = Math.round((correctAnswers / quizData.questions.length) * 100);
    
    setResults({
      score: score,
      correctAnswers: correctAnswers,
      totalQuestions: quizData.questions.length,
      questionResults: questionResults
    });
    
    setLoading(false);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--error)';
  };

  const getScoreEmoji = (score) => {
    if (score >= 90) return '🏆';
    if (score >= 80) return '🎉';
    if (score >= 70) return '👏';
    if (score >= 60) return '👍';
    return '💪';
  };

  const retakeQuiz = () => {
    navigate(`/quiz/${quiz.id}`);
  };

  const goToDocuments = () => {
    navigate('/documents');
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
        Calculating results...
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--background)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>
            Quiz Results
          </h1>
          <h2 style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>
            {quiz?.title}
          </h2>
        </div>

        {/* Score Card */}
        <div style={{
          backgroundColor: 'var(--surface)',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          marginBottom: '30px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid var(--border)'
        }}>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>
            {getScoreEmoji(results.score)}
          </div>
          <div style={{ 
            fontSize: '48px', 
            fontWeight: 'bold', 
            color: getScoreColor(results.score),
            marginBottom: '10px'
          }}>
            {results.score}%
          </div>
          <div style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            You got {results.correctAnswers} out of {results.totalQuestions} questions correct
          </div>
          
          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
            <button
              onClick={retakeQuiz}
              className="btn-primary"
              style={{ padding: '12px 24px', fontSize: '16px' }}
            >
              🔄 Retake Quiz
            </button>
            <button
              onClick={goToDocuments}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: 'var(--secondary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              📚 Back to Documents
            </button>
          </div>
        </div>

        {/* Detailed Results */}
        <div style={{
          backgroundColor: 'var(--surface)',
          borderRadius: '16px',
          padding: '30px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: '1px solid var(--border)'
        }}>
          <h3 style={{ marginBottom: '25px', color: 'var(--text-primary)' }}>
            📊 Detailed Results
          </h3>

          {results.questionResults.map((result, index) => (
            <div key={index} style={{
              marginBottom: '25px',
              padding: '20px',
              backgroundColor: 'var(--background)',
              borderRadius: '12px',
              borderLeft: `4px solid ${result.isCorrect ? 'var(--success)' : 'var(--error)'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ 
                  fontSize: '20px', 
                  marginRight: '10px'
                }}>
                  {result.isCorrect ? '✅' : '❌'}
                </span>
                <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>
                  Question {index + 1}
                </h4>
              </div>
              
              <p style={{ marginBottom: '12px', fontSize: '16px', lineHeight: '1.5' }}>
                {result.question}
              </p>
              
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: result.isCorrect ? 'var(--success)' : 'var(--error)' }}>
                  Your Answer: 
                </strong>
                <span style={{ marginLeft: '8px' }}>{result.userAnswer}</span>
              </div>
              
              {!result.isCorrect && (
                <div style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--success)' }}>
                    Correct Answer: 
                  </strong>
                  <span style={{ marginLeft: '8px' }}>{result.correctAnswer}</span>
                </div>
              )}
              
              {result.explanation && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}>
                  <strong>💡 Explanation:</strong> {result.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizResults;