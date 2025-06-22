import React, { useState, useEffect } from 'react';
import { FolderPlus, AlertCircle, Loader, X, Sparkles, Check } from 'lucide-react';
import Modal from '../common/Modal';

const CreateCollectionModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', description: '' });
      setError('');
      setShowSuccess(false);
      setFocusedField(null);
    }
  }, [isOpen]);

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
    
    if (!formData.name.trim()) {
      setError('Collection name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await onCreate(formData);
      if (success) {
        // Show success state briefly
        setShowSuccess(true);
        
        // Reset form and close modal after success animation
        setTimeout(() => {
          setFormData({ name: '', description: '' });
          setShowSuccess(false);
          onClose();
        }, 1000);
      }
    } catch (error) {
      setError('Failed to create collection');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return; // Prevent closing during loading
    
    setFormData({ name: '', description: '' });
    setError('');
    setShowSuccess(false);
    onClose();
  };

  const getFieldBorderColor = (fieldName) => {
    if (error && fieldName === 'name' && !formData.name.trim()) return 'var(--error)';
    if (focusedField === fieldName) return 'var(--primary)';
    return 'var(--border)';
  };

  if (showSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={() => {}} title="">
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'successPulse 0.6s ease-out'
          }}>
            <Check size={40} style={{ color: 'white' }} />
          </div>
          
          <div>
            <h2 style={{ 
              margin: '0 0 8px 0',
              color: 'var(--success)',
              fontSize: '24px',
              fontWeight: '600'
            }}>
              Collection Created!
            </h2>
            <p style={{ 
              margin: 0,
              color: 'var(--text-secondary)',
              fontSize: '16px'
            }}>
              "{formData.name}" has been successfully created
            </p>
          </div>
        </div>
        
        <style jsx>{`
          @keyframes successPulse {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </Modal>
    );
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title=""
      maxWidth="520px"
    >
      <div style={{ position: 'relative' }}>
        {/* Custom Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '32px',
          paddingBottom: '24px',
          borderBottom: '2px solid var(--border)'
        }}>
          <div style={{
            padding: '16px',
            borderRadius: '16px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FolderPlus size={28} />
          </div>
          
          <div style={{ flex: 1 }}>
            <h2 style={{ 
              margin: '0 0 4px 0',
              fontSize: '24px',
              fontWeight: '700',
              color: 'var(--text-primary)'
            }}>
              Create New Collection
            </h2>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: '1.4'
            }}>
              Organize your documents into themed collections
            </p>
          </div>
        </div>

        {/* Error Alert */}
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
            animation: 'slideInError 0.3s ease-out'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Collection Name Field */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '10px', 
              fontWeight: '600',
              color: 'var(--text-primary)',
              fontSize: '15px'
            }}>
              Collection Name *
            </label>
            
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                placeholder="e.g., Math Studies, History Notes, Science Papers"
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: `2px solid ${getFieldBorderColor('name')}`,
                  borderRadius: '12px',
                  fontSize: '16px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  backgroundColor: loading ? 'var(--background)' : 'white',
                  opacity: loading ? 0.7 : 1,
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              
              {/* Floating label effect */}
              {formData.name && (
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  left: '12px',
                  backgroundColor: 'var(--surface)',
                  padding: '0 8px',
                  fontSize: '12px',
                  color: 'var(--primary)',
                  fontWeight: '500',
                  animation: 'floatUp 0.3s ease-out'
                }}>
                  Collection Name
                </div>
              )}
            </div>
          </div>

          {/* Description Field */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '10px', 
              fontWeight: '600',
              color: 'var(--text-primary)',
              fontSize: '15px'
            }}>
              Description (Optional)
            </label>
            
            <div style={{ position: 'relative' }}>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                onFocus={() => setFocusedField('description')}
                onBlur={() => setFocusedField(null)}
                placeholder="Brief description of what this collection contains..."
                rows="3"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: `2px solid ${getFieldBorderColor('description')}`,
                  borderRadius: '12px',
                  fontSize: '16px',
                  resize: 'vertical',
                  minHeight: '90px',
                  maxHeight: '150px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  backgroundColor: loading ? 'var(--background)' : 'white',
                  opacity: loading ? 0.7 : 1,
                  outline: 'none',
                  fontFamily: 'inherit',
                  lineHeight: '1.5'
                }}
              />
              
              {/* Character counter */}
              <div style={{
                position: 'absolute',
                bottom: '8px',
                right: '12px',
                fontSize: '11px',
                color: 'var(--text-secondary)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                {formData.description.length}/200
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'flex-end',
            paddingTop: '24px',
            borderTop: '1px solid var(--border)'
          }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              style={{
                padding: '14px 24px',
                border: '2px solid var(--border)',
                borderRadius: '12px',
                backgroundColor: 'transparent',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                color: 'var(--text-primary)',
                opacity: loading ? 0.5 : 1,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = 'var(--background)';
                  e.target.style.borderColor = 'var(--text-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = 'var(--border)';
                }
              }}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              style={{ 
                padding: '14px 28px',
                fontSize: '16px',
                fontWeight: '600',
                backgroundColor: (loading || !formData.name.trim()) ? 'var(--border)' : 'var(--primary)',
                color: (loading || !formData.name.trim()) ? 'var(--text-secondary)' : 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: (loading || !formData.name.trim()) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!loading && formData.name.trim()) {
                  e.target.style.backgroundColor = 'var(--primary-dark)';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && formData.name.trim()) {
                  e.target.style.backgroundColor = 'var(--primary)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              {loading ? (
                <>
                  <Loader size={18} className="spinner" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Create Collection
                </>
              )}
            </button>
          </div>
        </form>

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes slideInError {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes floatUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
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
    </Modal>
  );
};

export default CreateCollectionModal;