import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// Import professional SVG icons
import { 
  Home, 
  FileText, 
  FolderOpen, 
  Brain, 
  GraduationCap, 
  LogOut 
} from 'lucide-react';

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/documents', label: 'Documents', icon: FileText },
    { path: '/collections', label: 'Collections', icon: FolderOpen },
    { path: '/quizzes', label: 'Quizzes', icon: Brain }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      backgroundColor: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0 20px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '64px'
      }}>
        {/* Logo/Brand */}
        <Link 
          to="/dashboard"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'var(--primary)'
          }}
        >
          <img 
            src="/logo-horizontal.png" 
            alt="MicroLearning Logo" 
            style={{
              height: '55px',
              width: 'auto',
              objectFit: 'contain'
            }}
            onError={(e) => {
              // Fallback to text if logo fails to load
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          {/* Fallback text logo */}
          <div style={{
            display: 'none',
            alignItems: 'center',
            gap: '10px'
          }}>
            <GraduationCap size={24} />
            MicroLearning
          </div>
        </Link>

        {/* Navigation Links */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: isActive(item.path) ? 'var(--primary)' : 'transparent',
                  color: isActive(item.path) ? 'white' : 'var(--text-primary)',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  border: isActive(item.path) ? 'none' : '1px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.path)) {
                    e.target.style.backgroundColor = 'var(--background)';
                    e.target.style.borderColor = 'var(--border)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.path)) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.borderColor = 'transparent';
                  }
                }}
              >
                <IconComponent size={16} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* User Menu */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{
            color: 'var(--text-secondary)',
            fontSize: '14px'
          }}>
            Welcome, {user?.username}!
          </span>
          <button
            onClick={logout}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--error)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#dc2626';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'var(--error)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;