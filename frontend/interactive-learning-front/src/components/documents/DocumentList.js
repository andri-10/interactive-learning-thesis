import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      // For now, we'll get all documents. Later we'll filter by user ID
      const response = await api.get('/documents');
      setDocuments(response.data);
    } catch (error) {
      setError('Failed to load documents');
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await api.delete(`/documents/${documentId}`);
        setDocuments(documents.filter(doc => doc.id !== documentId));
        alert('Document deleted successfully');
      } catch (error) {
        alert('Failed to delete document');
      }
    }
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div>Loading documents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: 'var(--error)', textAlign: 'center', padding: '20px' }}>
        {error}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
        <p>No documents uploaded yet.</p>
        <p>Upload your first PDF document to get started!</p>
      </div>
    );
  }

  return (
    <div>
      {documents.map((document) => (
        <div 
          key={document.id}
          style={{
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '16px',
            backgroundColor: 'var(--surface)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>
                {document.title}
              </h3>
              
              {document.description && (
                <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  {document.description}
                </p>
              )}
              
              <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <span>📄 {document.pageCount} pages</span>
                <span>📦 {formatFileSize(document.fileSize)}</span>
                <span>📅 {formatDate(document.uploadDate)}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => alert('Generate Quiz feature coming soon!')}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                Generate Quiz
              </button>
              
              <button
                onClick={() => handleDelete(document.id)}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  backgroundColor: 'var(--error)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentList;