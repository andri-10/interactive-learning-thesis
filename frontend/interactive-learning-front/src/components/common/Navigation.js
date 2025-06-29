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
  ChevronUp,
  TrendingUp,
  Archive,
  AlertTriangle,
  Lock,
  Eye
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
    { path: '/progress', label: 'Progress', icon: TrendingUp }
  ];

  const adminItems = [
    { 
      path: '/admin/dashboard', 
      label: 'Admin Dashboard', 
      icon: BarChart3,
      description: 'System overview and metrics'
    },
    { 
      path: '/admin/users', 
      label: 'User Management', 
      icon: Users,
      description: 'Manage user accounts and permissions'
    },
    { 
      path: '/admin/content', 
      label: 'Content Moderation', 
      icon: Eye,
      description: 'Moderate documents and quizzes'
    },
    { 
      path: '/admin/security', 
      label: 'Security Monitor', 
      icon: Shield,
      description: 'Security dashboard and locked accounts'
    },
    { 
      path: '/admin/logs', 
      label: 'Audit Logs', 
      icon: Archive,
      description: 'System activity and audit trails'
    }
  ];

  const isActive = (path) => location.pathname === path;
  const isAdminPath = () => location.pathname.startsWith('/admin');

  // Close admin menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (showAdminMenu) {
        setShowAdminMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showAdminMenu]);

  return (
    <nav style={{
      backgroundColor: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0 20px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 100
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
          to={user ? "/dashboard" : "/"}
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

        {/* Navigation Links - Only show if user is logged in */}
        {user && (
          <div style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
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
              <div 
                style={{ position: 'relative' }}
                onClick={(e) => e.stopPropagation()}
              >
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
                    minWidth: '280px',
                    zIndex: 1000,
                    animation: 'dropdownSlide 0.2s ease-out'
                  }}>
                    {/* Admin Menu Header */}
                    <div style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--border)',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px'
                      }}>
                        <AlertTriangle size={16} style={{ color: 'var(--error)' }} />
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: 'var(--error)'
                        }}>
                          Administrator Panel
                        </span>
                      </div>
                      <p style={{
                        margin: 0,
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.4'
                      }}>
                        System administration and monitoring tools
                      </p>
                    </div>

                    {/* Admin Menu Items */}
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
                            alignItems: 'flex-start',
                            gap: '12px',
                            marginBottom: '4px',
                            borderLeft: isActive(item.path) ? '3px solid white' : '3px solid transparent'
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive(item.path)) {
                              e.target.style.backgroundColor = '#fee2e2';
                              e.target.style.borderLeftColor = 'var(--error)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive(item.path)) {
                              e.target.style.backgroundColor = 'transparent';
                              e.target.style.borderLeftColor = 'transparent';
                            }
                          }}
                        >
                          <IconComponent size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              fontSize: '14px', 
                              fontWeight: '600',
                              marginBottom: '2px'
                            }}>
                              {item.label}
                            </div>
                            <div style={{ 
                              fontSize: '12px', 
                              color: isActive(item.path) ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)',
                              lineHeight: '1.3'
                            }}>
                              {item.description}
                            </div>
                          </div>
                        </Link>
                      );
                    })}

                    {/* Admin Menu Footer */}
                    <div style={{
                      padding: '12px 16px',
                      borderTop: '1px solid var(--border)',
                      marginTop: '8px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11px',
                        color: 'var(--text-secondary)'
                      }}>
                        <Lock size={10} />
                        <span>Administrative access required</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* User Menu - Only show if user is logged in */}
        {user && (
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
                  fontWeight: '600',
                  animation: 'pulse 2s infinite'
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
        )}

        {/* Guest Links - Show if user is not logged in */}
        {!user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Link
              to="/login"
              style={{
                textDecoration: 'none',
                padding: '8px 16px',
                color: 'var(--primary)',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              Login
            </Link>
            <Link
              to="/register"
              style={{
                textDecoration: 'none',
                padding: '8px 16px',
                backgroundColor: 'var(--primary)',
                color: 'white',
                borderRadius: '6px',
                fontSize: '14px',
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
              Sign Up
            </Link>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes dropdownSlide {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navigation;