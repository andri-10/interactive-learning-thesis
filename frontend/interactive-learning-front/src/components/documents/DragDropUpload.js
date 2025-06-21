import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Upload, 
  FileText, 
  FolderOpen, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader,
  File,
  Plus,
  Flame
} from 'lucide-react';

const DragDropUpload = ({ onUploadSuccess, preselectedCollectionId = null }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState(preselectedCollectionId);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  // Fetch collections when component mounts
  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoadingCollections(true);
      const response = await api.get('/collections');
      setCollections(response.data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
      // Don't show error for collections, it's optional
    } finally {
      setLoadingCollections(false);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging to false if we're leaving the drop zone completely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
      // Auto-fill title from filename if empty
      if (!title) {
        setTitle(selectedFile.name.replace('.pdf', ''));
      }
      setShowForm(true);
    } else {
      setError('Please select a PDF file');
      setFile(null);
    }
  };

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('userId', user?.id || 1);
      
      // Add collection ID if selected
      if (selectedCollectionId) {
        formData.append('collectionId', selectedCollectionId);
      }

      const response = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      setSelectedCollectionId(preselectedCollectionId); // Reset to preselected if any
      setShowForm(false);
      
      // Trigger refresh in parent component
      if (onUploadSuccess) {
        onUploadSuccess();
      }

    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.message || error.response?.data || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const cancelUpload = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setSelectedCollectionId(preselectedCollectionId);
    setShowForm(false);
    setError('');
  };

  if (showForm) {
    return (
      <div className="card" style={{ 
        marginBottom: '30px',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '2px solid var(--border)'
        }}>
          <div style={{
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileText size={20} />
          </div>
          <div>
            <h2 style={{ 
              margin: 0,
              fontSize: '22px',
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              Upload Document Details
            </h2>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '14px',
              color: 'var(--text-secondary)'
            }}>
              Complete the details for your document
            </p>
          </div>
        </div>
        
        {error && (
          <div style={{ 
            color: 'var(--error)', 
            marginBottom: '20px', 
            padding: '12px 16px', 
            backgroundColor: '#fee', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid #fecaca'
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Selected File Info */}
        <div style={{ 
          marginBottom: '24px', 
          padding: '16px', 
          backgroundColor: 'var(--background)', 
          borderRadius: '12px',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: 'var(--success)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <File size={16} />
            </div>
            <div>
              <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                Selected File: {file.name}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Size: {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpload}>
          {/* Title Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              Document Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter a descriptive title for your document"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid var(--border)',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Description Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the document content and purpose"
              rows="3"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid var(--border)',
                borderRadius: '8px',
                fontSize: '16px',
                resize: 'vertical',
                minHeight: '80px',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Collection Selection */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <FolderOpen size={16} />
              Add to Collection (Optional)
            </label>
            
            {loadingCollections ? (
              <div style={{
                padding: '12px 16px',
                border: '2px solid var(--border)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--text-secondary)'
              }}>
                <Loader size={16} className="animate-spin" />
                Loading collections...
              </div>
            ) : (
              <select
                value={selectedCollectionId || ''}
                onChange={(e) => setSelectedCollectionId(e.target.value || null)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: 'white',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              >
                <option value="">No collection (can be added later)</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    📁 {collection.name}
                  </option>
                ))}
              </select>
            )}
            
            <div style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              marginTop: '6px',
              lineHeight: '1.4'
            }}>
              Collections help organize your documents. You can create new collections or add to existing ones later.
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '12px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border)'
          }}>
            <button
              type="button"
              onClick={cancelUpload}
              disabled={loading}
              style={{
                padding: '12px 24px',
                border: '2px solid var(--border)',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = 'var(--background)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <X size={16} />
              Cancel
            </button>
            
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !title.trim()}
              style={{ 
                opacity: (loading || !title.trim()) ? 0.6 : 1,
                cursor: (loading || !title.trim()) ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flex: 1
              }}
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Upload Document
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="card" style={{ 
      marginBottom: '30px',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      border: '1px solid var(--border)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid var(--border)'
      }}>
        <div style={{
          padding: '12px',
          borderRadius: '12px',
          backgroundColor: 'var(--primary)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Upload size={20} />
        </div>
        <div>
          <h2 style={{ 
            margin: 0,
            fontSize: '22px',
            fontWeight: '600',
            color: 'var(--text-primary)'
          }}>
            Upload New Document
          </h2>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '14px',
            color: 'var(--text-secondary)'
          }}>
            Add PDF documents to generate interactive quizzes
          </p>
        </div>
      </div>
      
      {error && (
        <div style={{ 
          color: 'var(--error)', 
          marginBottom: '20px', 
          padding: '12px 16px', 
          backgroundColor: '#fee', 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid #fecaca'
        }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `3px dashed ${isDragging ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: '16px',
          padding: '60px 40px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragging ? 'var(--primary)' : 'var(--background)',
          color: isDragging ? 'white' : 'var(--text-primary)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
        
        {/* Dynamic Icon */}
        <div style={{ 
          fontSize: '64px', 
          marginBottom: '20px',
          transform: isDragging ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.3s ease',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {isDragging ? (
            <Flame size={64} style={{ color: '#ff6b35' }} />
          ) : (
            <FileText size={64} style={{ color: 'var(--primary)' }} />
          )}
        </div>
        
        <h3 style={{ 
          fontSize: '24px', 
          marginBottom: '12px',
          fontWeight: '600'
        }}>
          {isDragging ? 'Drop it like it\'s hot!' : 'Drag & Drop your PDF here'}
        </h3>
        
        <p style={{ 
          fontSize: '16px', 
          color: isDragging ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)',
          marginBottom: '20px'
        }}>
          {isDragging ? 'Release to upload your document' : 'or click to browse files'}
        </p>
        
        {!isDragging && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            <Plus size={18} />
            Choose PDF File
          </div>
        )}

        {isDragging && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, var(--primary), var(--secondary))',
            opacity: 0.1,
            pointerEvents: 'none'
          }} />
        )}
      </div>

      <div style={{ 
        textAlign: 'center', 
        marginTop: '16px', 
        fontSize: '14px', 
        color: 'var(--text-secondary)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px'
      }}>
        <span><strong>Supported format:</strong> PDF files only</span>
        <span>•</span>
        <span><strong>Max size:</strong> 10MB</span>
        <span>•</span>
        <span><strong>Features:</strong> AI quiz generation</span>
      </div>

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

export default DragDropUpload;