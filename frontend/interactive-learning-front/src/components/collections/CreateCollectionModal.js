import React, { useState } from 'react';
import Modal from '../common/Modal';

const CreateCollectionModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        // Reset form and close modal
        setFormData({ name: '', description: '' });
        onClose();
      }
    } catch (error) {
      setError('Failed to create collection');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '' });
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="📁 Create New Collection">
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ 
            color: 'var(--error)', 
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: '#fee',
            borderRadius: '6px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600',
            color: 'var(--text-primary)'
          }}>
            Collection Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Math Studies, History Notes, Science Papers"
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid var(--border)',
              borderRadius: '8px',
              fontSize: '16px',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600',
            color: 'var(--text-primary)'
          }}>
            Description (Optional)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief description of what this collection contains..."
            rows="3"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid var(--border)',
              borderRadius: '8px',
              fontSize: '16px',
              resize: 'vertical',
              minHeight: '80px',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

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
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.name.trim()}
            className="btn-primary"
            style={{ 
              padding: '12px 24px',
              fontSize: '16px',
              opacity: (loading || !formData.name.trim()) ? 0.6 : 1,
              cursor: (loading || !formData.name.trim()) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '📁 Creating...' : '✨ Create Collection'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateCollectionModal;