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
      
      // Fetch user progress data
      const [dashboardRes, recentRes, statsRes] = await Promise.all([
        api.get('/progress/dashboard'),
        api.get('/progress/recent'),
        api.get('/progress/stats')
      ]);

      setProgressData({
        dashboard: dashboardRes.data,
        recentActivity: recentRes.data?.content || recentRes.data || [],
        stats: statsRes.data
      });

    } catch (error) {
      console.error('Error fetching progress data:', error);
      setError('Failed to load progress data');
      
      // Mock data for development
      setProgressData({
        dashboard: {
          totalQuizzes: 24,
          totalTime: 180, // minutes
          averageScore: 78.5,
          completionRate: 85.2,
          streak: 5,
          level: 'Intermediate',
          totalDocuments: 15,
          studyGoal: 30, // minutes per day
          studyProgress: 75, // percentage of goal
          achievements: 7,
          weeklyProgress: [65, 72, 68, 85, 78, 82, 75], // Last 7 days scores
          monthlyActivity: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            quizzes: [8, 6, 5, 5],
            time: [45, 35, 30, 25]
          }
        },
        recentActivity: [
          {
            id: 1,
            type: 'quiz',
            title: 'Advanced Mathematics Quiz',
            score: 85,
            completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            duration: 15
          },
          {
            id: 2,
            type: 'document',
            title: 'Physics Study Notes',
            action: 'uploaded',
            completedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 3,
            type: 'quiz',
            title: 'Chemistry Basics',
            score: 92,
            completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            duration: 12
          },
          {
            id: 4,
            type: 'achievement',
            title: 'Quiz Master',
            description: 'Completed 20 quizzes',
            completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 5,
            type: 'quiz',
            title: 'History Review',
            score: 76,
            completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            duration: 18
          }
        ],
        stats: {
          totalStudyTime: 180,
          averageSessionTime: 25,
          bestStreak: 8,
          totalAchievements: 7,
          accuracyTrend: [72, 75, 78, 80, 79, 82, 78], // Last 7 sessions
          subjectPerformance: [
            { subject: 'Mathematics', score: 85, count: 8 },
            { subject: 'Science', score: 78, count: 6 },
            { subject: 'History', score: 82, count: 5 },
            { subject: 'Literature', score: 75, count: 5 }
          ]
        }
      });
    } finally {
      setLoading(false);
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