import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/common/Navigation';
import api from '../services/api';
import CreateCollectionModal from '../components/collections/CreateCollectionModal';
import AddDocumentToCollectionModal from '../components/collections/AddDocumentToCollectionModal';
import CollectionDetailsModal from '../components/collections/CollectionDetailsModal';
import { 
  FolderOpen, 
  Plus, 
  AlertTriangle, 
  Loader, 
  FileText, 
  Brain, 
  Trash2, 
  Eye, 
  BookOpen,
  BarChart3,
  X
} from 'lucide-react';

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, collectionName }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'var(--surface)',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
        border: '1px solid var(--border)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'var(--background)';
            e.target.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = 'var(--text-secondary)';
          }}
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            padding: '16px',
            borderRadius: '50%',
            backgroundColor: '#fef2f2',
            color: '#dc2626'
          }}>
            <AlertTriangle size={32} />
          </div>
        </div>

        {/* Content */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '12px',
            margin: '0 0 12px 0'
          }}>
            Delete Collection
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: '1.5',
            margin: '0 0 8px 0'
          }}>
            Are you sure you want to delete "{collectionName}"?
          </p>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            lineHeight: '1.4',
            margin: 0
          }}>
            This will not delete the documents or quizzes, just remove them from this collection.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              backgroundColor: 'var(--background)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--surface)';
              e.target.style.borderColor = 'var(--text-secondary)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'var(--background)';
              e.target.style.borderColor = 'var(--border)';
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '12px 24px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#b91c1c';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#dc2626';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <Trash2 size={16} />
            Delete Collection
          </button>
        </div>
      </div>
    </div>
  );
};

