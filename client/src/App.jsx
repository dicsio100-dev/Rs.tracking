import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui/ToastContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { ReportPage } from './pages/ReportPage';
import { DashboardPage } from './pages/DashboardPage';
import { AssistantsPage } from './pages/AssistantsPage';
import { LanguagePopup } from './components/ui/LanguagePopup';

// Composant Layout global avec Header
const Layout = ({ children }) => {
  const { user, isAdmin, logout } = useAuth();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language_chosen', 'true');
  };

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
              <Link to="/dashboard" className="nav-link">{t('app.dashboard')}</Link>
              <Link to="/assistants" className="nav-link">{t('app.assistants')}</Link>
            </nav>
          )}
        </div>
        
        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={toggleLanguage} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            {i18n.language === 'fr' ? 'EN' : 'FR'}
          </button>
          <div className="user-badge">
            <span className="user-name">{user?.full_name}</span>
            <span className="user-role">{user?.role}</span>
          </div>
          <button onClick={logout} className="btn-logout">
            {t('app.logout')}
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
        <LanguagePopup />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/reports" element={<Layout><ReportPage /></Layout>} />
            </Route>

            <Route element={<ProtectedRoute requireAdmin={true} />}>
              <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
              <Route path="/assistants" element={<Layout><AssistantsPage /></Layout>} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
