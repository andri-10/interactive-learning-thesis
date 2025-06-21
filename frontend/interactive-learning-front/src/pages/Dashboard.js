import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/common/Navigation';
import MicrobitStatus from '../components/microbit/MicrobitStatus';
import { FileText, FolderOpen, Brain } from 'lucide-react';

const Dashboard = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <div className="container" style={{ marginTop: '30px', paddingBottom: '40px' }}>
        
        {/* Welcome Header - Centered */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '40px',
          padding: '0 20px'
        }}>
          <h1 style={{ 
            fontSize: '36px',
            fontWeight: 'bold',
            margin: '0 0 12px 0',
            color: 'var(--text-primary)',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Ready to Learn with MicroLearning?
          </h1>
          <p style={{ 
            fontSize: '18px',
            color: 'var(--text-secondary)',
            margin: 0,
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: '1.6'
          }}>
            Transform your documents into interactive quizzes and enhance your learning experience with micro:bit technology
          </p>
        </div>

        {/* Micro:bit Status Container */}
        <div className="card" style={{ marginBottom: '30px' }}>
          <h2 style={{ 
            fontSize: '20px',
            fontWeight: '600',
            margin: '0 0 20px 0',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🎮 Device Connection
          </h2>
          <MicrobitStatus />
        </div>
        
        {/* Quick Actions Container */}
        <div className="card">
          <h2 style={{ 
            fontSize: '20px',
            fontWeight: '600',
            margin: '0 0 24px 0',
            color: 'var(--text-primary)',
            textAlign: 'center'
          }}>
            Get Started
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '24px'
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
                  padding: '32px', 
                  textAlign: 'center',
                  border: '2px solid var(--primary)',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  height: '220px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(99, 102, 241, 0.15)';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                }}
              >
                <div style={{ 
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    padding: '16px',
                    borderRadius: '16px',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileText size={32} />
                  </div>
                </div>
                <h3 style={{ 
                  marginBottom: '12px', 
                  color: 'var(--primary)',
                  fontSize: '20px',
                  fontWeight: '600'
                }}>
                  My Documents
                </h3>
                <p style={{ 
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  margin: 0
                }}>
                  Upload and manage your PDF documents to create interactive learning materials
                </p>
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
                  padding: '32px', 
                  textAlign: 'center',
                  border: '2px solid var(--secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  height: '220px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(6, 182, 212, 0.15)';
                  e.currentTarget.style.borderColor = 'var(--secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = 'var(--secondary)';
                }}
              >
                <div style={{ 
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    padding: '16px',
                    borderRadius: '16px',
                    backgroundColor: 'var(--secondary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FolderOpen size={32} />
                  </div>
                </div>
                <h3 style={{ 
                  marginBottom: '12px', 
                  color: 'var(--secondary)',
                  fontSize: '20px',
                  fontWeight: '600'
                }}>
                  Collections
                </h3>
                <p style={{ 
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  margin: 0
                }}>
                  Organize your documents into themed collections for better learning structure
                </p>
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
                  padding: '32px', 
                  textAlign: 'center',
                  border: '2px solid var(--accent)',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  height: '220px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(139, 92, 246, 0.15)';
                  e.currentTarget.style.borderColor = 'var(--accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = 'var(--accent)';
                }}
              >
                <div style={{ 
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    padding: '16px',
                    borderRadius: '16px',
                    backgroundColor: 'var(--accent)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Brain size={32} />
                  </div>
                </div>
                <h3 style={{ 
                  marginBottom: '12px', 
                  color: 'var(--accent)',
                  fontSize: '20px',
                  fontWeight: '600'
                }}>
                  Interactive Quizzes
                </h3>
                <p style={{ 
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  margin: 0
                }}>
                  Take AI-generated quizzes and interact using your micro:bit device
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;