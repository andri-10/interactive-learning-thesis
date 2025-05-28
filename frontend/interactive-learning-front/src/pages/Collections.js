import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import CreateCollectionModal from '../components/collections/CreateCollectionModal';
import CollectionCard from '../components/collections/CollectionCard';
import Toast from '../components/common/Toast';

const Collections = () => {
  const { user, logout } = useAuth();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchCollections();
  }, [refreshTrigger]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await api.get('/collections');
      setCollections(response.data);
    } catch (error) {
      setError('Failed to load collections');
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, show: false });
  };

  const handleCreateCollection = async (collectionData) => {
    try {
      const response = await api.post('/collections', {
        ...collectionData,
        userId: user?.id || 1
      });
      
      showToast('Collection created successfully!', 'success');
      setRefreshTrigger(prev => prev + 1);
      return true;
    } catch (error) {
      showToast('Failed to create collection', 'error');
      console.error('Error creating collection:', error);
      return false;
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    try {
      await api.delete(`/collections/${collectionId}`);
      showToast('Collection deleted successfully', 'success');
      setRefreshTrigger(prev => prev + 1);
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
          📚 My Collections
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

      {/* Collections Grid */}
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
            <CollectionCard
              key={collection.id}
              collection={collection}
              onDelete={handleDeleteCollection}
              onRefresh={() => setRefreshTrigger(prev => prev + 1)}
            />
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
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={hideToast}
      />
    </div>
  );
};

export default Collections;