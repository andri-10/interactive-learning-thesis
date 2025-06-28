import React, { useState, useEffect } from 'react';
import Navigation from '../components/common/Navigation';
import ProgressDashboard from '../components/progress/ProgressDashboard';
import ProgressCharts from '../components/progress/ProgressCharts';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  TrendingUp, 
  Target, 
  Clock,
  Brain,
  FileText,
  Award,
  Activity,
  Loader,
  AlertTriangle,
  RefreshCw,
  Calendar,
  BarChart3
} from 'lucide-react';

const UserProgress = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
  try {
    setLoading(true);
    setError('');
    
    console.log('=== FRONTEND API DEBUG ===');
    console.log('Token in localStorage:', localStorage.getItem('token'));
    console.log('Making API calls...');
    
    // Test with a simple call first
    console.log('Testing /api/progress...');
    const testResponse = await api.get('/progress');
    console.log('✅ /api/progress works:', testResponse.data);
    
    // Rest of your API calls...
  } catch (error) {
    console.error('❌ API Error:', error);
    console.error('Error response:', error.response?.data);
  }
};

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProgressData();
    setTimeout(() => setRefreshing(false), 1000);
  };

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
            <div>Loading your progress...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <Navigation />
      
      <div className="container" style={{ marginTop: '30px', paddingBottom: '40px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', padding: '0 20px' }}>
          <h1 style={{ 
            color: 'var(--text-primary)', 
            fontSize: '36px',
            fontWeight: 'bold',
            margin: '0 0 12px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            <TrendingUp size={36} style={{ color: 'var(--primary)' }} />
            My Progress
          </h1>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '18px',
            margin: '0 0 24px 0',
            lineHeight: '1.6'
          }}>
            Track your learning journey and see how you're improving over time
          </p>

          {/* Quick Overview Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px'
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
                <Brain size={20} />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px' }}>
                {progressData?.dashboard?.totalQuizzes || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Quizzes Completed
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
                <Target size={20} />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--success)', marginBottom: '4px' }}>
                {Math.round(progressData?.dashboard?.averageScore || 0)}%
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Average Score
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
                <Clock size={20} />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--secondary)', marginBottom: '4px' }}>
                {Math.floor((progressData?.dashboard?.totalTime || 0) / 60)}h
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Study Time
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
                <Award size={20} />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '4px' }}>
                {progressData?.dashboard?.streak || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Day Streak
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
              onClick={handleRefresh}
              style={{
                marginLeft: 'auto',
                padding: '4px 12px',
                fontSize: '12px',
                backgroundColor: '#d97706',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '24px'
        }}>
          {/* Progress Dashboard */}
          <ProgressDashboard 
            data={progressData?.dashboard}
            recentActivity={progressData?.recentActivity}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />

          {/* Progress Charts */}
          <ProgressCharts 
            data={progressData?.stats}
            weeklyProgress={progressData?.dashboard?.weeklyProgress}
            monthlyActivity={progressData?.dashboard?.monthlyActivity}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default UserProgress;