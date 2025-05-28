import React, { useState, useRef } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DragDropUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

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

      const response = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
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
    setShowForm(false);
    setError('');
  };

  if (showForm) {
    return (
      <div className="card" style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '20px' }}>📄 Upload Document Details</h2>
        
        {error && (
          <div style={{ color: 'var(--error)', marginBottom: '16px', padding: '12px', backgroundColor: '#fee', borderRadius: '6px' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'var(--background)', borderRadius: '6px' }}>
          <strong>Selected File:</strong> {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
        </div>

        <form onSubmit={handleUpload}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Document title"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid var(--border)',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the document"
              rows="3"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid var(--border)',
                borderRadius: '8px',
                fontSize: '16px',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={cancelUpload}
              style={{
                padding: '12px 24px',
                border: '2px solid var(--border)',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ 
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
            >
              {loading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: '30px' }}>
      <h2 style={{ marginBottom: '20px' }}>📤 Upload New Document</h2>
      
      {error && (
        <div style={{ color: 'var(--error)', marginBottom: '16px', padding: '12px', backgroundColor: '#fee', borderRadius: '6px' }}>
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
        
        <div style={{ 
          fontSize: '64px', 
          marginBottom: '20px',
          transform: isDragging ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.3s ease'
        }}>
          {isDragging ? '🔥' : '📄'}
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
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600'
          }}>
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
        color: 'var(--text-secondary)' 
      }}>
        <strong>Supported format:</strong> PDF files only • <strong>Max size:</strong> 10MB
      </div>
    </div>
  );
};

export default DragDropUpload;