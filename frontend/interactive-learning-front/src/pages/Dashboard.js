import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container" style={{ marginTop: '50px' }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1>Welcome to your Dashboard!</h1>
          <button 
            onClick={logout}
            className="btn-primary"
            style={{ backgroundColor: 'var(--error)' }}
          >
            Logout
          </button>
        </div>
        
        <p style={{ marginBottom: '30px' }}>Hello {user?.username}! You've successfully logged in.</p>
        
        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
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
                ':hover': { transform: 'translateY(-2px)' }
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
              <h3 style={{ marginBottom: '8px', color: 'var(--primary)' }}>My Documents</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Upload and manage your PDF documents</p>
            </div>
          </Link>
          
          <div 
            className="card"
            style={{ 
              padding: '30px', 
              textAlign: 'center',
              border: '2px solid var(--secondary)',
              opacity: 0.6
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
            <h3 style={{ marginBottom: '8px', color: 'var(--secondary)' }}>Collections</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Coming Soon</p>
          </div>
          
          <div 
            className="card"
            style={{ 
              padding: '30px', 
              textAlign: 'center',
              border: '2px solid var(--accent)',
              opacity: 0.6
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧠</div>
            <h3 style={{ marginBottom: '8px', color: 'var(--accent)' }}>Quizzes</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Coming Soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;