import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  Brain,
  FileText,
  Zap
} from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Carousel images - replace these paths with your actual images
  const carouselImages = [
    '/images/preview-1.png', 
    '/images/preview-2.png', 
    '/images/preview-3.png'  
  ];

  // Trigger entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % carouselImages.length
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex + 1) % carouselImages.length
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? carouselImages.length - 1 : prevIndex - 1
    );
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div style={{
      minHeight: '100vh',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 1
      }}>
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          animation: 'float 6s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          top: '60%',
          right: '15%',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          animation: 'float 8s ease-in-out infinite reverse'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '20%',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.06)',
          animation: 'float 7s ease-in-out infinite'
        }} />
      </div>

      <div style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        zIndex: 2,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        textAlign: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header Section */}
        <div style={{
          width: '100%',
          paddingTop: '20px',
          animation: 'slideDown 0.8s ease-out 0.2s both'
        }}>
          {/* Logo */}
          <div style={{
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'logoFloat 3s ease-in-out infinite'
          }}>
            <img 
              src="/logo.png" 
              alt="MicroLearning Logo" 
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '16px',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.25)',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div style={{
              display: 'none',
              width: '80px',
              height: '80px',
              borderRadius: '16px',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 'bold',
              color: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <GraduationCap size={32} />
            </div>
          </div>
          
          <h1 style={{
            margin: '0 0 10px 0',
            fontSize: 'clamp(28px, 5vw, 36px)',
            fontWeight: '700',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: '1.2',
            textShadow: '0 2px 15px rgba(0,0,0,0.2)',
            letterSpacing: '-0.5px'
          }}>
            Micro:Learning
          </h1>
          <p style={{
            margin: 0,
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: 'clamp(14px, 2.5vw, 16px)',
            lineHeight: '1.5',
            maxWidth: '500px',
            marginLeft: 'auto',
            marginRight: 'auto',
            textShadow: '0 1px 8px rgba(0,0,0,0.15)',
            fontWeight: '400'
          }}>
            Transform your documents into interactive quizzes and enhance your learning experience with micro:bit technology
          </p>
        </div>

        {/* Main Content Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          maxWidth: '450px',
          gap: '30px'
        }}>
          {/* Action Buttons */}
          <div style={{
            animation: 'slideUp 0.8s ease-out 0.4s both'
          }}>
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: '14px 32px',
                  fontSize: '16px',
                  fontWeight: '600',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: '#667eea',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                  e.target.style.transform = 'translateY(-2px) scale(1.02)';
                  e.target.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                }}
              >
                Go to Dashboard
                <ArrowRight size={18} />
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <button
                    style={{
                      padding: '14px 28px',
                      fontSize: '16px',
                      fontWeight: '600',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: '#667eea',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      minWidth: '130px',
                      justifyContent: 'center',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                      e.target.style.transform = 'translateY(-2px) scale(1.02)';
                      e.target.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                      e.target.style.transform = 'translateY(0) scale(1)';
                      e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                    }}
                  >
                    Log In
                    <ArrowRight size={18} />
                  </button>
                </Link>
                
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <button
                    style={{
                      padding: '14px 28px',
                      fontSize: '16px',
                      fontWeight: '600',
                      backgroundColor: 'transparent',
                      color: 'rgba(255, 255, 255, 0.95)',
                      border: '2px solid rgba(255, 255, 255, 0.6)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      minWidth: '130px',
                      justifyContent: 'center',
                      backdropFilter: 'blur(10px)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                      e.target.style.transform = 'translateY(-2px) scale(1.02)';
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.8)';
                      e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.transform = 'translateY(0) scale(1)';
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    Sign Up
                    <GraduationCap size={18} />
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div style={{
            animation: 'slideUp 0.8s ease-out 0.6s both',
            width: '100%'
          }}>
            <h2 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textShadow: '0 1px 8px rgba(0,0,0,0.2)',
              letterSpacing: '0.5px'
            }}>
              <Brain size={20} style={{ color: 'rgba(255,255,255,0.9)' }} />
              PREVIEW
            </h2>

            {/* Carousel Container */}
            <div style={{
              position: 'relative',
              width: '100%',
              margin: '0 auto',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 15px 40px rgba(0, 0, 0, 0.25)',
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.25)'
            }}>
              {/* Images Container */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: '200px',
                overflow: 'hidden'
              }}>
                {carouselImages.map((imagePath, index) => (
                  <div
                    key={index}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: index === currentImageIndex ? 1 : 0,
                      transition: 'opacity 0.8s ease-in-out',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)'
                    }}
                  >
                    <img
                      src={imagePath}
                      alt={`Preview ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        // Fallback content when image fails to load
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    {/* Fallback content */}
                    <div style={{
                      display: 'none',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px',
                      color: 'rgba(255,255,255,0.85)'
                    }}>
                      {index === 0 && (
                        <>
                          <FileText size={36} />
                          <span style={{ fontSize: '13px', fontWeight: '600' }}>Interactive Quiz Interface</span>
                        </>
                      )}
                      {index === 1 && (
                        <>
                          <Zap size={36} />
                          <span style={{ fontSize: '13px', fontWeight: '600' }}>Document Upload & AI Generation</span>
                        </>
                      )}
                      {index === 2 && (
                        <>
                          <Brain size={36} />
                          <span style={{ fontSize: '13px', fontWeight: '600' }}>Micro:bit Integration</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevImage}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.2s',
                  zIndex: 10
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
                  e.target.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  e.target.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                <ChevronLeft size={16} style={{ color: 'rgba(255,255,255,0.9)' }} />
              </button>

              <button
                onClick={nextImage}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.2s',
                  zIndex: 10
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
                  e.target.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  e.target.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                <ChevronRight size={16} style={{ color: 'rgba(255,255,255,0.9)' }} />
              </button>

              {/* Dots Indicator */}
              <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '6px',
                zIndex: 10
              }}>
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    style={{
                      width: index === currentImageIndex ? '20px' : '6px',
                      height: '6px',
                      borderRadius: '3px',
                      border: 'none',
                      backgroundColor: index === currentImageIndex 
                        ? 'rgba(255,255,255,0.9)' 
                        : 'rgba(255, 255, 255, 0.4)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          paddingBottom: '15px',
          color: 'rgba(255, 255, 255, 0.75)',
          fontSize: '11px',
          animation: 'slideUp 0.8s ease-out 0.8s both',
          textShadow: '0 1px 6px rgba(0,0,0,0.2)',
          fontWeight: '400'
        }}>
          © 2025 Micro:Learning. Transforming education with interactive technology.
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(2deg); }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;