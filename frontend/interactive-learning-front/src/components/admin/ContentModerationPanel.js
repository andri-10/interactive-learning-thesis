import React, { useState, useRef, useEffect } from 'react';
import { 
  MoreVertical,
  Eye,
  Download,
  Trash2,
  Flag,
  FileText,
  Brain,
  Users,
  Calendar,
  HardDrive,
  Target,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  ExternalLink,
  Archive,
  Edit,
  Share2,
  BarChart3,
  Clock,
  X
} from 'lucide-react';
import api from '../../services/api';

const ContentModerationPanel = ({ 
  content = [], 
  selectedItems = new Set(), 
  onSelectItem, 
  onSelectAll, 
  onContentAction,
  loading = false 
}) => {
  const [showContentActions, setShowContentActions] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, item: null, loading: false });
  const [previewModal, setPreviewModal] = useState({ show: false, item: null });
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowContentActions(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return 'Unknown';
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  const getContentTypeIcon = (contentType) => {
    switch (contentType) {
      case 'document': return <FileText size={16} />;
      case 'quiz': return <Brain size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getContentTypeColor = (contentType) => {
    switch (contentType) {
      case 'document': return 'var(--secondary)';
      case 'quiz': return 'var(--accent)';
      default: return 'var(--text-secondary)';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'var(--success)';
      case 'inactive': return 'var(--error)';
      case 'flagged': return 'var(--warning)';
      case 'pending': return '#f97316';
      default: return 'var(--text-secondary)';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return <CheckCircle size={14} />;
      case 'inactive': return <XCircle size={14} />;
      case 'flagged': return <Flag size={14} />;
      case 'pending': return <Clock size={14} />;
      default: return <Activity size={14} />;
    }
  };

  const handleActionClick = (action, item, event) => {
    event.stopPropagation();
    setShowContentActions(null);
    
    if (action === 'delete') {
      setDeleteModal({ show: true, item, loading: false });
    } else if (action === 'preview') {
      setPreviewModal({ show: true, item });
    } else {
      onContentAction(action, item);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteModal(prev => ({ ...prev, loading: true }));
      
      const endpoint = deleteModal.item.contentType === 'document' 
        ? `/admin/content/documents/${deleteModal.item.id}`
        : `/admin/content/quizzes/${deleteModal.item.id}`;
        
      await api.delete(endpoint);
      
      onContentAction('delete', deleteModal.item);
      setDeleteModal({ show: false, item: null, loading: false });
    } catch (error) {
      console.error('Error deleting content:', error);
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const renderActionDropdown = (item) => (
    <div 
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: '100%',
        right: '0',
        marginTop: '4px',
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        padding: '6px',
        minWidth: '180px',
        zIndex: 1000,
        animation: 'dropdownSlide 0.2s ease-out'
      }}
    >
      {/* View/Preview */}
      <button
        onClick={(e) => handleActionClick('preview', item, e)}
        style={{
          width: '100%',
          padding: '10px 12px',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: 'var(--text-primary)',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'var(--background)';
          e.target.style.color = 'var(--primary)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.color = 'var(--text-primary)';
        }}
      >
        <Eye size={16} />
        <span>Preview {item.contentType === 'document' ? 'Document' : 'Quiz'}</span>
      </button>

      {/* Download */}
      {item.contentType === 'document' && (
        <button
          onClick={(e) => handleActionClick('download', item, e)}
          style={{
            width: '100%',
            padding: '10px 12px',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'var(--text-primary)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'var(--background)';
            e.target.style.color = 'var(--secondary)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = 'var(--text-primary)';
          }}
        >
          <Download size={16} />
          <span>Download File</span>
        </button>
      )}

      {/* View Statistics */}
      <button
        onClick={(e) => handleActionClick('stats', item, e)}
        style={{
          width: '100%',
          padding: '10px 12px',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: 'var(--text-primary)',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'var(--background)';
          e.target.style.color = 'var(--accent)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.color = 'var(--text-primary)';
        }}
      >
        <BarChart3 size={16} />
        <span>View Statistics</span>
      </button>

      {/* View Author */}
      <button
        onClick={(e) => handleActionClick('viewAuthor', item, e)}
        style={{
          width: '100%',
          padding: '10px 12px',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: 'var(--text-primary)',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'var(--background)';
          e.target.style.color = 'var(--primary)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.color = 'var(--text-primary)';
        }}
      >
        <User size={16} />
        <span>View Author Profile</span>
      </button>

      <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '6px 0' }} />

      {/* Flag Content */}
      <button
        onClick={(e) => handleActionClick('flag', item, e)}
        style={{
          width: '100%',
          padding: '10px 12px',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: 'var(--warning)',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#fef3c7';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
        }}
      >
        <Flag size={16} />
        <span>Flag Content</span>
      </button>

      {/* Archive */}
      <button
        onClick={(e) => handleActionClick('archive', item, e)}
        style={{
          width: '100%',
          padding: '10px 12px',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: 'var(--text-secondary)',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'var(--background)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
        }}
      >
        <Archive size={16} />
        <span>Archive Content</span>
      </button>

      {/* Delete */}
      <button
        onClick={(e) => handleActionClick('delete', item, e)}
        style={{
          width: '100%',
          padding: '10px 12px',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: 'var(--error)',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#fee2e2';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
        }}
      >
        <Trash2 size={16} />
        <span>Delete Content</span>
      </button>
    </div>
  );

  const renderDeleteConfirmationModal = () => {
    if (!deleteModal.show) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'var(--surface)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '450px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          {/* Header */}
          <div style={{
            padding: '24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: 'var(--error)',
              color: 'white'
            }}>
              <Trash2 size={20} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Delete {deleteModal.item?.contentType === 'document' ? 'Document' : 'Quiz'}
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
                This action cannot be undone
              </p>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '24px' }}>
            <div style={{
              padding: '16px',
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <AlertTriangle size={16} style={{ color: 'var(--error)' }} />
                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--error)' }}>
                  Warning: Permanent Deletion
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#7f1d1d', lineHeight: '1.5' }}>
                You are about to permanently delete "<strong>{deleteModal.item?.title}</strong>". 
                This will remove all associated data and cannot be recovered.
              </p>
            </div>

            <div style={{
              padding: '16px',
              backgroundColor: 'var(--background)',
              borderRadius: '8px',
              border: '1px solid var(--border)'
            }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Content Details
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Title:</span>
                  <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{deleteModal.item?.title}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Author:</span>
                  <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{deleteModal.item?.userName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Created:</span>
                  <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{formatDate(deleteModal.item?.createdAt)}</span>
                </div>
                {deleteModal.item?.contentType === 'document' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Downloads:</span>
                    <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{deleteModal.item?.downloadCount || 0}</span>
                  </div>
                )}
                {deleteModal.item?.contentType === 'quiz' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Attempts:</span>
                    <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{deleteModal.item?.attemptCount || 0}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: '20px 24px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            backgroundColor: 'var(--background)'
          }}>
            <button
              onClick={() => setDeleteModal({ show: false, item: null, loading: false })}
              disabled={deleteModal.loading}
              style={{
                padding: '10px 16px',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                cursor: deleteModal.loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: deleteModal.loading ? 0.5 : 1
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleteModal.loading}
              style={{
                padding: '10px 16px',
                backgroundColor: deleteModal.loading ? 'var(--border)' : 'var(--error)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: deleteModal.loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {deleteModal.loading ? (
                <>
                  <div style={{
                    width: '14px',
                    height: '14px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  Delete Forever
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPreviewModal = () => {
    if (!previewModal.show) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'var(--surface)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          {/* Header */}
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                padding: '10px',
                borderRadius: '10px',
                backgroundColor: getContentTypeColor(previewModal.item?.contentType),
                color: 'white'
              }}>
                {getContentTypeIcon(previewModal.item?.contentType)}
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {previewModal.item?.title}
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {previewModal.item?.contentType === 'document' ? 'Document Preview' : 'Quiz Preview'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setPreviewModal({ show: false, item: null })}
              style={{
                padding: '8px',
                backgroundColor: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: '24px', overflow: 'auto', maxHeight: 'calc(80vh - 140px)' }}>
            <div style={{
              padding: '20px',
              backgroundColor: 'var(--background)',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              marginBottom: '20px'
            }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Content Information
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Description:</span>
                  <p style={{ margin: '4px 0 0 0', color: 'var(--text-primary)' }}>
                    {previewModal.item?.description || 'No description available'}
                  </p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Author:</span>
                  <p style={{ margin: '4px 0 0 0', color: 'var(--text-primary)', fontWeight: '500' }}>
                    {previewModal.item?.userName}
                  </p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Created:</span>
                  <p style={{ margin: '4px 0 0 0', color: 'var(--text-primary)' }}>
                    {formatDate(previewModal.item?.createdAt)}
                  </p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Last Modified:</span>
                  <p style={{ margin: '4px 0 0 0', color: 'var(--text-primary)' }}>
                    {formatDate(previewModal.item?.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            {previewModal.item?.contentType === 'document' && (
              <div style={{
                padding: '20px',
                backgroundColor: 'var(--background)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                textAlign: 'center'
              }}>
                <FileText size={48} style={{ color: 'var(--secondary)', marginBottom: '12px' }} />
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Document preview not available. Click download to view the full document.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    File Size: {formatFileSize(previewModal.item?.fileSize)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Downloads: {previewModal.item?.downloadCount || 0}
                  </div>
                  <button
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'var(--secondary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: '8px'
                    }}
                  >
                    <Download size={12} />
                    Download Document
                  </button>
                </div>
              </div>
            )}

            {previewModal.item?.contentType === 'quiz' && (
              <div style={{
                padding: '20px',
                backgroundColor: 'var(--background)',
                borderRadius: '8px',
                border: '1px solid var(--border)'
              }}>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <Brain size={48} style={{ color: 'var(--accent)', marginBottom: '12px' }} />
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    Quiz Information
                  </h4>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '4px' }}>
                      {previewModal.item?.questionCount || 0}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Questions
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--success)', marginBottom: '4px' }}>
                      {previewModal.item?.attemptCount || 0}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Attempts
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px' }}>
                      {previewModal.item?.avgScore ? `${Math.round(previewModal.item.avgScore)}%` : 'N/A'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Avg Score
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div style={{
        border: '1px solid var(--border)',
        borderRadius: '16px',
        overflow: 'hidden',
        backgroundColor: 'var(--surface)'
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '60px 1fr 120px 140px 140px 120px 80px',
          gap: '16px',
          padding: '20px',
          backgroundColor: 'var(--background)',
          borderBottom: '2px solid var(--border)',
          fontSize: '14px',
          fontWeight: '600',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={selectedItems.size === content.length && content.length > 0}
              onChange={onSelectAll}
              style={{ 
                margin: '0',
                width: '16px',
                height: '16px',
                cursor: 'pointer'
              }}
            />
          </div>
          <span>Content</span>
          <span>Type</span>
          <span>Author</span>
          <span>Status</span>
          <span>Created</span>
          <span>Actions</span>
        </div>

        {/* Table Body */}
        {loading ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: 'var(--text-secondary)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              margin: '0 auto 16px',
              border: '4px solid var(--border)',
              borderTop: '4px solid var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <div style={{ fontSize: '16px' }}>Loading content...</div>
          </div>
        ) : content.length === 0 ? (
          <div style={{
            padding: '80px 20px',
            textAlign: 'center',
            color: 'var(--text-secondary)'
          }}>
            <Activity size={64} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <div style={{ fontSize: '20px', marginBottom: '8px', fontWeight: '600' }}>
              No content found
            </div>
            <div style={{ fontSize: '14px' }}>
              No content matches your current search and filter criteria
            </div>
          </div>
        ) : (
          content.map((item, index) => (
            <div
              key={`${item.contentType}-${item.id}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 120px 140px 140px 120px 80px',
                gap: '16px',
                padding: '20px',
                borderBottom: index < content.length - 1 ? '1px solid var(--border)' : 'none',
                backgroundColor: selectedItems.has(item.id) 
                  ? '#f0f9ff' 
                  : hoveredRow === item.id 
                  ? '#fafbfc' 
                  : 'white',
                transition: 'all 0.2s ease',
                alignItems: 'center',
                cursor: 'pointer'
              }}
              onMouseEnter={() => setHoveredRow(item.id)}
              onMouseLeave={() => setHoveredRow(null)}
              onClick={() => onSelectItem && onSelectItem(item.id)}
            >
              {/* Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    onSelectItem && onSelectItem(item.id);
                  }}
                  style={{ 
                    margin: '0',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
              </div>

              {/* Content Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: getContentTypeColor(item.contentType),
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {getContentTypeIcon(item.contentType)}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ 
                    fontWeight: '600', 
                    color: 'var(--text-primary)',
                    fontSize: '15px',
                    marginBottom: '2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.title}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.description || 'No description'}
                  </div>
                </div>
              </div>

              {/* Content Type Badge */}
              <div style={{
                padding: '6px 12px',
                fontSize: '12px',
                backgroundColor: getContentTypeColor(item.contentType),
                color: 'white',
                borderRadius: '16px',
                fontWeight: '600',
                textAlign: 'center',
                textTransform: 'capitalize',
                letterSpacing: '0.5px'
              }}>
                {item.contentType}
              </div>

              {/* Author */}
              <div style={{ 
                fontSize: '14px', 
                color: 'var(--text-primary)',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <User size={12} style={{ color: 'var(--text-secondary)' }} />
                <span style={{ 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {item.userName || 'Unknown'}
                </span>
              </div>

              {/* Status */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: getStatusColor(item.status),
                fontWeight: '500'
              }}>
                {getStatusIcon(item.status)}
                <span style={{ textTransform: 'capitalize' }}>
                  {item.status || 'active'}
                </span>
              </div>

              {/* Created Date */}
              <div style={{ 
                fontSize: '13px', 
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Calendar size={12} />
                {getRelativeTime(item.createdAt)}
              </div>

              {/* Actions */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowContentActions(showContentActions === item.id ? null : item.id);
                  }}
                  style={{
                    padding: '10px',
                    backgroundColor: hoveredRow === item.id ? 'var(--background)' : 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--primary)';
                    e.target.style.borderColor = 'var(--primary)';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = hoveredRow === item.id ? 'var(--background)' : 'transparent';
                    e.target.style.borderColor = 'var(--border)';
                    e.target.style.color = 'var(--text-primary)';
                  }}
                >
                  <MoreVertical size={16} />
                </button>

                {/* Actions Dropdown */}
                {showContentActions === item.id && renderActionDropdown(item)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {renderDeleteConfirmationModal()}
      {renderPreviewModal()}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes dropdownSlide {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default ContentModerationPanel;