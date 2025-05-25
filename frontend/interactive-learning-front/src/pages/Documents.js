import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DocumentUpload from '../components/documents/DocumentUpload';
import DocumentList from '../components/documents/DocumentList';

const Documents = () => {
  const { user, logout } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [refreshList, setRefreshList] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshList(prev => prev + 1); // Trigger refresh
  };

  return (
    <div className="container" style={{ marginTop: '20px' }}>
      {/* Simple Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>My Documents</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span>Welcome, {user?.username}!</span>
          <button 
            onClick={logout}
            className="btn-primary"
            style={{ backgroundColor: 'var(--error)', padding: '8px 16px', fontSize: '14px' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Upload Section */}
      <div className="card" style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '20px' }}>Upload New Document</h2>
        <DocumentUpload onUploadSuccess={handleUploadSuccess} />
      </div>

      {/* Documents List */}
      <div className="card">
        <h2 style={{ marginBottom: '20px' }}>Your Documents</h2>
        <DocumentList key={refreshList} />
      </div>
    </div>
  );
};

export default Documents;