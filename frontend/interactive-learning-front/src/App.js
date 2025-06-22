import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import microbitWebSocketService from './services/microbitWebSocket';
import PageTransition from './components/common/PageTransition'; // ADD THIS
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Collections from './pages/Collections';
import QuizTaking from './pages/QuizTaking';
import QuizResults from './pages/QuizResults';
import Quizzes from './pages/Quizzes';
import { MicrobitProvider } from './context/MicrobitContext';
import './styles/globals.css';

// Protected Route component with transitions
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? (
    <PageTransition>
      {children}
    </PageTransition>
  ) : <Navigate to="/login" />;
};

// Auth Route component with transitions
const AuthRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" /> : (
    <PageTransition>
      {children}
    </PageTransition>
  );
};

function App() {
  // Initialize WebSocket connection globally
  useEffect(() => {
    console.log('Initializing global WebSocket connection...');
    microbitWebSocketService.connect();
    
    // Cleanup on app unmount
    return () => {
      microbitWebSocketService.disconnect();
    };
  }, []);

  return (
    <AuthProvider>
      <MicrobitProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Navigate to="/login" />} />
              <Route 
                path="/login" 
                element={
                  <AuthRoute>
                    <LoginForm />
                  </AuthRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <AuthRoute>
                    <RegisterForm />
                  </AuthRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/documents" 
                element={
                  <ProtectedRoute>
                    <Documents />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/collections" 
                element={
                  <ProtectedRoute>
                    <Collections />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/quiz/:quizId" 
                element={
                  <ProtectedRoute>
                    <QuizTaking />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/quiz-results" 
                element={
                  <ProtectedRoute>
                    <QuizResults />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/quizzes" 
                element={
                  <ProtectedRoute>
                    <Quizzes />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </Router>
      </MicrobitProvider>
    </AuthProvider>
  );
}

export default App;