const Collections = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collectionToDelete, setCollectionToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    console.log('Collections component mounted - fetching once');
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      console.log('Fetching collections...');
      const response = await api.get('/collections');
      console.log('Collections received:', response.data?.length || 0, 'collections');
      
      // Enhance collections with counts
      const enhancedCollections = await Promise.all(
        (response.data || []).map(async (collection) => {
          try {
            // Fetch documents in this collection
            const documentsResponse = await api.get(`/documents/collection/${collection.id}`);
            const documents = documentsResponse.data || [];
            
            // Fetch quizzes in this collection
            const quizzesResponse = await api.get(`/quizzes/collection/${collection.id}`);
            const quizzes = quizzesResponse.data || [];
            
            return {
              ...collection,
              documentCount: documents.length,
              quizCount: quizzes.length,
              documents: documents,
              quizzes: quizzes
            };
          } catch (error) {
            console.error(`Error fetching data for collection ${collection.id}:`, error);
            return {
              ...collection,
              documentCount: 0,
              quizCount: 0,
              documents: [],
              quizzes: []
            };
          }
        })
      );
      
      setCollections(enhancedCollections);
      setError('');
    } catch (error) {
      console.error('Error fetching collections:', error);
      setError('Failed to load collections');
      setCollections([]);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
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
      
      // Refresh collections to get updated data
      fetchCollections();
      
      return true;
    } catch (error) {
      console.error('Error creating collection:', error);
      showToast('Failed to create collection: ' + (error.response?.data || error.message), 'error');
      return false;
    }
  };

  const handleDeleteClick = (collection) => {
    setCollectionToDelete(collection);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!collectionToDelete) return;

    try {
      await api.delete(`/collections/${collectionToDelete.id}`);
      showToast('Collection deleted successfully', 'success');
      
      setCollections(prevCollections => 
        prevCollections.filter(collection => collection.id !== collectionToDelete.id)
      );
      
      setShowDeleteModal(false);
      setCollectionToDelete(null);
    } catch (error) {
      showToast('Failed to delete collection', 'error');
      console.error('Error deleting collection:', error);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setCollectionToDelete(null);
  };

  const handleAddDocuments = (collection) => {
    setSelectedCollection(collection);
    setShowAddDocumentModal(true);
  };

  const handleViewDetails = (collection) => {
    setSelectedCollection(collection);
    setShowDetailsModal(true);
  };

  const handleDocumentAdded = () => {
    fetchCollections();
    showToast('Documents and associated quizzes added to collection successfully!', 'success');
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
          fontSize: '18px',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <Loader size={48} className="animate-spin" style={{ marginBottom: '20px' }} />
            <div>Loading collections...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
        <Navigation />
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 'calc(100vh - 64px)',
          color: 'var(--error)'
        }}>
          <AlertTriangle size={48} style={{ marginBottom: '16px' }} />
          <div style={{ fontSize: '18px', marginBottom: '16px' }}>{error}</div>
          <button onClick={fetchCollections} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <div className="container" style={{ marginTop: '30px', paddingBottom: '40px' }}>
        {/* Page Header */}
        <div style={{ 
          marginBottom: '40px',
          textAlign: 'center',
          padding: '0 20px'
        }}>
          <h1 style={{ 
            color: 'var(--text-primary)', 
            fontSize: '36px',
            fontWeight: 'bold',
            margin: '0 0 12px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--secondary), var(--accent))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            <FolderOpen size={36} style={{ color: 'var(--secondary)' }} />
            My Collections ({collections.length})
          </h1>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '18px',
            margin: '0 0 24px 0',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: '1.6'
          }}>
            Organize your documents into themed collections for structured learning and better progress tracking
          </p>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
            style={{ 
              fontSize: '16px', 
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
          >
            <Plus size={18} />
            New Collection
          </button>
        </div>

        {/* Collections Display */}
        {collections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
            <FolderOpen size={80} style={{ marginBottom: '20px', color: 'var(--text-secondary)' }} />
            <h2 style={{ fontSize: '24px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              No collections yet
            </h2>
            <p style={{ fontSize: '16px', marginBottom: '30px' }}>
              Create your first collection to organize your documents
            </p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
              style={{ 
                fontSize: '16px', 
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto'
              }}
            >
              <Plus size={18} />
              Create First Collection
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: '24px',
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
                  transition: 'all 0.3s ease',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                }}
              >
                {/* Collection Header */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      padding: '12px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--secondary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <BookOpen size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        margin: '0 0 4px 0', 
                        color: 'var(--text-primary)', 
                        fontSize: '20px',
                        fontWeight: '600',
                        lineHeight: '1.3'
                      }}>
                        {collection.name}
                      </h3>
                      {collection.description && (
                        <p style={{ 
                          color: 'var(--text-secondary)', 
                          fontSize: '14px',
                          margin: 0,
                          lineHeight: '1.4'
                        }}>
                          {collection.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{
                  display: 'flex',
                  gap: '20px',
                  marginBottom: '20px',
                  padding: '16px',
                  backgroundColor: 'var(--background)',
                  borderRadius: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                      {collection.documentCount || 0} docs
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Brain size={16} style={{ color: 'var(--accent)' }} />
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                      {collection.quizCount || 0} quizzes
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart3 size={16} style={{ color: 'var(--success)' }} />
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                      {((collection.quizCount || 0) / Math.max(collection.documentCount || 1, 1) * 100).toFixed(0)}% coverage
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleViewDetails(collection)}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'var(--primary-dark)';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'var(--primary)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    <Eye size={16} />
                    View
                  </button>
                  
                  <button
                    onClick={() => handleAddDocuments(collection)}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      backgroundColor: 'var(--secondary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#0891b2';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'var(--secondary)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    <Plus size={16} />
                    Add Docs
                  </button>

                  <button
                    onClick={() => handleDeleteClick(collection)}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: 'var(--error)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#dc2626';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'var(--error)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modals */}
        <CreateCollectionModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateCollection}
        />

        <AddDocumentToCollectionModal
          isOpen={showAddDocumentModal}
          onClose={() => setShowAddDocumentModal(false)}
          collection={selectedCollection}
          onDocumentAdded={handleDocumentAdded}
        />

        <CollectionDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          collection={selectedCollection}
          onRefresh={fetchCollections}
        />

        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          collectionName={collectionToDelete?.name || ''}
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
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {toast.type === 'success' ? '✓' : '⚠'} {toast.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Collections;