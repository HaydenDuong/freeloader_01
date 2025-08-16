import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Login from './components/Auth/Login';
import OrganizerLogin from './components/Auth/OrganizerLogin';
import Register from './components/Auth/Register';
import OrganizerDashboard from './components/Organizer/OrganizerDashboard';
import StudentDashboard from './components/Student/StudentDashboard';
import SavedEvents from './components/Student/SavedEvents';
import StudentEventDetails from './components/Student/StudentEventDetails';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
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

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
