import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/common/Navigation';

const Dashboard = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <div className="container" style={{ marginTop: '30px', paddingBottom: '40px' }}>
        <div className="card">
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ 
              fontSize: '32px',
              fontWeight: 'bold',
              margin: '0 0 8px 0',
              color: 'var(--text-primary)'
            }}>
              Welcome to your Dashboard!
            </h1>
            <p style={{ 
              fontSize: '16px',
              color: 'var(--text-secondary)',
              margin: 0
            }}>
              Manage your documents, collections, and quizzes from here
            </p>
          </div>
          
          {/* Quick Actions - Fixed sizing */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '20px'
          }}>
            <Link 
              to="/documents"
              style={{
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <div 
                className="card"
                style={{ 
                  padding: '30px', 
                  textAlign: 'center',
                  border: '2px solid var(--primary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  height: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                <h3 style={{ marginBottom: '8px', color: 'var(--primary)' }}>My Documents</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Upload and manage your PDF documents</p>
              </div>
            </Link>
            
            <Link 
              to="/collections"
              style={{
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <div 
                className="card"
                style={{ 
                  padding: '30px', 
                  textAlign: 'center',
                  border: '2px solid var(--secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  height: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
                <h3 style={{ marginBottom: '8px', color: 'var(--secondary)' }}>Collections</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Organize documents into collections</p>
              </div>
            </Link>
            
            <Link 
              to="/quizzes"
              style={{
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <div 
                className="card"
                style={{ 
                  padding: '30px', 
                  textAlign: 'center',
                  border: '2px solid var(--accent)', // Changed from var(--accent) to var(--success)
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  height: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧠</div>
                <h3 style={{ marginBottom: '8px', color: 'var(--accent)' }}>Quizzes</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Take quizzes from your documents</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;