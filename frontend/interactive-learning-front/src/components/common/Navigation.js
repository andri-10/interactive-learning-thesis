import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  FileText, 
  FolderOpen, 
  Brain, 
  GraduationCap, 
  LogOut,
  Settings,
  Users,
  Shield,
  Activity,
  BarChart3,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const Navigation = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/documents', label: 'Documents', icon: FileText },
    { path: '/collections', label: 'Collections', icon: FolderOpen },
    { path: '/quizzes', label: 'Quizzes', icon: Brain },
    { path: '/progress', label: 'Progress', icon: BarChart3 }
  ];

  const adminItems = [
    { path: '/admin/dashboard', label: 'Admin Dashboard', icon: Settings },
    { path: '/admin/users', label: 'User Management', icon: Users },
    { path: '/admin/content', label: 'Content Moderation', icon: Shield },
    { path: '/admin/logs', label: 'Audit Logs', icon: Activity },
    { path: '/admin/security', label: 'Security', icon: Shield }
  ];

  const isActive = (path) => location.pathname === path;
  const isAdminPath = () => location.pathname.startsWith('/admin');

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
          to="/"
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
          {/* Regular Navigation Items */}
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

          {/* Admin Dropdown Menu */}
          {isAdmin() && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowAdminMenu(!showAdminMenu)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: isAdminPath() ? 'var(--error)' : 'transparent',
                  color: isAdminPath() ? 'white' : 'var(--text-primary)',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  border: isAdminPath() ? 'none' : '1px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  background: isAdminPath() ? 'linear-gradient(135deg, var(--error), #dc2626)' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isAdminPath()) {
                    e.target.style.backgroundColor = 'var(--background)';
                    e.target.style.borderColor = 'var(--border)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isAdminPath()) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.borderColor = 'transparent';
                  }
                }}
              >
                <Shield size={16} />
                Admin
                {showAdminMenu ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {/* Admin Dropdown Menu */}
              {showAdminMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  marginTop: '8px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                  padding: '8px',
                  minWidth: '200px',
                  zIndex: 1000
                }}>
                  {adminItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setShowAdminMenu(false)}
                        style={{
                          textDecoration: 'none',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          backgroundColor: isActive(item.path) ? 'var(--error)' : 'transparent',
                          color: isActive(item.path) ? 'white' : 'var(--text-primary)',
                          fontSize: '14px',
                          fontWeight: '500',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '4px'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive(item.path)) {
                            e.target.style.backgroundColor = 'var(--background)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive(item.path)) {
                            e.target.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <IconComponent size={16} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Menu */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            backgroundColor: 'var(--background)',
            borderRadius: '8px',
            border: '1px solid var(--border)'
          }}>
            <span style={{
              color: 'var(--text-secondary)',
              fontSize: '14px'
            }}>
              Welcome, {user?.username}!
            </span>
            {isAdmin() && (
              <span style={{
                padding: '2px 8px',
                fontSize: '11px',
                backgroundColor: 'var(--error)',
                color: 'white',
                borderRadius: '10px',
                fontWeight: '600'
              }}>
                ADMIN
              </span>
            )}
          </div>
          
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

      {/* Click outside handler for admin menu */}
      {showAdminMenu && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setShowAdminMenu(false)}
        />
      )}
    </nav>
  );
};

export default Navigation;