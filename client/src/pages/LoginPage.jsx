import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastContext';
import { api } from '../services/api';

export const LoginPage = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetUsername, setResetUsername] = useState('');
  
  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/dashboard' : '/reports');
    }
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      addToast('Votre session a expiré. Veuillez vous reconnecter.', 'warning');
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, location, addToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      addToast('Veuillez remplir tous les champs.', 'error');
      return;
    }
    setIsLoading(true);
    const result = await login(username, password);
    setIsLoading(false);
    
    if (result.success) {
      addToast('Connexion réussie', 'success');
    } else {
      addToast(result.error || 'Identifiants incorrects', 'error');
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!resetUsername.trim()) return;
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { username: resetUsername });
      addToast('Si cet identifiant existe en tant qu\'administrateur, de nouveaux accès ont été envoyés par email.', 'success');
      setShowForgot(false);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgot) {
    return (
      <div className="login-container">
        <div className="login-background">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        
        <div className="login-card animate-fade-in">
          <div className="login-header">
            <div className="logo-placeholder" style={{ background: 'white', padding: '5px' }}>
              <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
            </div>
            <h1>{t('login.reset_title')}</h1>
            <p>{t('login.reset_desc')}</p>
          </div>

          <form onSubmit={handleForgotSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="reset-username">{t('login.username')}</label>
              <input 
                id="reset-username"
                type="text" 
                value={resetUsername}
                onChange={(e) => setResetUsername(e.target.value)}
                placeholder="Ex: admin"
                disabled={isLoading}
              />
            </div>
            
            <button 
              type="submit" 
              className={`btn-primary ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? <span className="loader"></span> : t('login.reset_submit')}
            </button>
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => setShowForgot(false)}
              disabled={isLoading}
              style={{ marginTop: '1rem' }}
            >
              {t('login.reset_back')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      
      <div className="login-card animate-fade-in">
        <div className="login-header">
          <div className="logo-placeholder" style={{ background: 'white', padding: '5px' }}>
            <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
          </div>
          <h1>{t('app.title')}</h1>
          <p>{t('login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">{t('login.username')}</label>
            <input 
              id="username"
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ex: marie.dupont"
              autoComplete="username"
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="password">{t('login.password')}</label>
              <button 
                type="button" 
                onClick={() => setShowForgot(true)}
                style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}
              >
                {t('login.forgot_password')}
              </button>
            </div>
            <input 
              id="password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className={`btn-primary ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? <span className="loader"></span> : t('login.submit')}
          </button>
        </form>
        
        <div className="login-footer">
          <p>{t('login.restricted')}</p>
        </div>
      </div>
    </div>
  );
};
