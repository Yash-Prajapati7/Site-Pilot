import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import LoginIAM from './pages/LoginIAM';
import Register from './pages/Register';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Websites from './pages/Websites';
import WebsiteDetail from './pages/WebsiteDetail';
import Builder from './pages/Builder';
import Versions from './pages/Versions';
import Branding from './pages/Branding';
import Domains from './pages/Domains';
import Deployments from './pages/Deployments';
import Team from './pages/Team';
import Analytics from './pages/Analytics';
import Billing from './pages/Billing';

export default function App() {
  return (
    <AuthProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-surface, #18181b)',
            color: 'var(--text-high, #ffffff)',
            border: '1px solid var(--border-color, #27272a)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            borderRadius: '6px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/iam" element={<LoginIAM />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="websites" element={<Websites />} />
          <Route path="websites/:id" element={<WebsiteDetail />} />
          <Route path="websites/:id/builder" element={<ProtectedRoute minRole="editor"><Builder /></ProtectedRoute>} />
          <Route path="websites/:id/versions" element={<Versions />} />
          <Route path="branding" element={<ProtectedRoute minRole="editor"><Branding /></ProtectedRoute>} />
          <Route path="domains" element={<ProtectedRoute minRole="admin"><Domains /></ProtectedRoute>} />
          <Route path="deployments" element={<ProtectedRoute minRole="admin"><Deployments /></ProtectedRoute>} />
          <Route path="team" element={<ProtectedRoute minRole="admin"><Team /></ProtectedRoute>} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="billing" element={<ProtectedRoute minRole="admin"><Billing /></ProtectedRoute>} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
