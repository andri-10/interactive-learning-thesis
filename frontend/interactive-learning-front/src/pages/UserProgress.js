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

  // Helper functions to extract and format data
  const extractWeeklyProgress = (monthlyProgress) => {
    if (!monthlyProgress) return [0, 0, 0, 0, 0, 0, 0];
    
    // Extract last 7 days from monthly progress
    const recent = Object.values(monthlyProgress).slice(-7);
    return recent.map(item => item?.averageAccuracy || 0);
  };
  
  const extractMonthlyActivity = (monthlyProgress) => {
    if (!monthlyProgress) return {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      quizzes: [0, 0, 0, 0],
      time: [0, 0, 0, 0]
    };
    
    const entries = Object.entries(monthlyProgress).slice(-4);
    return {
      labels: entries.map(([key]) => key),
      quizzes: entries.map(([, value]) => value?.quizCount || 0),
      time: entries.map(([, value]) => Math.round((value?.totalTime || 0) / 60))
    };
  };
  
  const extractSubjectPerformance = (quizPerformance) => {
    if (!quizPerformance) return [];
    
    return Object.entries(quizPerformance).map(([subject, data]) => ({
      subject: subject,
      score: Math.round(data?.averageScore || 0),
      count: data?.quizCount || 0
    }));
  };
  
  const extractAccuracyTrend = (progressList) => {
    if (!progressList || progressList.length === 0) return [];
    
    // Get last 7 quiz scores
    return progressList
      .slice(-7)
      .map(progress => progress.score || 0);
  };
  
  const formatProgressAsActivity = (progress) => {
    return {
      id: progress.id,
      type: 'quiz_completed',
      title: progress.quiz?.title || 'Quiz',
      description: `Completed with ${progress.score || 0}% score`,
      score: progress.score || 0,
      completedAt: progress.completedAt,
      duration: Math.round((progress.completionTimeSeconds || 0) / 60),
      action: 'completed'
    };
  };

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('=== FRONTEND API DEBUG ===');
      console.log('Token in localStorage:', localStorage.getItem('token'));
      console.log('Current user:', user);
      
      // First test - check if authentication is working with debug endpoint
      console.log('Testing authentication with debug endpoint...');
      try {
        const debugResponse = await api.get('/progress/debug');
        console.log('✅ Authentication working:', debugResponse.data);
      } catch (debugError) {
        console.log('❌ Debug endpoint failed:', debugError.response?.status, debugError.response?.data);
        
        // If debug fails, authentication is broken - try to re-login
        if (debugError.response?.status === 403) {
          setError('Authentication expired. Please log in again.');
          // Optionally redirect to login
          // setTimeout(() => window.location.href = '/login', 3000);
          return;
        }
      }
      
      // Start with basic progress endpoint that we know exists
      console.log('Testing basic /api/progress endpoint...');
      const basicProgressResponse = await api.get('/progress');
      console.log('✅ Basic progress successful:', basicProgressResponse.data);
      
      // Get stats data which we know works
      console.log('Getting stats data...');
      const statsResponse = await api.get('/progress/stats');
      console.log('✅ Stats successful:', statsResponse.data);
      
      // Try optional endpoints
      const [dashboardResponse, recentResponse] = await Promise.allSettled([
        api.get('/progress/dashboard'),
        api.get('/progress/recent?limit=10')
      ]);
      
      // Build dashboard data from stats and basic progress
      const progressList = basicProgressResponse.data || [];
      const statsData = statsResponse.data || {};
      
      const dashboardData = {
        totalQuizzes: statsData.totalAttempts || progressList.length || 0,
        averageScore: Math.round(statsData.averageAccuracy || 0),
        totalTime: Math.round((statsData.averageCompletionTime || 0) / 60), // convert seconds to minutes
        streak: 0, // Not available in current stats
        level: statsData.totalAttempts > 20 ? 'Advanced' : 
               statsData.totalAttempts > 10 ? 'Intermediate' : 'Beginner',
        achievements: Math.floor(statsData.totalAttempts / 5), // 1 achievement per 5 quizzes
        completionRate: Math.round(statsData.averageAccuracy || 0),
        studyProgress: Math.min(100, Math.round((statsData.totalAttempts || 0) * 10)), // Progress based on attempts
        studyGoal: 30,
        weeklyProgress: extractWeeklyProgress(statsData.monthlyProgress) || [0, 0, 0, 0, 0, 0, 0],
        monthlyActivity: extractMonthlyActivity(statsData.monthlyProgress) || {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          quizzes: [0, 0, 0, 0],
          time: [0, 0, 0, 0]
        }
      };
      
      // Build response from available data
      const combinedData = {
        dashboard: dashboardData,
        stats: {
          subjectPerformance: extractSubjectPerformance(statsData.quizPerformance) || [],
          accuracyTrend: extractAccuracyTrend(progressList) || [],
          avgAccuracy: statsData.averageAccuracy || 0,
          totalAttempts: statsData.totalAttempts || 0,
          monthlyProgress: statsData.monthlyProgress || {}
        },
        recentActivity: progressList.slice(0, 10).map(formatProgressAsActivity) || []
      };
      
      // Handle optional dashboard endpoint if it returns different data
      if (dashboardResponse.status === 'fulfilled') {
        console.log('✅ Dashboard API successful:', dashboardResponse.value.data);
        const backendDashboard = dashboardResponse.value.data;
        
        // Merge with our calculated dashboard, preferring backend data
        combinedData.dashboard = {
          ...dashboardData,
          ...backendDashboard,
          // Ensure numeric values
          totalQuizzes: backendDashboard.totalQuizzes || dashboardData.totalQuizzes,
          averageScore: Math.round(backendDashboard.averageScore || dashboardData.averageScore),
          totalTime: Math.round((backendDashboard.totalTime || dashboardData.totalTime * 60) / 60)
        };
      }
      
      // Handle recent activity
      if (recentResponse.status === 'fulfilled') {
        console.log('✅ Recent API successful:', recentResponse.value.data);
        combinedData.recentActivity = recentResponse.value.data;
      } else {
        console.log('❌ Recent API failed:', recentResponse.reason?.response?.status);
        // Use formatted progress data as recent activity
      }
      
      setProgressData(combinedData);
      setError('');
      return; // Success - exit here
      
    } catch (error) {
      console.error('❌ All API calls failed, using mock data:', error);
      setError('Unable to load live data from server');
      
      // Set comprehensive mock data when API fails
      const mockData = {
        dashboard: {
          totalQuizzes: 24,
          averageScore: 82.5,
          totalTime: 360, // minutes
          streak: 5,
          level: 'Intermediate',
          achievements: 8,
          completionRate: 87.3,
          studyProgress: 65,
          studyGoal: 30,
          weeklyProgress: [85, 78, 92, 76, 88, 94, 82],
          monthlyActivity: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            quizzes: [6, 8, 5, 7],
            time: [120, 180, 90, 150]
          }
        },
        stats: {
          subjectPerformance: [
            { subject: 'Mathematics', score: 85, count: 8 },
            { subject: 'Physics', score: 78, count: 6 },
            { subject: 'Chemistry', score: 82, count: 5 },
            { subject: 'History', score: 88, count: 5 }
          ],
          accuracyTrend: [75, 80, 85, 82, 88, 91, 87]
        },
        recentActivity: [
          {
            id: 1,
            type: 'quiz_completed',
            title: 'Advanced Mathematics Quiz',
            description: 'Completed with 85% score',
            score: 85,
            completedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            duration: 15,
            action: 'completed'
          },
          {
            id: 2,
            type: 'document_uploaded',
            title: 'Physics Study Notes',
            description: 'Uploaded new study material',
            completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            action: 'uploaded'
          },
          {
            id: 3,
            type: 'achievement_earned',
            title: 'Quiz Master',
            description: 'Completed 20 quizzes',
            completedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            action: 'earned'
          },
          {
            id: 4,
            type: 'quiz_completed',
            title: 'Chemistry Basics',
            description: 'Completed with 76% score',
            score: 76,
            completedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            duration: 18,
            action: 'completed'
          },
          {
            id: 5,
            type: 'collection_created',
            title: 'Science Materials',
            description: 'Created new study collection',
            completedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            action: 'created'
          }
        ]
      };
      
      setProgressData(mockData);
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