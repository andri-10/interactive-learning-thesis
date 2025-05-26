import React, { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DocumentUpload = ({ onUploadSuccess }) => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
      // Auto-fill title from filename if empty
      if (!title) {
        setTitle(selectedFile.name.replace('.pdf', ''));
      }
    } else {
      setError('Please select a PDF file');
      setFile(null);
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
    formData.append('userId', user?.id || 1); // Use actual user ID

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Reset form
    setFile(null);
    setTitle('');
    setDescription('');
    
    // Trigger refresh in parent component
    if (onUploadSuccess) {
      onUploadSuccess();
    }

    alert('Document uploaded successfully!');
  } catch (error) {
  console.error('Upload error:', error);
  console.error('Error response:', error.response);
  
  let errorMessage = 'Upload failed';
  if (error.response?.data) {
    if (typeof error.response.data === 'string') {
      errorMessage = error.response.data;
    } else if (error.response.data.message) {
      errorMessage = error.response.data.message;
    } else {
      errorMessage = JSON.stringify(error.response.data);
    }
  }
  
  setError(errorMessage);
} finally {
  setLoading(false);
}
};

  return (
    <form onSubmit={handleUpload}>
      {error && (
        <div style={{ color: 'var(--error)', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
          Select PDF File
        </label>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          required
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid var(--border)',
            borderRadius: '8px',
            fontSize: '16px'
          }}
        />
        {file && (
          <div style={{ marginTop: '8px', color: 'var(--success)', fontSize: '14px' }}>
            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}
      </div>

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

      <button
        type="submit"
        className="btn-primary"
        disabled={loading || !file}
        style={{ 
          opacity: loading || !file ? 0.6 : 1,
          cursor: loading || !file ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Uploading...' : 'Upload Document'}
      </button>
    </form>
  );
};

export default DocumentUpload;