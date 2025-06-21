import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ViewQuizzesForDocument from '../quiz/ViewQuizzesForDocument';
import QuizGenerationModal from '../quiz/QuizGenerationModal';
import AddDocumentToCollectionModal from '../collections/AddDocumentToCollectionModal';
import Toast from '../common/Toast';
import Modal from '../common/Modal';
import { 
  FileText, 
  Brain, 
  Trash2, 
  Calendar, 
  HardDrive, 
  FileIcon, 
  Loader, 
  AlertTriangle, 
  AlertCircle,
  FolderPlus,
  Tag,
  Clock,
  MoreVertical,
  Zap
} from 'lucide-react';

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingQuiz, setGeneratingQuiz] = useState(null);
  
  // Modal states
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showAddToCollectionModal, setShowAddToCollectionModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  
  // Toast states
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchDocuments();
    fetchCollections();
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

  const fetchCollections = async () => {
    try {
      const response = await api.get('/collections');
      setCollections(response.data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const getCollectionName = (collectionId) => {
    const collection = collections.find(c => c.id === collectionId);
    return collection ? collection.name : null;
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

  const handleAddToCollection = (document) => {
    setSelectedDocument(document);
    setShowAddToCollectionModal(true);
  };

  const generateQuiz = async (numberOfQuestions, quizTitle, questionType) => {
    try {
      setGeneratingQuiz(selectedDocument.id);
      
      const response = await api.post('/generate/quiz', null, {
        params: {
          documentId: selectedDocument.id,
          numberOfQuestions: numberOfQuestions,
          quizTitle: quizTitle,
          questionType: questionType,
          difficulty: 2,
          microbitCompatible: true,
          useAI: true
        }
      });

      console.log('Quiz generated successfully:', response.data);
      
      const questionTypeText = questionType === 'MULTIPLE_CHOICE' ? 'multiple choice' : 'true/false';
      showToast(`Quiz "${quizTitle}" generated successfully with ${numberOfQuestions} ${questionTypeText} questions using AI!`, 'success');
      
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

  const handleDocumentAddedToCollection = () => {
    showToast('Document added to collection successfully!', 'success');
    fetchDocuments(); // Refresh to show updated collection tags
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

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '60px',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <Loader size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
        <span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>Loading documents...</span>
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
        padding: '40px',
        color: 'var(--error)'
      }}>
        <AlertTriangle size={32} style={{ marginBottom: '16px' }} />
        <div style={{ fontSize: '18px', marginBottom: '16px' }}>{error}</div>
        <button onClick={fetchDocuments} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px', 
        color: 'var(--text-secondary)'
      }}>
        <FileText size={64} style={{ marginBottom: '20px', color: 'var(--text-secondary)' }} />
        <h3 style={{ fontSize: '20px', marginBottom: '8px', color: 'var(--text-primary)' }}>
          No documents uploaded yet
        </h3>
        <p style={{ fontSize: '16px', marginBottom: '0' }}>
          Upload your first PDF document to get started with AI-powered quiz generation!
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Documents Table Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '20px',
        padding: '16px 20px',
        backgroundColor: 'var(--background)',
        borderRadius: '8px',
        marginBottom: '8px',
        fontSize: '14px',
        fontWeight: '600',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border)'
      }}>
        <span>Document Details</span>
        <span>Actions</span>
      </div>

      {/* Documents List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {documents.map((document) => {
          const collectionName = getCollectionName(document.collectionId);
          
          return (
            <div 
              key={document.id}
              style={{
                border: '1px solid var(--border)',
                borderRadius: '12px',
                backgroundColor: 'var(--surface)',
                transition: 'all 0.2s ease',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '20px',
                padding: '20px',
                alignItems: 'flex-start'
              }}>
                {/* Document Info Section */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  {/* Document Icon */}
                  <div style={{
                    padding: '12px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <FileIcon size={20} />
                  </div>

                  {/* Document Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Title and Collection Tag */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      marginBottom: '8px',
                      flexWrap: 'wrap'
                    }}>
                      <h3 style={{ 
                        margin: 0, 
                        fontSize: '18px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        lineHeight: '1.3'
                      }}>
                        {document.title}
                      </h3>
                      
                      {collectionName && (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          fontSize: '12px',
                          backgroundColor: 'var(--secondary)',
                          color: 'white',
                          borderRadius: '12px',
                          fontWeight: '500'
                        }}>
                          <Tag size={10} />
                          {collectionName}
                        </span>
                      )}
                    </div>
                    
                    {/* Description */}
                    {document.description && (
                      <p style={{ 
                        color: 'var(--text-secondary)', 
                        marginBottom: '12px', 
                        fontSize: '14px',
                        lineHeight: '1.5',
                        margin: '0 0 12px 0'
                      }}>
                        {document.description}
                      </p>
                    )}
                    
                    {/* Document Metadata */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '20px', 
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      alignItems: 'center',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileText size={12} />
                        {document.pageCount} pages
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <HardDrive size={12} />
                        {formatFileSize(document.fileSize)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={12} />
                        {getRelativeTime(document.uploadDate)}
                      </span>
                    </div>

                    {/* Associated Quizzes */}
                    <div style={{ marginTop: '16px' }}>
                      <ViewQuizzesForDocument 
                        documentId={document.id} 
                        refreshTrigger={refreshTrigger}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions Section */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '8px',
                  alignItems: 'flex-end',
                  minWidth: '200px'
                }}>
                  {/* Primary Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleGenerateQuiz(document)}
                      disabled={generatingQuiz === document.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 16px',
                        backgroundColor: generatingQuiz === document.id ? 'var(--border)' : 'var(--primary)',
                        color: generatingQuiz === document.id ? 'var(--text-secondary)' : 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: generatingQuiz === document.id ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        opacity: generatingQuiz === document.id ? 0.7 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (generatingQuiz !== document.id) {
                          e.target.style.backgroundColor = 'var(--primary-dark)';
                          e.target.style.transform = 'translateY(-1px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (generatingQuiz !== document.id) {
                          e.target.style.backgroundColor = 'var(--primary)';
                          e.target.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      {generatingQuiz === document.id ? (
                        <>
                          <Loader size={14} className="animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap size={14} />
                          Generate Quiz
                        </>
                      )}
                    </button>
                  </div>

                  {/* Secondary Actions */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleAddToCollection(document)}
                      disabled={generatingQuiz === document.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        backgroundColor: 'transparent',
                        color: 'var(--secondary)',
                        border: '1px solid var(--secondary)',
                        borderRadius: '6px',
                        cursor: generatingQuiz === document.id ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        opacity: generatingQuiz === document.id ? 0.6 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (generatingQuiz !== document.id) {
                          e.target.style.backgroundColor = 'var(--secondary)';
                          e.target.style.color = 'white';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (generatingQuiz !== document.id) {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.color = 'var(--secondary)';
                        }
                      }}
                    >
                      <FolderPlus size={12} />
                      {collectionName ? 'Change Collection' : 'Add to Collection'}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteClick(document)}
                      disabled={generatingQuiz === document.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px',
                        backgroundColor: 'transparent',
                        color: 'var(--error)',
                        border: '1px solid var(--error)',
                        borderRadius: '6px',
                        cursor: generatingQuiz === document.id ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        transition: 'all 0.2s',
                        opacity: generatingQuiz === document.id ? 0.6 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (generatingQuiz !== document.id) {
                          e.target.style.backgroundColor = 'var(--error)';
                          e.target.style.color = 'white';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (generatingQuiz !== document.id) {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.color = 'var(--error)';
                        }
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

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

      {/* Add to Collection Modal */}
      <AddDocumentToCollectionModal
        isOpen={showAddToCollectionModal}
        onClose={() => {
          setShowAddToCollectionModal(false);
          setSelectedDocument(null);
        }}
        document={selectedDocument}
        onDocumentAdded={handleDocumentAddedToCollection}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDocumentToDelete(null);
        }}
        title="Confirm Deletion"
      >
        <div style={{ textAlign: 'center' }}>
          <AlertCircle size={48} style={{ color: 'var(--error)', marginBottom: '16px' }} />
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
                cursor: 'pointer',
                fontSize: '14px'
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
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Trash2 size={14} />
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

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default DocumentList;