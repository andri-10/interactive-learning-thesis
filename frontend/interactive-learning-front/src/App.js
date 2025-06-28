import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MicrobitProvider } from './context/MicrobitContext';
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';
import PageTransition from './components/common/PageTransition';

// Auth Components
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';

// Main Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Collections from './pages/Collections';
import Quizzes from './pages/Quizzes';
import QuizTaking from './pages/QuizTaking';
import QuizResults from './pages/QuizResults';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminContent from './pages/AdminContent';
import AdminLogs from './pages/AdminLogs';
import AdminSecurity from './pages/AdminSecurity';

// User Progress Page
import UserProgress from './pages/UserProgress';


import './styles/globals.css';

// Simple PrivateRoute component for authenticated routes
const PrivateRouteWrapper = ({ children }) => {
  // For now, we'll assume PrivateRoute exists or create a simple version
  return children; // You can implement proper auth checking here
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <MicrobitProvider>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />

              {/* Protected User Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRouteWrapper>
                    <PageTransition>
                      <Dashboard />
                    </PageTransition>
                  </PrivateRouteWrapper>
                } 
              />
              <Route 
                path="/documents" 
                element={
                  <PrivateRouteWrapper>
                    <PageTransition>
                      <Documents />
                    </PageTransition>
                  </PrivateRouteWrapper>
                } 
              />
              <Route 
                path="/collections" 
                element={
                  <PrivateRouteWrapper>
                    <PageTransition>
                      <Collections />
                    </PageTransition>
                  </PrivateRouteWrapper>
                } 
              />
              <Route 
                path="/quizzes" 
                element={
                  <PrivateRouteWrapper>
                    <PageTransition>
                      <Quizzes />
                    </PageTransition>
                  </PrivateRouteWrapper>
                } 
              />
              <Route 
                path="/quiz/:quizId" 
                element={
                  <PrivateRouteWrapper>
                    <PageTransition>
                      <QuizTaking />
                    </PageTransition>
                  </PrivateRouteWrapper>
                } 
              />
              <Route 
                path="/quiz-results" 
                element={
                  <PrivateRouteWrapper>
                    <PageTransition>
                      <QuizResults />
                    </PageTransition>
                  </PrivateRouteWrapper>
                } 
              />
              <Route 
                path="/progress" 
                element={
                  <PrivateRouteWrapper>
                    <PageTransition>
                      <UserProgress />
                    </PageTransition>
                  </PrivateRouteWrapper>
                } 
              />

              {/* Admin Routes - Protected by AdminRoute */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <AdminRoute>
                    <PageTransition>
                      <AdminDashboard />
                    </PageTransition>
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <AdminRoute>
                    <PageTransition>
                      <AdminUsers />
                    </PageTransition>
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/content" 
                element={
                  <AdminRoute>
                    <PageTransition>
                      <AdminContent />
                    </PageTransition>
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/logs" 
                element={
                  <AdminRoute>
                    <PageTransition>
                      <AdminLogs />
                    </PageTransition>
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/security" 
                element={
                  <AdminRoute>
                    <PageTransition>
                      <AdminSecurity />
                    </PageTransition>
                  </AdminRoute>
                } 
              />
              
              {/* Catch all route - redirect to dashboard if authenticated, otherwise to landing */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </MicrobitProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;