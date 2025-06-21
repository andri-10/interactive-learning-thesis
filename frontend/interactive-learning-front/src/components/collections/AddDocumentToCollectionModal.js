import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import api from '../../services/api';
import { 
  FileText, 
  Search, 
  Plus, 
  CheckCircle, 
  Calendar,
  FileIcon,
  Loader,
  AlertCircle,
  Filter
} from 'lucide-react';

const AddDocumentToCollectionModal = ({ isOpen, onClose, collection, onDocumentAdded }) => {
  const [availableDocuments, setAvailableDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('all'); // all, not-in-collection, recent

  useEffect(() => {
    if (isOpen && collection) {
      fetchAvailableDocuments();
    }
  }, [isOpen, collection]);

  const fetchAvailableDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all documents
      const allDocsResponse = await api.get('/documents');
      const allDocuments = allDocsResponse.data || [];
      
      // Fetch documents already in this collection
      const collectionDocsResponse = await api.get(`/documents/collection/${collection.id}`);
      const collectionDocuments = collectionDocsResponse.data || [];
      const collectionDocIds = new Set(collectionDocuments.map(doc => doc.id));
      
      // Mark documents as already in collection
      const documentsWithStatus = allDocuments.map(doc => ({
        ...doc,
        inCollection: collectionDocIds.has(doc.id),
        canAdd: !collectionDocIds.has(doc.id)
      }));
      
      setAvailableDocuments(documentsWithStatus);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentToggle = (documentId) => {
    const newSelected = new Set(selectedDocuments);
    if (newSelected.has(documentId)) {
      newSelected.delete(documentId);
    } else {
      newSelected.add(documentId);
    }
    setSelectedDocuments(newSelected);
  };

  const handleSelectAll = () => {
    const filteredDocs = getFilteredDocuments();
    const selectableIds = filteredDocs
      .filter(doc => doc.canAdd)
      .map(doc => doc.id);
    
    if (selectableIds.every(id => selectedDocuments.has(id))) {
      // Deselect all
      const newSelected = new Set(selectedDocuments);
      selectableIds.forEach(id => newSelected.delete(id));
      setSelectedDocuments(newSelected);
    } else {
      // Select all
      const newSelected = new Set(selectedDocuments);
      selectableIds.forEach(id => newSelected.add(id));
      setSelectedDocuments(newSelected);
    }
  };

  const handleAddDocuments = async () => {
    if (selectedDocuments.size === 0) return;

    try {
      setAdding(true);
      
      // Add each selected document to the collection
      const promises = Array.from(selectedDocuments).map(async (documentId) => {
        // Since we don't have a direct "add to collection" endpoint,
        // we'll need to update the document with the collection ID
        return api.put(`/documents/${documentId}`, {
          collectionId: collection.id
        });
      });

      await Promise.all(promises);
      
      setSelectedDocuments(new Set());
      onDocumentAdded && onDocumentAdded();
      onClose();
      
    } catch (error) {
      console.error('Error adding documents to collection:', error);
      setError('Failed to add documents to collection');
    } finally {
      setAdding(false);
    }
  };

  const getFilteredDocuments = () => {
    let filtered = availableDocuments;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    switch (filterOption) {
      case 'not-in-collection':
        filtered = filtered.filter(doc => doc.canAdd);
        break;
      case 'recent':
        filtered = filtered
          .filter(doc => {
            const uploadDate = new Date(doc.uploadDate);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return uploadDate > weekAgo;
          });
        break;
      case 'all':
      default:
        break;
    }

    return filtered;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredDocuments = getFilteredDocuments();
  const selectableDocuments = filteredDocuments.filter(doc => doc.canAdd);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Add Documents to "${collection?.name}"`}
      maxWidth="700px"
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
          <span style={{ color: 'var(--text-secondary)' }}>Loading documents...</span>
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

          {/* Search and Filters */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              marginBottom: '16px',
              flexWrap: 'wrap'
            }}>
              {/* Search Input */}
              <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
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
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 40px',
                    border: '2px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Filter Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
                <select
                  value={filterOption}
                  onChange={(e) => setFilterOption(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    border: '2px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="all">All Documents</option>
                  <option value="not-in-collection">Available to Add</option>
                  <option value="recent">Recent (Last 7 days)</option>
                </select>
              </div>
            </div>

            {/* Selection Controls */}
            {selectableDocuments.length > 0 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px 16px',
                backgroundColor: 'var(--background)',
                borderRadius: '8px'
              }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {selectedDocuments.size} of {selectableDocuments.length} documents selected
                </span>
                <button
                  onClick={handleSelectAll}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  {selectableDocuments.every(doc => selectedDocuments.has(doc.id)) ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            )}
          </div>

          {/* Documents List */}
          <div style={{ 
            maxHeight: '400px', 
            overflowY: 'auto',
            border: '1px solid var(--border)',
            borderRadius: '8px'
          }}>
            {filteredDocuments.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px',
                color: 'var(--text-secondary)'
              }}>
                <FileText size={32} style={{ marginBottom: '12px' }} />
                <p>No documents found</p>
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
                      cursor: 'pointer'
                    }}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              filteredDocuments.map((document, index) => (
                <div
                  key={document.id}
                  style={{
                    padding: '16px',
                    borderBottom: index < filteredDocuments.length - 1 ? '1px solid var(--border)' : 'none',
                    backgroundColor: document.inCollection ? '#f8f9fa' : 'white',
                    opacity: document.canAdd ? 1 : 0.6,
                    cursor: document.canAdd ? 'pointer' : 'not-allowed',
                    transition: 'background-color 0.2s'
                  }}
                  onClick={() => document.canAdd && handleDocumentToggle(document.id)}
                  onMouseEnter={(e) => {
                    if (document.canAdd) {
                      e.target.style.backgroundColor = '#f8fafc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (document.canAdd) {
                      e.target.style.backgroundColor = document.inCollection ? '#f8f9fa' : 'white';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    {/* Selection Checkbox */}
                    <div style={{ marginTop: '2px' }}>
                      {document.canAdd ? (
                        <div style={{
                          width: '20px',
                          height: '20px',
                          border: `2px solid ${selectedDocuments.has(document.id) ? 'var(--primary)' : 'var(--border)'}`,
                          borderRadius: '4px',
                          backgroundColor: selectedDocuments.has(document.id) ? 'var(--primary)' : 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}>
                          {selectedDocuments.has(document.id) && (
                            <CheckCircle size={12} style={{ color: 'white' }} />
                          )}
                        </div>
                      ) : (
                        <div style={{
                          width: '20px',
                          height: '20px',
                          border: '2px solid var(--border)',
                          borderRadius: '4px',
                          backgroundColor: 'var(--success)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <CheckCircle size={12} style={{ color: 'white' }} />
                        </div>
                      )}
                    </div>

                    {/* Document Icon */}
                    <div style={{
                      padding: '8px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FileIcon size={16} />
                    </div>

                    {/* Document Info */}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        margin: '0 0 4px 0', 
                        fontSize: '16px',
                        color: 'var(--text-primary)',
                        fontWeight: '600'
                      }}>
                        {document.title}
                        {document.inCollection && (
                          <span style={{
                            marginLeft: '8px',
                            padding: '2px 8px',
                            fontSize: '12px',
                            backgroundColor: 'var(--success)',
                            color: 'white',
                            borderRadius: '12px'
                          }}>
                            Already in collection
                          </span>
                        )}
                      </h4>
                      
                      {document.description && (
                        <p style={{ 
                          margin: '0 0 8px 0', 
                          fontSize: '14px',
                          color: 'var(--text-secondary)',
                          lineHeight: '1.4'
                        }}>
                          {document.description}
                        </p>
                      )}
                      
                      <div style={{ 
                        display: 'flex', 
                        gap: '16px', 
                        fontSize: '12px',
                        color: 'var(--text-secondary)'
                      }}>
                        <span>📄 {document.pageCount} pages</span>
                        <span>💾 {formatFileSize(document.fileSize)}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} />
                          {formatDate(document.uploadDate)}
                        </span>
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
            marginTop: '24px',
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
                opacity: adding ? 0.6 : 1
              }}
            >
              Cancel
            </button>
            
            <button
              onClick={handleAddDocuments}
              disabled={selectedDocuments.size === 0 || adding}
              style={{
                padding: '12px 24px',
                backgroundColor: selectedDocuments.size === 0 || adding ? 'var(--border)' : 'var(--primary)',
                color: selectedDocuments.size === 0 || adding ? 'var(--text-secondary)' : 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: selectedDocuments.size === 0 || adding ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
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
                  Add {selectedDocuments.size} Document{selectedDocuments.size !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default AddDocumentToCollectionModal;