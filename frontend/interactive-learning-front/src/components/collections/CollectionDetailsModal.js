import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';
import api from '../../services/api';
import { 
  FileText, 
  Brain, 
  Play, 
  Trash2, 
  Calendar,
  BookOpen,
  Plus,
  Loader,
  AlertCircle,
  CheckCircle2,
  Activity,
  FileIcon
} from 'lucide-react';

const CollectionDetailsModal = ({ isOpen, onClose, collection, onRefresh }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [documents, setDocuments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalQuizzes: 0
  });
  const [showDeleteQuizModal, setShowDeleteQuizModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [showDeleteDocumentModal, setShowDeleteDocumentModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);

  useEffect(() => {
    if (isOpen && collection) {
      fetchCollectionDetails();
    }
  }, [isOpen, collection]);

  const fetchCollectionDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const documentsResponse = await api.get(`/documents/collection/${collection.id}`);
      const documentsData = documentsResponse.data || [];
      setDocuments(documentsData);

      const quizzesResponse = await api.get(`/quizzes/collection/${collection.id}`);
      const quizzesData = quizzesResponse.data || [];
      setQuizzes(quizzesData);

      calculateStats(documentsData, quizzesData);

    } catch (error) {
      console.error('Error fetching collection details:', error);
      setError('Failed to load collection details');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (docs, quizzes) => {
    setStats({
      totalDocuments: docs.length,
      totalQuizzes: quizzes.length
    });
  };

  const handleStartQuiz = (quizId) => {
    onClose();
    navigate(`/quiz/${quizId}`);
  };

  const handleDeleteDocument = (document) => {
    setDocumentToDelete(document);
    setShowDeleteDocumentModal(true);
  };

  const confirmDeleteDocument = async () => {
    if (!documentToDelete) return;
    
    try {
      const response = await api.delete(`/documents/${documentToDelete.id}/collection`);
      
      if (response.data?.updatedQuizzesCount) {
        console.log(`Removed document and ${response.data.updatedQuizzesCount} associated quizzes from collection`);
      }
      
      setDocuments(prevDocuments => prevDocuments.filter(doc => doc.id !== documentToDelete.id));
      
      fetchCollectionDetails();
      onRefresh && onRefresh();
      
    } catch (error) {
      console.error('Error removing document from collection:', error);
      setError('Failed to remove document from collection');
    } finally {
      setShowDeleteDocumentModal(false);
      setDocumentToDelete(null);
    }
  };

  const handleDeleteQuiz = (quiz) => {
    setQuizToDelete(quiz);
    setShowDeleteQuizModal(true);
  };

  const confirmDeleteQuiz = async () => {
    if (!quizToDelete) return;
    
    try {
      await api.delete(`/quizzes/${quizToDelete.id}`);
      
      setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz.id !== quizToDelete.id));
      
      fetchCollectionDetails();
      onRefresh && onRefresh();
      
    } catch (error) {
      console.error('Error deleting quiz:', error);
      setError('Failed to delete quiz');
    } finally {
      setShowDeleteQuizModal(false);
      setQuizToDelete(null);
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
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderOverview = () => (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div style={{
          padding: '32px',
          backgroundColor: 'var(--background)',
          borderRadius: '16px',
          textAlign: 'center',
          border: '2px solid var(--border)',
          transition: 'all 0.3s ease'
        }}>
          <FileText size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>
            {stats.totalDocuments}
          </div>
          <div style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>Documents</div>
        </div>

        <div style={{
          padding: '32px',
          backgroundColor: 'var(--background)',
          borderRadius: '16px',
          textAlign: 'center',
          border: '2px solid var(--border)',
          transition: 'all 0.3s ease'
        }}>
          <Brain size={48} style={{ color: 'var(--accent)', marginBottom: '16px' }} />
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>
            {stats.totalQuizzes}
          </div>
          <div style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>Quizzes</div>
        </div>
      </div>

      <div style={{
        padding: '24px',
        backgroundColor: 'var(--surface)',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        textAlign: 'center'
      }}>
        <h3 style={{ 
          margin: '0 0 12px 0',
          fontSize: '20px',
          fontWeight: '600',
          color: 'var(--text-primary)'
        }}>
          Collection Summary
        </h3>
        <p style={{
          margin: 0,
          fontSize: '16px',
          color: 'var(--text-secondary)',
          lineHeight: '1.5'
        }}>
          This collection contains {stats.totalDocuments} document{stats.totalDocuments !== 1 ? 's' : ''} and {stats.totalQuizzes} quiz{stats.totalQuizzes !== 1 ? 'zes' : ''}.
        </p>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
          Documents ({documents.length})
        </h3>
      </div>

      {documents.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          color: 'var(--text-secondary)'
        }}>
          <FileText size={32} style={{ marginBottom: '12px' }} />
          <p>No documents in this collection yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {documents.map((document) => (
            <div
              key={document.id}
              style={{
                padding: '16px',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                backgroundColor: 'var(--surface)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FileIcon size={16} />
                </div>

                <div style={{ flex: 1 }}>
                  <h4 style={{ 
                    margin: '0 0 4px 0', 
                    fontSize: '16px',
                    color: 'var(--text-primary)',
                    fontWeight: '600'
                  }}>
                    {document.title}
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

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleDeleteDocument(document)}
                    style={{
                      padding: '8px',
                      backgroundColor: 'var(--error)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#dc2626';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'var(--error)';
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderQuizzes = () => (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
          Quizzes ({quizzes.length})
        </h3>
      </div>

      {quizzes.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          color: 'var(--text-secondary)'
        }}>
          <Brain size={32} style={{ marginBottom: '12px' }} />
          <p>No quizzes in this collection yet</p>
          <p style={{ fontSize: '14px' }}>Generate quizzes from your documents to start learning!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              style={{
                padding: '16px',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                backgroundColor: 'var(--surface)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Brain size={16} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h4 style={{ 
                      margin: 0, 
                      fontSize: '16px',
                      color: 'var(--text-primary)',
                      fontWeight: '600'
                    }}>
                      {quiz.title}
                    </h4>
                    {quiz.microbitCompatible && (
                      <span style={{
                        padding: '2px 8px',
                        fontSize: '10px',
                        backgroundColor: 'var(--success)',
                        color: 'white',
                        borderRadius: '12px'
                      }}>
                        micro:bit
                      </span>
                    )}
                  </div>
                  
                  {quiz.description && (
                    <p style={{ 
                      margin: '0 0 8px 0', 
                      fontSize: '14px',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.4'
                    }}>
                      {quiz.description}
                    </p>
                  )}
                  
                  <div style={{ 
                    display: 'flex', 
                    gap: '16px', 
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    marginBottom: '8px'
                  }}>
                    <span>❓ {quiz.questions?.length || 0} questions</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      {formatDate(quiz.createdAt)}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleStartQuiz(quiz.id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'var(--primary-dark)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'var(--primary)';
                    }}
                  >
                    <Play size={14} />
                    Start
                  </button>
                  
                  <button
                    onClick={() => handleDeleteQuiz(quiz)}
                    style={{
                      padding: '8px',
                      backgroundColor: 'var(--error)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#dc2626';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'var(--error)';
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (!collection) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BookOpen size={24} />
          {collection.name}
        </div>
      }
      maxWidth="800px"
    >
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: '60px',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <Loader size={32} className="animate-spin" />
          <span style={{ color: 'var(--text-secondary)' }}>Loading collection details...</span>
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

          {collection.description && (
            <div style={{
              padding: '16px',
              backgroundColor: 'var(--background)',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: '1.5'
            }}>
              {collection.description}
            </div>
          )}

          <div style={{
            display: 'flex',
            borderBottom: '2px solid var(--border)',
            marginBottom: '24px'
          }}>
            {[
              { id: 'overview', label: 'Overview', icon: BookOpen },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'quizzes', label: 'Quizzes', icon: Brain }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '12px 16px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.target.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.target.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <IconComponent size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div style={{ minHeight: '300px' }}>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'documents' && renderDocuments()}
            {activeTab === 'quizzes' && renderQuizzes()}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '32px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Last updated: {formatDate(new Date().toISOString())}
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  onRefresh && onRefresh();
                  fetchCollectionDetails();
                }}
                style={{
                  padding: '10px 20px',
                  border: '2px solid var(--border)',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--background)';
                  e.target.style.borderColor = 'var(--primary)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = 'var(--border)';
                }}
              >
                <Activity size={14} />
                Refresh
              </button>
              
              <button
                onClick={onClose}
                className="btn-primary"
                style={{
                  padding: '10px 20px',
                  fontSize: '14px'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteDocumentModal && documentToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            backgroundColor: 'var(--surface)',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border)',
            animation: 'slideInScale 0.3s ease-out'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '20px'
            }}>
              <div style={{
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: '#fee2e2',
                color: 'var(--error)'
              }}>
                <FileText size={24} />
              </div>
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: '600',
                  color: 'var(--text-primary)'
                }}>
                  Remove Document?
                </h3>
                <p style={{
                  margin: '4px 0 0 0',
                  fontSize: '14px',
                  color: 'var(--text-secondary)'
                }}>
                  Remove from this collection
                </p>
              </div>
            </div>

            <div style={{
              marginBottom: '28px',
              padding: '20px',
              backgroundColor: 'var(--background)',
              borderRadius: '12px',
              border: '1px solid var(--border)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--primary)',
                  color: 'white'
                }}>
                  <FileText size={16} />
                </div>
                <h4 style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--text-primary)'
                }}>
                  {documentToDelete.title}
                </h4>
              </div>
              
              <p style={{
                margin: '0 0 16px 0',
                fontSize: '15px',
                color: 'var(--text-primary)',
                lineHeight: '1.5'
              }}>
                The documents along with its quizzes will be removed from this collection (not deleted permanently). Are you sure you want to proceed?
              </p>
              
              <div style={{
                display: 'flex',
                gap: '16px',
                fontSize: '14px',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} />
                  {documentToDelete.pageCount} pages
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} />
                  Uploaded {formatDate(documentToDelete.uploadDate)}
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowDeleteDocumentModal(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '2px solid var(--border)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--background)';
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.color = 'var(--primary)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.color = 'var(--text-secondary)';
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={confirmDeleteDocument}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--error)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#dc2626';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'var(--error)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <Trash2 size={14} />
                Remove Document
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteQuizModal && quizToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            backgroundColor: 'var(--surface)',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border)',
            animation: 'slideInScale 0.3s ease-out'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '20px'
            }}>
              <div style={{
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: '#fee2e2',
                color: 'var(--error)'
              }}>
                <Brain size={24} />
              </div>
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: '600',
                  color: 'var(--text-primary)'
                }}>
                  Delete Quiz?
                </h3>
                <p style={{
                  margin: '4px 0 0 0',
                  fontSize: '14px',
                  color: 'var(--text-secondary)'
                }}>
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div style={{
              marginBottom: '28px',
              padding: '20px',
              backgroundColor: 'var(--background)',
              borderRadius: '12px',
              border: '1px solid var(--border)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--accent)',
                  color: 'white'
                }}>
                  <Brain size={16} />
                </div>
                <h4 style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--text-primary)'
                }}>
                  {quizToDelete.title}
                </h4>
              </div>
              
              <p style={{
                margin: '0 0 16px 0',
                fontSize: '15px',
                color: 'var(--text-primary)',
                lineHeight: '1.5'
              }}>
                Are you sure you want to delete this quiz? This action cannot be undone.
              </p>
              
              <div style={{
                display: 'flex',
                gap: '16px',
                fontSize: '14px',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} />
                  {quizToDelete.questions?.length || 0} questions
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} />
                  Created {formatDate(quizToDelete.createdAt)}
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowDeleteQuizModal(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '2px solid var(--border)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--background)';
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.color = 'var(--primary)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.color = 'var(--text-secondary)';
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={confirmDeleteQuiz}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--error)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#dc2626';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'var(--error)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <Trash2 size={14} />
                Delete Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideInScale {
          from {
            transform: translateY(-20px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </Modal>
  );
};

export default CollectionDetailsModal;