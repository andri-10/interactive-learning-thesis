import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, Loader, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Trigger entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.username, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getFieldBorderColor = (fieldName) => {
    if (error) return 'var(--error)';
    if (focusedField === fieldName) return 'var(--primary)';
    return 'var(--border)';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
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
          background: 'rgba(255, 255, 255, 0.1)',
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
          background: 'rgba(255, 255, 255, 0.08)',
          animation: 'float 7s ease-in-out infinite'
        }} />
      </div>

      <div style={{
        maxWidth: '420px',
        width: '100%',
        position: 'relative',
        zIndex: 2,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        {/* Main Card */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {/* Logo and Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '40px',
            animation: 'slideDown 0.8s ease-out 0.2s both'
          }}>
            {/* Logo */}
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 20px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
              animation: 'logoFloat 3s ease-in-out infinite'
            }}>
              <img 
                src="/logo.png" 
                alt="MicroLearning Logo" 
                style={{
                  width: '65px',
                  height: '65px',
                  borderRadius: '12px'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div style={{
                display: 'none',
                fontSize: '32px',
                fontWeight: 'bold',
                color: 'white'
              }}>
                ML
              </div>
            </div>
            
            <h1 style={{
              margin: '0 0 8px 0',
              fontSize: '32px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Welcome Back
            </h1>
            <p style={{
              margin: 0,
              color: 'var(--text-secondary)',
              fontSize: '16px'
            }}>
              Sign in to continue your learning journey
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'var(--error)',
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              fontSize: '14px',
              animation: 'shakeError 0.5s ease-out'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Username Field */}
            <div style={{ 
              marginBottom: '20px',
              animation: 'slideUp 0.8s ease-out 0.4s both'
            }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--text-primary)'
              }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: focusedField === 'username' ? 'var(--primary)' : 'var(--text-secondary)',
                  transition: 'color 0.3s ease',
                  zIndex: 1
                }}>
                  <User size={20} />
                </div>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  required
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '16px 16px 16px 50px',
                    border: `2px solid ${getFieldBorderColor('username')}`,
                    borderRadius: '12px',
                    fontSize: '16px',
                    backgroundColor: loading ? 'var(--background)' : 'white',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    outline: 'none',
                    opacity: loading ? 0.7 : 1
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ 
              marginBottom: '32px',
              animation: 'slideUp 0.8s ease-out 0.5s both'
            }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--text-primary)'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: focusedField === 'password' ? 'var(--primary)' : 'var(--text-secondary)',
                  transition: 'color 0.3s ease',
                  zIndex: 1
                }}>
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '16px 50px 16px 50px',
                    border: `2px solid ${getFieldBorderColor('password')}`,
                    borderRadius: '12px',
                    fontSize: '16px',
                    backgroundColor: loading ? 'var(--background)' : 'white',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    outline: 'none',
                    opacity: loading ? 0.7 : 1
                  }}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  disabled={loading}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    color: 'var(--text-secondary)',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'all 0.2s',
                    opacity: loading ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.color = 'var(--primary)';
                      e.target.style.backgroundColor = 'var(--background)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.target.style.color = 'var(--text-secondary)';
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button 
              type="submit" 
              disabled={loading || !formData.username || !formData.password}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '600',
                backgroundColor: (loading || !formData.username || !formData.password) 
                  ? 'var(--border)' : 'var(--primary)',
                color: (loading || !formData.username || !formData.password) 
                  ? 'var(--text-secondary)' : 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: (loading || !formData.username || !formData.password) 
                  ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                position: 'relative',
                overflow: 'hidden',
                animation: 'slideUp 0.8s ease-out 0.6s both'
              }}
              onMouseEnter={(e) => {
                if (!loading && formData.username && formData.password) {
                  e.target.style.backgroundColor = 'var(--primary-dark)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 40px rgba(99, 102, 241, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && formData.username && formData.password) {
                  e.target.style.backgroundColor = 'var(--primary)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              {loading ? (
                <>
                  <Loader size={20} className="spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '32px',
            animation: 'slideUp 0.8s ease-out 0.7s both'
          }}>
            <p style={{ 
              margin: '0 0 8px 0',
              color: 'var(--text-secondary)',
              fontSize: '14px'
            }}>
              Don't have an account?
            </p>
            <Link 
              to="/register"
              style={{
                color: 'var(--primary)',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '16px',
                transition: 'all 0.2s',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = 'var(--primary-dark)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'var(--primary)';
              }}
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '14px',
          animation: 'slideUp 0.8s ease-out 0.8s both'
        }}>
          © 2025 Micro:Learning. Transforming education with technology.
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
          50% { transform: translateY(-5px) rotate(2deg); }
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
        
        @keyframes shakeError {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .spinner {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoginForm;