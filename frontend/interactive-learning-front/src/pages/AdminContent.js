import React, { useState, useEffect } from 'react';
import Navigation from '../components/common/Navigation';
import ContentModerationPanel from '../components/admin/ContentModerationPanel';
import api from '../services/api';
import { 
  Shield, 
  FileText, 
  Brain, 
  Search,
  RefreshCw,
  Loader, 
  AlertTriangle,
  BarChart3,
  Trash2,
  Download,
  Flag,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

const AdminContent = () => {
  const [contentData, setContentData] = useState({
    documents: [],
    quizzes: [],
    stats: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchContentData();
  }, [currentPage, searchTerm, contentTypeFilter, statusFilter, sortBy, sortOrder]);

  const fetchContentData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch documents and quizzes in parallel
      const [documentsRes, quizzesRes] = await Promise.all([
        api.get('/documents'),
        api.get('/quizzes')
      ]);

      const documents = documentsRes.data?.content || documentsRes.data || [];
      const quizzes = quizzesRes.data?.content || quizzesRes.data || [];

      // Add type field to distinguish content
      const documentsWithType = documents.map(doc => ({ ...doc, contentType: 'document' }));
      const quizzesWithType = quizzes.map(quiz => ({ ...quiz, contentType: 'quiz' }));

      // Calculate statistics
      const stats = {
        totalDocuments: documents.length,
        totalQuizzes: quizzes.length,
        totalContent: documents.length + quizzes.length,
        documentsToday: documents.filter(d => isToday(d.createdAt)).length,
        quizzesToday: quizzes.filter(q => isToday(q.createdAt)).length,
        flaggedContent: 0, // Would come from API in real implementation
        pendingReview: 0   // Would come from API in real implementation
      };

      setContentData({
        documents: documentsWithType,
        quizzes: quizzesWithType,
        stats
      });

    } catch (error) {
      console.error('Error fetching content data:', error);
      setError('Failed to load content data');
      
      // Fallback mock data for development
      const mockDocuments = [
        {
          id: 1,
          title: 'Mathematics Study Guide',
          description: 'Comprehensive guide for algebra',
          userId: 101,
          userName: 'john_doe',
          createdAt: '2024-12-28T10:00:00Z',
          updatedAt: '2024-12-28T10:00:00Z',
          fileSize: 2048576,
          contentType: 'document',
          status: 'active',
          downloadCount: 45
        },
        {
          id: 2,
          title: 'Physics Notes',
          description: 'Advanced physics concepts',
          userId: 102,
          userName: 'jane_smith',
          createdAt: '2024-12-27T15:30:00Z',
          updatedAt: '2024-12-27T15:30:00Z',
          fileSize: 1024768,
          contentType: 'document',
          status: 'active',
          downloadCount: 23
        }
      ];

      const mockQuizzes = [
        {
          id: 1,
          title: 'Basic Algebra Quiz',
          description: 'Test your algebra knowledge',
          userId: 101,
          userName: 'john_doe',
          createdAt: '2024-12-28T09:00:00Z',
          updatedAt: '2024-12-28T09:00:00Z',
          questionCount: 10,
          contentType: 'quiz',
          status: 'active',
          attemptCount: 78
        },
        {
          id: 2,
          title: 'Chemistry Basics',
          description: 'Fundamental chemistry quiz',
          userId: 103,
          userName: 'bob_wilson',
          createdAt: '2024-12-26T14:20:00Z',
          updatedAt: '2024-12-26T14:20:00Z',
          questionCount: 15,
          contentType: 'quiz',
          status: 'active',
          attemptCount: 34
        }
      ];

      setContentData({
        documents: mockDocuments,
        quizzes: mockQuizzes,
        stats: {
          totalDocuments: mockDocuments.length,
          totalQuizzes: mockQuizzes.length,
          totalContent: mockDocuments.length + mockQuizzes.length,
          documentsToday: 1,
          quizzesToday: 1,
          flaggedContent: 0,
          pendingReview: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const isToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    const date = new Date(dateString);
    return date.toDateString() === today.toDateString();
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleBulkAction = async (action) => {
    if (selectedItems.size === 0) {
      showToast('Please select items first', 'error');
      return;
    }

    try {
      setBulkActionLoading(true);
      
      // Group selected items by type
      const selectedDocuments = [];
      const selectedQuizzes = [];
      
      [...selectedItems].forEach(id => {
        const item = getAllContent().find(item => item.id === id);
        if (item?.contentType === 'document') {
          selectedDocuments.push(id);
        } else if (item?.contentType === 'quiz') {
          selectedQuizzes.push(id);
        }
      });

      // Perform bulk operations
      const promises = [];
      
      if (action === 'delete') {
        selectedDocuments.forEach(id => {
          promises.push(api.delete(`/admin/content/documents/${id}`));
        });
        selectedQuizzes.forEach(id => {
          promises.push(api.delete(`/admin/content/quizzes/${id}`));
        });
      }

      await Promise.all(promises);
      
      showToast(`Successfully ${action}d ${selectedItems.size} item(s)`);
      setSelectedItems(new Set());
      await fetchContentData();
      
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      showToast(`Failed to ${action} selected items`, 'error');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const getAllContent = () => {
    const allContent = [...contentData.documents, ...contentData.quizzes];
    
    // Apply filters
    let filteredContent = allContent.filter(item => {
      if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !item.description?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !item.userName?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      if (contentTypeFilter !== 'all' && item.contentType !== contentTypeFilter) {
        return false;
      }
      
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      
      return true;
    });

    // Apply sorting
    filteredContent.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filteredContent;
  };

  const getPaginatedContent = () => {
    const allContent = getAllContent();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allContent.slice(startIndex, endIndex);
  };

  const totalItems = getAllContent().length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
        <Navigation />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 'calc(100vh - 64px)',
          fontSize: '18px',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <Loader size={48} className="animate-spin" style={{ marginBottom: '20px', color: 'var(--primary)' }} />
            <div>Loading content management...</div>
            <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.7 }}>
              Fetching documents and quizzes
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <div className="container" style={{ marginTop: '30px', paddingBottom: '40px' }}>
        {/* Page Header */}
        <div style={{ 
          marginBottom: '32px',
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
            background: 'linear-gradient(135deg, var(--error), #dc2626)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            <Shield size={36} style={{ color: 'var(--error)' }} />
            Content Moderation
          </h1>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '18px',
            margin: '0 0 24px 0',
            lineHeight: '1.6'
          }}>
            Manage and moderate all user-generated content including documents and quizzes
          </p>

          {/* Stats Overview */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginTop: '20px'
          }}>
            <div style={{
              padding: '20px',
              backgroundColor: 'var(--surface)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: 'var(--primary)',
                color: 'white',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                <BarChart3 size={20} />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px' }}>
                {contentData.stats?.totalContent || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Total Content
              </div>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: 'var(--surface)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: 'var(--secondary)',
                color: 'white',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                <FileText size={20} />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--secondary)', marginBottom: '4px' }}>
                {contentData.stats?.totalDocuments || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Documents
              </div>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: 'var(--surface)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: 'var(--accent)',
                color: 'white',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                <Brain size={20} />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '4px' }}>
                {contentData.stats?.totalQuizzes || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Quizzes
              </div>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: 'var(--surface)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: 'var(--success)',
                color: 'white',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                <TrendingUp size={20} />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--success)', marginBottom: '4px' }}>
                {(contentData.stats?.documentsToday || 0) + (contentData.stats?.quizzesToday || 0)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Added Today
              </div>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: 'var(--surface)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: 'var(--warning)',
                color: 'white',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                <Flag size={20} />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--warning)', marginBottom: '4px' }}>
                {contentData.stats?.flaggedContent || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Flagged
              </div>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: 'var(--surface)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: 'var(--error)',
                color: 'white',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                <Clock size={20} />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--error)', marginBottom: '4px' }}>
                {contentData.stats?.pendingReview || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Pending Review
              </div>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{
            backgroundColor: '#fef3cd',
            color: '#d97706',
            padding: '12px 20px',
            borderRadius: '8px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid #fcd34d'
          }}>
            <AlertTriangle size={16} />
            <span>{error} - Showing sample data</span>
            <button 
              onClick={fetchContentData}
              style={{
                marginLeft: 'auto',
                padding: '4px 12px',
                fontSize: '12px',
                backgroundColor: '#d97706',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RefreshCw size={12} />
              Retry
            </button>
          </div>
        )}

        {/* Main Content Card */}
        <div style={{
          backgroundColor: 'var(--surface)',
          borderRadius: '20px',
          padding: '32px',
          border: '1px solid var(--border)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
        }}>
          {/* Filters and Controls */}
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '24px',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1 }}>
              {/* Search Input */}
              <div style={{ position: 'relative', minWidth: '300px' }}>
                <Search 
                  size={16} 
                  style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)'
                  }} 
                />
                <input
                  type="text"
                  placeholder="Search content by title, description, or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    border: '2px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              {/* Content Type Filter */}
              <select
                value={contentTypeFilter}
                onChange={(e) => setContentTypeFilter(e.target.value)}
                style={{
                  padding: '12px',
                  border: '2px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  outline: 'none'
                }}
              >
                <option value="all">All Content</option>
                <option value="document">Documents</option>
                <option value="quiz">Quizzes</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '12px',
                  border: '2px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  outline: 'none'
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="flagged">Flagged</option>
                <option value="pending">Pending Review</option>
              </select>

              {/* Sort Options */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                style={{
                  padding: '12px',
                  border: '2px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  outline: 'none'
                }}
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
                <option value="userName-asc">Author A-Z</option>
                <option value="userName-desc">Author Z-A</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={fetchContentData}
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'var(--secondary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={14} />
                Refresh
              </button>
              
              <button
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Download size={14} />
                Export Report
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedItems.size > 0 && (
            <div style={{
              padding: '16px 20px',
              backgroundColor: 'var(--primary)',
              color: 'white',
              borderRadius: '12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>
                {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleBulkAction('delete')}
                  disabled={bulkActionLoading}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'var(--error)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: bulkActionLoading ? 'not-allowed' : 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: bulkActionLoading ? 0.7 : 1
                  }}
                >
                  {bulkActionLoading ? (
                    <RefreshCw size={12} className="animate-spin" />
                  ) : (
                    <Trash2 size={12} />
                  )}
                  Delete Selected
                </button>
                
                <button
                  onClick={() => setSelectedItems(new Set())}
                  disabled={bulkActionLoading}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: bulkActionLoading ? 'not-allowed' : 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    opacity: bulkActionLoading ? 0.7 : 1
                  }}
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* Content Moderation Panel */}
          <ContentModerationPanel
            content={getPaginatedContent()}
            selectedItems={selectedItems}
            onSelectItem={(id) => {
              const newSelected = new Set(selectedItems);
              if (newSelected.has(id)) {
                newSelected.delete(id);
              } else {
                newSelected.add(id);
              }
              setSelectedItems(newSelected);
            }}
            onSelectAll={() => {
              const currentContent = getPaginatedContent();
              if (selectedItems.size === currentContent.length) {
                setSelectedItems(new Set());
              } else {
                setSelectedItems(new Set(currentContent.map(item => item.id)));
              }
            }}
            onContentAction={(action, item) => {
              // Handle individual content actions
              console.log(`Action: ${action} on item:`, item);
              showToast(`${action} action triggered for ${item.title}`);
            }}
            loading={loading}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '24px',
              padding: '16px 0'
            }}>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: currentPage === 1 ? 'var(--border)' : 'var(--primary)',
                    color: currentPage === 1 ? 'var(--text-secondary)' : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                >
                  Previous
                </button>

                <div style={{ display: 'flex', gap: '4px' }}>
                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = index + 1;
                    } else if (currentPage <= 3) {
                      pageNum = index + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + index;
                    } else {
                      pageNum = currentPage - 2 + index;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: currentPage === pageNum ? 'var(--primary)' : 'transparent',
                          color: currentPage === pageNum ? 'white' : 'var(--text-primary)',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          transition: 'all 0.2s',
                          minWidth: '40px'
                        }}
                        onMouseEnter={(e) => {
                          if (currentPage !== pageNum) {
                            e.target.style.backgroundColor = 'var(--background)';
                            e.target.style.borderColor = 'var(--primary)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentPage !== pageNum) {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.borderColor = 'var(--border)';
                          }
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: currentPage === totalPages ? 'var(--border)' : 'var(--primary)',
                    color: currentPage === totalPages ? 'var(--text-secondary)' : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Toast Notifications */}
        {toast.show && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: toast.type === 'error' ? 'var(--error)' : 'var(--success)',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'slideInRight 0.3s ease-out'
          }}>
            {toast.type === 'success' ? (
              <CheckCircle size={18} />
            ) : (
              <AlertTriangle size={18} />
            )}
            {toast.message}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AdminContent;