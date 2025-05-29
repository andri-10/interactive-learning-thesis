import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import CreateCollectionModal from '../components/collections/CreateCollectionModal';
import Toast from '../components/common/Toast';

const Collections = () => {
  const { user, logout } = useAuth();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // FIXED: Only fetch once on mount - removed refreshTrigger dependency
  useEffect(() => {
    console.log('Collections component mounted - fetching once');
    fetchCollections();
  }, []); // Empty dependency array - only runs once!

  const fetchCollections = async () => {
    try {
      setLoading(true);
      console.log('Fetching collections...');
      const response = await api.get('/collections');
      console.log('Collections received:', response.data?.length || 0, 'collections');
      setCollections(response.data || []); // Ensure it's always an array
      setError('');
    } catch (error) {
      console.error('Error fetching collections:', error);
      setError('Failed to load collections');
      setCollections([]); // Ensure it's an array even on error
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    // Auto-hide toast after 3 seconds
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleCreateCollection = async (collectionData) => {
    try {
      console.log('Creating collection:', collectionData.name);
      
      const response = await api.post('/collections', {
        name: collectionData.name,
        description: collectionData.description || ''
      });
      
      console.log('Collection created successfully');
      showToast('Collection created successfully!', 'success');
      
      // FIXED: Add new collection to existing list instead of refetching
      // This prevents the infinite loop
      const newCollection = {
        id: response.data?.id || Date.now(),
        name: collectionData.name,
        description: collectionData.description || '',
        documentCount: 0,
        quizCount: 0
      };
      
      setCollections(prevCollections => [...prevCollections, newCollection]);
      
      return true;
    } catch (error) {
      console.error('Error creating collection:', error);
      showToast('Failed to create collection: ' + (error.response?.data || error.message), 'error');
      return false;
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    try {
      await api.delete(`/collections/${collectionId}`);
      showToast('Collection deleted successfully', 'success');
      
      // FIXED: Remove from current list instead of triggering refresh
      setCollections(prevCollections => 
        prevCollections.filter(collection => collection.id !== collectionId)
      );
    } catch (error) {
      showToast('Failed to delete collection', 'error');
      console.error('Error deleting collection:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        fontSize: '18px',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📚</div>
          <div>Loading collections...</div>
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
        height: '60vh',
        color: 'var(--error)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <div style={{ fontSize: '18px', marginBottom: '16px' }}>{error}</div>
        <button onClick={fetchCollections} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: 'var(--text-primary)', margin: 0 }}>
          📚 My Collections ({collections.length})
        </h1>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
            style={{ fontSize: '16px', padding: '10px 20px' }}
          >
            ➕ New Collection
          </button>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Welcome, {user?.username}!</span>
            <button 
              onClick={logout}
              className="btn-primary"
              style={{ backgroundColor: 'var(--error)', padding: '8px 16px', fontSize: '14px' }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Collections Display */}
      {collections.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>📁</div>
          <h2 style={{ fontSize: '24px', marginBottom: '12px', color: 'var(--text-primary)' }}>
            No collections yet
          </h2>
          <p style={{ fontSize: '16px', marginBottom: '30px' }}>
            Create your first collection to organize your documents
          </p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
            style={{ fontSize: '16px', padding: '12px 24px' }}
          >
            ➕ Create First Collection
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {collections.map((collection) => (
            <div
              key={collection.id}
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid var(--border)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ 
                  margin: '0 0 8px 0', 
                  color: 'var(--text-primary)', 
                  fontSize: '20px',
                  fontWeight: '600'
                }}>
                  📁 {collection.name}
                </h3>
                
                {collection.description && (
                  <p style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: '14px',
                    margin: '0 0 12px 0',
                    lineHeight: '1.4'
                  }}>
                    {collection.description}
                  </p>
                )}
              </div>

              <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '16px',
                fontSize: '14px',
                color: 'var(--text-secondary)'
              }}>
                <span>📄 {collection.documentCount || 0} documents</span>
                <span>🧠 {collection.quizCount || 0} quizzes</span>
              </div>

              <button
                onClick={() => handleDeleteCollection(collection.id)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--error)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                🗑️ Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Collection Modal */}
      <CreateCollectionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateCollection}
      />

      {/* Toast Notifications */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: toast.type === 'error' ? 'var(--error)' : 'var(--success)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1000
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Collections;