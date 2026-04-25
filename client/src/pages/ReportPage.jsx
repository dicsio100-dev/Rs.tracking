import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ReportForm } from '../components/reports/ReportForm';
import '../styles/report.css';

export const ReportPage = () => {
  const { user, logout } = useAuth();
  // Par défaut, le rapport d'aujourd'hui
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <div className="app-layout">
      {/* Sidebar / Header temporaire */}
      <header className="app-header" style={{
        background: 'linear-gradient(to right, var(--primary-900), var(--primary-800))',
        color: 'white',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '0.5rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: '800'
          }}>RS</div>
          <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 600 }}>Rapport d'Activité</h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.full_name}</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase' }}>{user?.role}</span>
          </div>
          <button 
            onClick={logout}
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <input 
            type="date" 
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--gray-300)',
              fontWeight: 600,
              color: 'var(--primary-700)',
              boxShadow: 'var(--shadow-sm)'
            }}
          />
        </div>
        
        {/* Le cœur du formulaire */}
        <ReportForm initialDate={currentDate} />
      </main>
    </div>
  );
};
