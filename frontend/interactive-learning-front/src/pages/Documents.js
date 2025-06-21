import React, { useState } from 'react';
import Navigation from '../components/common/Navigation';
import DragDropUpload from '../components/documents/DragDropUpload';
import DocumentList from '../components/documents/DocumentList';
import { FolderOpen, FileText } from 'lucide-react';

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
        <div style={{ 
          marginBottom: '40px',
          textAlign: 'center',
          padding: '0 20px'
        }}>
          <h1 style={{ 
            color: 'var(--text-primary)', 
            fontSize: '36px',
            fontWeight: 'bold',
            margin: '0 0 12px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            <FolderOpen size={36} style={{ color: 'var(--primary)' }} />
            My Documents
          </h1>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '18px',
            margin: 0,
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: '1.6'
          }}>
            Upload and manage your PDF documents to generate interactive quizzes with AI-powered question generation.
          </p>
        </div>

        {/* Upload Section */}
        <DragDropUpload onUploadSuccess={handleUploadSuccess} />

        {/* Documents List */}
        <div className="card" style={{
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
                Your Document Library
              </h2>
              <p style={{
                margin: '4px 0 0 0',
                fontSize: '14px',
                color: 'var(--text-secondary)'
              }}>
                Manage your uploaded documents and generate quizzes
              </p>
            </div>
          </div>
          <DocumentList key={refreshList} />
        </div>
      </div>
    </div>
  );
};

export default Documents;