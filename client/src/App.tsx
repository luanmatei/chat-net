import { ReactNode } from "react";
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/auth/LoginPage.tsx';
import RegisterPage from './components/auth/RegisterPage.tsx';
import ChatPage from './components/chat/ChatPage.tsx';
import { UsersPage } from './components/admin/UsersPage.tsx';
import { UsageStatsPage } from './components/admin/UsageStatsPage.tsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { SocketProvider } from './contexts/SocketContext.tsx';
import { Spinner, Center } from '@chakra-ui/react';

// Loading component
function LoadingScreen() {
  return (
    <Center height="100vh">
      <Spinner size="xl" />
    </Center>
  );
}

// Component to protect routes that require authentication
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

// Component for routes accessible only when not authenticated
function PublicRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return !user ? <>{children}</> : <Navigate to="/chat" replace />;
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Routes>
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/usage" 
            element={
              <ProtectedRoute>
                <UsageStatsPage />
              </ProtectedRoute>
            }
          />
          {/* Redirect root path based on auth state */}
          <Route 
            path="/" 
            element={
              <AuthRedirect />
            }
          />
          {/* Fallback for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} /> 
        </Routes>
      </SocketProvider>
    </AuthProvider>
  );
}

// Helper component to redirect from root based on auth status
function AuthRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return user ? <Navigate to="/chat" replace /> : <Navigate to="/login" replace />;
}

export default App;