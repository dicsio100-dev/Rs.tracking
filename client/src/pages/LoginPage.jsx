import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastContext';
import './Login.css';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  useEffect(() => {
    // Si déjà connecté, rediriger
    if (isAuthenticated) {
      navigate(isAdmin ? '/dashboard' : '/reports');
    }
    
    // Gérer l'expiration de session depuis l'URL
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      addToast('Votre session a expiré. Veuillez vous reconnecter.', 'warning');
      // Nettoyer l'URL
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
      // La redirection se fera via le useEffect une fois l'état mis à jour
    } else {
      addToast(result.error || 'Identifiants incorrects', 'error');
    }
  };

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
          <h1>RS.Tracking</h1>
          <p>Plateforme de rapport d'activité</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Identifiant</label>
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
            <label htmlFor="password">Mot de passe</label>
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
            {isLoading ? (
              <span className="loader"></span>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Accès réservé au personnel autorisé.</p>
        </div>
      </div>
    </div>
  );
};
