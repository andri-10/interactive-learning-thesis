import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ViewQuizzesForDocument from '../quiz/ViewQuizzesForDocument';
import QuizGenerationModal from '../quiz/QuizGenerationModal';
import Toast from '../common/Toast';
import Modal from '../common/Modal';

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingQuiz, setGeneratingQuiz] = useState(null);
  
  // Modal states
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  
  // Toast states
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/documents');
      setDocuments(response.data);
    } catch (error) {
      setError('Failed to load documents');
      console.error('Error fetching documents:', error);
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

  const handleGenerateQuiz = (document) => {
    setSelectedDocument(document);
    setShowQuizModal(true);
  };

  const generateQuiz = async (numberOfQuestions, quizTitle) => {
    try {
      setGeneratingQuiz(selectedDocument.id);
      
      const response = await api.post('/generate/quiz', null, {
        params: {
          documentId: selectedDocument.id,
          numberOfQuestions: numberOfQuestions,
          quizTitle: quizTitle,
          microbitCompatible: true
        }
      });

      console.log('Quiz generated successfully:', response.data);
      showToast(`Quiz "${quizTitle}" generated successfully with ${numberOfQuestions} questions!`, 'success');
      
      // Trigger refresh of quiz list
      setRefreshTrigger(prev => prev + 1);
      
    } catch (error) {
      console.error('Error generating quiz:', error);
      showToast('Failed to generate quiz: ' + (error.response?.data || 'Unknown error'), 'error');
    } finally {
      setGeneratingQuiz(null);
    }
  };

  const handleDeleteClick = (document) => {
    setDocumentToDelete(document);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/documents/${documentToDelete.id}`);
      setDocuments(documents.filter(doc => doc.id !== documentToDelete.id));
      showToast('Document deleted successfully', 'success');
      setShowDeleteModal(false);
      setDocumentToDelete(null);
    } catch (error) {
      showToast('Failed to delete document', 'error');
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
        <div style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>Loading documents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: 'var(--error)', textAlign: 'center', padding: '20px' }}>
        <div style={{ fontSize: '18px', marginBottom: '8px' }}>⚠️ {error}</div>
        <button onClick={fetchDocuments} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
        <p style={{ fontSize: '18px', marginBottom: '8px' }}>No documents uploaded yet</p>
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
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '16px',
            backgroundColor: 'var(--surface)',
            transition: 'all 0.2s',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
          }}
          onMouseEnter={(e) => {
            e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)', fontSize: '20px' }}>
                📄 {document.title}
              </h3>
              
              {document.description && (
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>
                  {document.description}
                </p>
              )}
              
              <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <span>📊 {document.pageCount} pages</span>
                <span>💾 {formatFileSize(document.fileSize)}</span>
                <span>📅 {formatDate(document.uploadDate)}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleGenerateQuiz(document)}
                  className="btn-primary"
                  disabled={generatingQuiz === document.id}
                  style={{ 
                    padding: '10px 16px', 
                    fontSize: '14px',
                    opacity: generatingQuiz === document.id ? 0.6 : 1,
                    cursor: generatingQuiz === document.id ? 'not-allowed' : 'pointer'
                  }}
                >
                  {generatingQuiz === document.id ? '⏳ Generating...' : '🧠 Generate Quiz'}
                </button>
                
                <button
                  onClick={() => handleDeleteClick(document)}
                  disabled={generatingQuiz === document.id}
                  style={{
                    padding: '10px 16px',
                    fontSize: '14px',
                    backgroundColor: 'var(--error)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: generatingQuiz === document.id ? 'not-allowed' : 'pointer',
                    opacity: generatingQuiz === document.id ? 0.6 : 1,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => !e.target.disabled && (e.target.style.transform = 'translateY(-1px)')}
                  onMouseLeave={(e) => !e.target.disabled && (e.target.style.transform = 'translateY(0)')}
                >
                  🗑️ Delete
                </button>
              </div>

              <ViewQuizzesForDocument 
                documentId={document.id} 
                refreshTrigger={refreshTrigger}
              />
            </div>
          </div>
        </div>
      ))}

      {/* Quiz Generation Modal */}
      <QuizGenerationModal
        isOpen={showQuizModal}
        onClose={() => {
          setShowQuizModal(false);
          setSelectedDocument(null);
        }}
        onGenerate={generateQuiz}
        documentTitle={selectedDocument?.title || ''}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDocumentToDelete(null);
        }}
        title="Confirm Delete"
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <p style={{ marginBottom: '20px', fontSize: '16px' }}>
            Are you sure you want to delete <strong>"{documentToDelete?.title}"</strong>?
          </p>
          <p style={{ marginBottom: '24px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            This will also delete all associated quizzes. This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDocumentToDelete(null);
              }}
              style={{
                padding: '12px 24px',
                border: '2px solid var(--border)',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              style={{
                padding: '12px 24px',
                backgroundColor: 'var(--error)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Delete Document
            </button>
          </div>
        </div>
      </Modal>

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

export default DocumentList;