import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui/ToastContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { ReportPage } from './pages/ReportPage';
import { DashboardPage } from './pages/DashboardPage';

// Composant Layout global avec Header
const Layout = ({ children }) => {
  const { user, isAdmin, logout } = useAuth();
  
  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              background: 'white', 
              padding: '0.2rem', 
              borderRadius: 'var(--radius-md)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '40px',
              height: '40px'
            }}>
              <img src="/logo.png" alt="RS.Tracking Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
            </div>
            <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 600 }}>Tracking</h1>
          </div>
          
          {isAdmin && (
            <nav style={{ display: 'flex', gap: '1rem', marginLeft: '1rem' }}>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
            </nav>
          )}
        </div>
        
        <div className="header-right">
          <div className="user-badge">
            <span className="user-name">{user?.full_name}</span>
            <span className="user-role">{user?.role}</span>
          </div>
          <button onClick={logout} className="btn-logout">
            Déconnexion
          </button>
        </div>
      </header>
      <main className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/reports" element={<Layout><ReportPage /></Layout>} />
            </Route>

            <Route element={<ProtectedRoute requireAdmin={true} />}>
              <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
