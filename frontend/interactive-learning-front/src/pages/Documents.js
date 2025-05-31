import React, { useState } from 'react';
import Navigation from '../components/common/Navigation';
import DragDropUpload from '../components/documents/DragDropUpload';
import DocumentList from '../components/documents/DocumentList';

const Documents = () => {
  const [refreshList, setRefreshList] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshList(prev => prev + 1);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <div className="container" style={{ marginTop: '30px', paddingBottom: '40px' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ 
            color: 'var(--text-primary)', 
            fontSize: '32px',
            fontWeight: 'bold',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            📚 My Documents
          </h1>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '16px',
            margin: '8px 0 0 0'
          }}>
            Upload and manage your PDF documents to generate interactive quizzes.
          </p>
        </div>

        {/* Upload Section */}
        <DragDropUpload onUploadSuccess={handleUploadSuccess} />

        {/* Documents List */}
        <div className="card">
          <h2 style={{ 
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-primary)'
          }}>
            📄 Your Documents
          </h2>
          <DocumentList key={refreshList} />
        </div>
      </div>
    </div>
  );
};

export default Documents;