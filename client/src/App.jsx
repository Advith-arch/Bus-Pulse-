import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { MainLayout } from './layouts/MainLayout.jsx';
import { ProtectedRoute } from './layouts/ProtectedRoute.jsx';

import { LandingPage } from './pages/LandingPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { StudentDashboard } from './pages/StudentDashboard.jsx';
import { LiveTrackingPage } from './pages/LiveTrackingPage.jsx';
import { RoutesPage } from './pages/RoutesPage.jsx';
import { NotificationsPage } from './pages/NotificationsPage.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route element={<MainLayout />}>
              {/* Public Pages */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/tracking" element={<LiveTrackingPage />} />
              <Route path="/routes" element={<RoutesPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />

              {/* Student Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
