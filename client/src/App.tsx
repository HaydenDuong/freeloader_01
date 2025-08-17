import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Login from './components/Auth/Login';
import OrganizerLogin from './components/Auth/OrganizerLogin';
import Register from './components/Auth/Register';
import OrganizerDashboard from './components/Organizer/OrganizerDashboard';
import OrganizerEventEdit from './components/Organizer/OrganizerEventEdit';
import StudentDashboard from './components/Student/StudentDashboard';
import SavedEvents from './components/Student/SavedEvents';
import EditProfile from './components/Student/EditProfile';
import StudentEventDetails from './components/Student/StudentEventDetails';
import LandingPage from './components/LandingPage';
import './App.css';

// Simple top logo bar shown on all pages except the landing page ("/")
const GlobalLogoBar: React.FC = () => {
  const location = useLocation();
  if (location.pathname === '/') return null; // Landing page already has its own header with logo
  return (
    <div className="app-logo-bar">
      <a href="/" className="logo">FreeLoader</a>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <GlobalLogoBar />
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/organizer-login"
              element={
                <PublicRoute>
                  <OrganizerLogin />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Protected routes */}
            <Route
              path="/organizer"
              element={
                <ProtectedRoute requiredRole="organizer">
                  <OrganizerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/event/:id"
              element={
                <ProtectedRoute requiredRole="organizer">
                  <OrganizerEventEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/event/:id"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentEventDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/saved-events"
              element={
                <ProtectedRoute requiredRole="student">
                  <SavedEvents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/edit-profile"
              element={
                <ProtectedRoute requiredRole="student">
                  <EditProfile />
                </ProtectedRoute>
              }
            />

            {/* Landing page */}
            <Route path="/" element={<LandingPage />} />

            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
