import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, Mail, Loader, AlertCircle, ArrowRight, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false
  });
  const [isVisible, setIsVisible] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Trigger entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Update password criteria if password field
    if (name === 'password') {
      checkPasswordCriteria(value);
    }
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const checkPasswordCriteria = (password) => {
    setPasswordCriteria({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!Object.values(passwordCriteria).every(Boolean)) {
      setError('Please meet all password requirements');
      setLoading(false);
      return;
    }

    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password
    });
    
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

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const getFieldBorderColor = (fieldName) => {
    if (error) return 'var(--error)';
    if (focusedField === fieldName) return 'var(--primary)';
    return 'var(--border)';
  };

  const isFormValid = () => {
    return formData.username && 
           formData.email && 
           formData.password && 
           formData.confirmPassword &&
           formData.password === formData.confirmPassword &&
           Object.values(passwordCriteria).every(Boolean);
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
          padding: '32px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          {/* Logo and Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '32px',
            animation: 'slideDown 0.8s ease-out 0.2s both'
          }}>
            {/* Logo */}
            <div style={{
              width: '60px',
              height: '60px',
              margin: '0 auto 16px',
              borderRadius: '16px',
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
                  width: '50px',
                  height: '50px',
                  borderRadius: '10px'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div style={{
                display: 'none',
                fontSize: '28px',
                fontWeight: 'bold',
                color: 'white'
              }}>
                ML
              </div>
            </div>
            
            <h1 style={{
              margin: '0 0 6px 0',
              fontSize: '28px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Join Micro:Learning
            </h1>
            <p style={{
              margin: 0,
              color: 'var(--text-secondary)',
              fontSize: '14px'
            }}>
              Create your account to start learning
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
              marginBottom: '16px',
              animation: 'slideUp 0.8s ease-out 0.3s both'
            }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--text-primary)'
              }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: focusedField === 'username' ? 'var(--primary)' : 'var(--text-secondary)',
                  transition: 'color 0.3s ease',
                  zIndex: 1
                }}>
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  required
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 46px',
                    border: `2px solid ${getFieldBorderColor('username')}`,
                    borderRadius: '10px',
                    fontSize: '15px',
                    backgroundColor: loading ? 'var(--background)' : 'white',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    outline: 'none',
                    opacity: loading ? 0.7 : 1
                  }}
                />
              </div>
            </div>

            {/* Email Field */}
            <div style={{ 
              marginBottom: '16px',
              animation: 'slideUp 0.8s ease-out 0.4s both'
            }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--text-primary)'
              }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: focusedField === 'email' ? 'var(--primary)' : 'var(--text-secondary)',
                  transition: 'color 0.3s ease',
                  zIndex: 1
                }}>
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 46px',
                    border: `2px solid ${getFieldBorderColor('email')}`,
                    borderRadius: '10px',
                    fontSize: '15px',
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
              marginBottom: '16px',
              animation: 'slideUp 0.8s ease-out 0.5s both'
            }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--text-primary)'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: focusedField === 'password' ? 'var(--primary)' : 'var(--text-secondary)',
                  transition: 'color 0.3s ease',
                  zIndex: 1
                }}>
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '14px 46px 14px 46px',
                    border: `2px solid ${getFieldBorderColor('password')}`,
                    borderRadius: '10px',
                    fontSize: '15px',
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
                    right: '14px',
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
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Password Criteria */}
              {formData.password && (
                <div style={{
                  marginTop: '8px',
                  padding: '10px',
                  backgroundColor: 'var(--background)',
                  borderRadius: '8px',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: passwordCriteria.length ? 'var(--success)' : 'var(--text-secondary)' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: passwordCriteria.length ? 'var(--success)' : 'var(--border)' }} />
                      8+ chars
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: passwordCriteria.uppercase ? 'var(--success)' : 'var(--text-secondary)' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: passwordCriteria.uppercase ? 'var(--success)' : 'var(--border)' }} />
                      Uppercase
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: passwordCriteria.lowercase ? 'var(--success)' : 'var(--text-secondary)' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: passwordCriteria.lowercase ? 'var(--success)' : 'var(--border)' }} />
                      Lowercase
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: passwordCriteria.number ? 'var(--success)' : 'var(--text-secondary)' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: passwordCriteria.number ? 'var(--success)' : 'var(--border)' }} />
                      Number
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: passwordCriteria.symbol ? 'var(--success)' : 'var(--text-secondary)', gridColumn: 'span 2' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: passwordCriteria.symbol ? 'var(--success)' : 'var(--border)' }} />
                      Special symbol (!@#$%^&*)
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div style={{ 
              marginBottom: '24px',
              animation: 'slideUp 0.8s ease-out 0.6s both'
            }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--text-primary)'
              }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: focusedField === 'confirmPassword' ? 'var(--primary)' : 'var(--text-secondary)',
                  transition: 'color 0.3s ease',
                  zIndex: 1
                }}>
                  <Lock size={18} />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  required
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '14px 46px 14px 46px',
                    border: `2px solid ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword 
                        ? 'var(--error)' 
                        : formData.confirmPassword && formData.password === formData.confirmPassword
                        ? 'var(--success)'
                        : getFieldBorderColor('confirmPassword')
                    }`,
                    borderRadius: '10px',
                    fontSize: '15px',
                    backgroundColor: loading ? 'var(--background)' : 'white',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    outline: 'none',
                    opacity: loading ? 0.7 : 1
                  }}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  disabled={loading}
                  style={{
                    position: 'absolute',
                    right: '14px',
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
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={12} />
                  Passwords do not match
                </div>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--success)' }}>
                  ✓ Passwords match
                </div>
              )}
            </div>

            {/* Register Button */}
            <button 
              type="submit" 
              disabled={loading || !isFormValid()}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '600',
                backgroundColor: (loading || !isFormValid()) 
                  ? 'var(--border)' : 'var(--primary)',
                color: (loading || !isFormValid()) 
                  ? 'var(--text-secondary)' : 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: (loading || !isFormValid()) 
                  ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                position: 'relative',
                overflow: 'hidden',
                animation: 'slideUp 0.8s ease-out 0.7s both'
              }}
              onMouseEnter={(e) => {
                if (!loading && isFormValid()) {
                  e.target.style.backgroundColor = 'var(--primary-dark)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 40px rgba(99, 102, 241, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && isFormValid()) {
                  e.target.style.backgroundColor = 'var(--primary)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              {loading ? (
                <>
                  <Loader size={20} className="spinner" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '24px',
            animation: 'slideUp 0.8s ease-out 0.8s both'
          }}>
            <p style={{ 
              margin: '0 0 6px 0',
              color: 'var(--text-secondary)',
              fontSize: '13px'
            }}>
              Already have an account?
            </p>
            <Link 
              to="/login"
              style={{
                color: 'var(--primary)',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '15px',
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
              Sign In
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '16px',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '12px',
          animation: 'slideUp 0.8s ease-out 0.9s both'
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

export default RegisterForm;