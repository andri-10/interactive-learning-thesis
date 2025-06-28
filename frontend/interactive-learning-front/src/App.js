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
                  <PrivateRoute>
                    <PageTransition>
                      <Dashboard />
                    </PageTransition>
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/documents" 
                element={
                  <PrivateRoute>
                    <PageTransition>
                      <Documents />
                    </PageTransition>
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/collections" 
                element={
                  <PrivateRoute>
                    <PageTransition>
                      <Collections />
                    </PageTransition>
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/quizzes" 
                element={
                  <PrivateRoute>
                    <PageTransition>
                      <Quizzes />
                    </PageTransition>
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/quiz/:quizId" 
                element={
                  <PrivateRoute>
                    <PageTransition>
                      <QuizTaking />
                    </PageTransition>
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/quiz-results" 
                element={
                  <PrivateRoute>
                    <PageTransition>
                      <QuizResults />
                    </PageTransition>
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/progress" 
                element={
                  <PrivateRoute>
                    <PageTransition>
                      <UserProgress />
                    </PageTransition>
                  </PrivateRoute>
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