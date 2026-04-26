import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { useToast } from '../components/ui/ToastContext';
import { StatsCards } from '../components/dashboard/StatsCards';
import { FilterBar } from '../components/dashboard/FilterBar';
import { ReportTable } from '../components/dashboard/ReportTable';
import '../styles/dashboard.css';

export const DashboardPage = () => {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    user_id: '',
    status: ''
  });
  const { addToast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, reportsRes] = await Promise.all([
        api.reports.getStats(),
        api.reports.getAll(filters)
      ]);
      setStats(statsRes.stats);
      setReports(reportsRes.reports);
    } catch (error) {
      addToast(t('errors.fetch_dashboard') || "Error loading dashboard", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (reportId) => {
    addToast(`Affichage du rapport ${reportId} (Bientôt disponible)`, "info");
  };

  const handleExportPDF = async (reportId) => {
    try {
      addToast(t('messages.generating_pdf') || "Generating PDF...", "info");
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.DEV ? '/api' : 'https://rs-tracking.onrender.com/api';
      const response = await fetch(`${API_URL}/export/pdf/${reportId}?lang=${i18n.language}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Erreur PDF");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Rapport_RSTracking_${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (err) {
      addToast(t('errors.pdf_failed') || "PDF export failed", "error");
    }
  };

  const handleExportGlobalPDF = async () => {
    try {
      addToast(t('messages.generating_pdf') || "Generating PDF...", "info");
      const qs = new URLSearchParams({...filters, lang: i18n.language}).toString();
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.DEV ? '/api' : 'https://rs-tracking.onrender.com/api';
      const response = await fetch(`${API_URL}/export/dashboard/pdf?${qs}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Erreur PDF");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Synthese_Rapports_RSTracking.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (err) {
      addToast(t('errors.pdf_failed') || "PDF export failed", "error");
    }
  };

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h2>{t('dashboard.title')}</h2>
          <p>{t('dashboard.subtitle')}</p>
        </div>
        <div className="dashboard-actions">
          <button className="btn-export pdf" onClick={handleExportGlobalPDF} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 6px rgba(239, 68, 68, 0.2)' }}>
            📄 {t('dashboard.export_pdf')}
          </button>
        </div>
      </div>

      <StatsCards stats={stats} />
      
      <FilterBar filters={filters} onFilterChange={setFilters} />
      
      <ReportTable 
        reports={reports} 
        isLoading={isLoading} 
        onViewDetails={handleExportPDF} 
      />
    </div>
  );
};
