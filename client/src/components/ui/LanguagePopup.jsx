import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const LanguagePopup = () => {
  const { i18n } = useTranslation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if the user has already made a choice
    const hasChosen = localStorage.getItem('language_chosen');
    if (!hasChosen) {
      setShow(true);
      // Fallback to English by default immediately in the background
      i18n.changeLanguage('en');
    }
  }, [i18n]);

  const chooseLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language_chosen', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(15, 23, 42, 0.85)', 
      zIndex: 9999, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backdropFilter: 'blur(4px)'
    }}>
      <div className="card animate-fade-in" style={{ 
        width: '400px', 
        maxWidth: '90%', 
        textAlign: 'center', 
        background: 'white', 
        padding: '2.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>
          Welcome / Bienvenue
        </h2>
        <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: '1.6' }}>
          Please select your preferred language.<br/>
          Veuillez choisir votre langue de préférence.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            className="btn-primary" 
            style={{ flex: 1, padding: '0.75rem' }} 
            onClick={() => chooseLanguage('en')}
          >
            English
          </button>
          <button 
            className="btn-secondary" 
            style={{ flex: 1, padding: '0.75rem' }} 
            onClick={() => chooseLanguage('fr')}
          >
            Français
          </button>
        </div>
      </div>
    </div>
  );
};
