import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import api from '../../services/api';
import { 
  FolderPlus, 
  Search, 
  CheckCircle, 
  Folder,
  Loader,
  AlertCircle,
  Plus,
  BookOpen
} from 'lucide-react';

const SelectCollectionModal = ({ isOpen, onClose, document, onDocumentAdded }) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollection, setSelectedCollection] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchCollections();
      setSearchTerm('');
      setSelectedCollection(null);
      setError('');
    }
  }, [isOpen]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/collections');
      const collectionsData = response.data || [];
      
      // Check each collection to see if it already contains this document
      const availableCollections = await Promise.all(
        collectionsData.map(async (collection) => {
          try {
            // Fetch documents in this collection
            const documentsResponse = await api.get(`/documents/collection/${collection.id}`);
            const documents = documentsResponse.data || [];
            
            // Check if current document is already in this collection
            const containsDocument = documents.some(doc => doc.id === document?.id);
            
            return {
              ...collection,
              containsDocument,
              documentCount: documents.length
            };
          } catch (error) {
            console.error(`Error checking collection ${collection.id}:`, error);
            return {
              ...collection,
              containsDocument: false,
              documentCount: 0
            };
          }
        })
      );
      
      // Filter out collections that already contain this document
      const filteredCollections = availableCollections.filter(collection => !collection.containsDocument);
      
      setCollections(filteredCollections);
    } catch (error) {
      console.error('Error fetching collections:', error);
      setError('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCollection = async () => {
    if (!selectedCollection || !document) return;

    try {
      setAdding(true);
      
      await api.post('/documents/bulk-collection-update', {
        documentIds: [document.id],
        collectionId: selectedCollection.id
      });
      
      console.log(`Added document to collection: ${selectedCollection.name}`);
      
      onDocumentAdded && onDocumentAdded();
      onClose();
      
    } catch (error) {
      console.error('Error adding document to collection:', error);
      setError('Failed to add document to collection');
    } finally {
      setAdding(false);
    }
  };

  const handleCollectionSelect = (collection) => {
    // Toggle selection - if already selected, deselect it
    if (selectedCollection?.id === collection.id) {
      setSelectedCollection(null);
    } else {
      setSelectedCollection(collection);
    }
  };

  const getFilteredCollections = () => {
    if (!searchTerm) return collections;
    
    return collections.filter(collection => 
      collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (collection.description && collection.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredCollections = getFilteredCollections();

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Add "${document?.title}" to Collection`}
      maxWidth="600px"
    >
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: '40px',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <Loader size={32} className="animate-spin" />
          <span style={{ color: 'var(--text-secondary)' }}>Loading collections...</span>
        </div>
      ) : (
        <div>
          {error && (
            <div style={{
              backgroundColor: '#fee',
              color: 'var(--error)',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Search Input */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ position: 'relative' }}>
              <Search 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'var(--text-secondary)'
                }} 
              />
              <input
                type="text"
                placeholder="Search collections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: '2px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          {/* Collections List */}
          <div style={{ 
            maxHeight: '400px', 
            overflowY: 'auto',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            {filteredCollections.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px',
                color: 'var(--text-secondary)'
              }}>
                <Folder size={32} style={{ marginBottom: '12px' }} />
                <p>
                  {collections.length === 0 
                    ? 'No available collections found. This document may already be in all existing collections.'
                    : 'No collections found matching your search.'
                  }
                </p>
                {collections.length === 0 && (
                  <p style={{ fontSize: '14px', marginTop: '8px' }}>
                    Check your existing collections or create a new one.
                  </p>
                )}
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      marginTop: '8px'
                    }}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              filteredCollections.map((collection, index) => (
                <div
                  key={collection.id}
                  style={{
                    padding: '16px',
                    borderBottom: index < filteredCollections.length - 1 ? '1px solid var(--border)' : 'none',
                    backgroundColor: selectedCollection?.id === collection.id ? '#f0f9ff' : 'white',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onClick={() => handleCollectionSelect(collection)}
                  onMouseEnter={(e) => {
                    if (selectedCollection?.id !== collection.id) {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCollection?.id !== collection.id) {
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    {/* Selection Indicator */}
                    <div style={{ marginTop: '2px' }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        border: `2px solid ${selectedCollection?.id === collection.id ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: '50%',
                        backgroundColor: selectedCollection?.id === collection.id ? 'var(--primary)' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}>
                        {selectedCollection?.id === collection.id && (
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: 'white'
                          }} />
                        )}
                      </div>
                    </div>

                    {/* Collection Icon */}
                    <div style={{
                      padding: '8px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--secondary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <BookOpen size={16} />
                    </div>

                    {/* Collection Info */}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        margin: '0 0 4px 0', 
                        fontSize: '16px',
                        color: 'var(--text-primary)',
                        fontWeight: '600'
                      }}>
                        {collection.name}
                      </h4>
                      
                      {collection.description && (
                        <p style={{ 
                          margin: '0 0 8px 0', 
                          fontSize: '14px',
                          color: 'var(--text-secondary)',
                          lineHeight: '1.4'
                        }}>
                          {collection.description}
                        </p>
                      )}
                      
                      <div style={{ 
                        display: 'flex', 
                        gap: '16px', 
                        fontSize: '12px',
                        color: 'var(--text-secondary)'
                      }}>
                        <span>📚 {collection.documentCount || 0} documents</span>
                        <span>🧠 {collection.quizCount || 0} quizzes</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'flex-end',
            paddingTop: '20px',
            borderTop: '1px solid var(--border)'
          }}>
            <button
              onClick={onClose}
              disabled={adding}
              style={{
                padding: '12px 24px',
                border: '2px solid var(--border)',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                cursor: adding ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                opacity: adding ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!adding) {
                  e.target.style.backgroundColor = 'var(--background)';
                  e.target.style.borderColor = 'var(--primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!adding) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = 'var(--border)';
                }
              }}
            >
              Cancel
            </button>
            
            <button
              onClick={handleAddToCollection}
              disabled={!selectedCollection || adding}
              style={{
                padding: '12px 24px',
                backgroundColor: (!selectedCollection || adding) ? 'var(--border)' : 'var(--primary)',
                color: (!selectedCollection || adding) ? 'var(--text-secondary)' : 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: (!selectedCollection || adding) ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (selectedCollection && !adding) {
                  e.target.style.backgroundColor = 'var(--primary-dark)';
                  e.target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCollection && !adding) {
                  e.target.style.backgroundColor = 'var(--primary)';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              {adding ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Add to Collection
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </Modal>
  );
};

export default SelectCollectionModal;