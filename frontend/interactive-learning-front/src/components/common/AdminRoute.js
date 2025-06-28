import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, Shield } from 'lucide-react';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: 'var(--background)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid var(--border)',
            borderTop: '4px solid var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }} />
          <div style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>
            Verifying admin access...
          </div>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  
  const isAdmin = user?.role === 'ADMIN' || user?.isAdmin === true;

  
  if (!isAdmin) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: 'var(--background)',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'var(--surface)',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          maxWidth: '500px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid var(--border)'
        }}>
          <div style={{
            padding: '20px',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            color: 'var(--error)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
            <Shield size={40} />
          </div>
          
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '12px',
            margin: '0 0 12px 0'
          }}>
            Access Restricted
          </h2>
          
          <p style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            marginBottom: '24px',
            lineHeight: '1.5',
            margin: '0 0 24px 0'
          }}>
            You don't have permission to access the admin panel. This area is restricted to administrators only.
          </p>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 20px',
            backgroundColor: 'var(--background)',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '14px',
            color: 'var(--text-secondary)'
          }}>
            <AlertTriangle size={16} />
            <span>Current role: {user?.role || 'User'}</span>
          </div>
          
          <button
            onClick={() => window.history.back()}
            style={{
              padding: '12px 24px',
              backgroundColor: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--primary-dark)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'var(--primary)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  
  return children;
};

export default AdminRoute;