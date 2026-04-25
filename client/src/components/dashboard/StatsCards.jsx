import React from 'react';

export const StatsCards = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'var(--primary-100)', color: 'var(--primary-600)' }}>📄</div>
        <div className="stat-info">
          <span className="stat-value">{stats.total_reports_today}</span>
          <span className="stat-label">Rapports aujourd'hui</span>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'var(--status-complete-bg)', color: 'var(--status-complete-text)' }}>✓</div>
        <div className="stat-info">
          <span className="stat-value">{stats.submitted_today}</span>
          <span className="stat-label">Soumis (Verrouillés)</span>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'var(--status-blocked-bg)', color: 'var(--status-blocked-text)' }}>⏳</div>
        <div className="stat-info">
          <span className="stat-value">{stats.pending_today}</span>
          <span className="stat-label">En attente / Brouillons</span>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'var(--status-progress-bg)', color: 'var(--status-progress-text)' }}>⏱️</div>
        <div className="stat-info">
          <span className="stat-value">{stats.total_hours_today}h</span>
          <span className="stat-label">Heures pointées</span>
        </div>
      </div>
    </div>
  );
};
