import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../components/ui/ToastContext';
import { StatsCards } from '../components/dashboard/StatsCards';
import { FilterBar } from '../components/dashboard/FilterBar';
import { ReportTable } from '../components/dashboard/ReportTable';
import { generateDashboardPDF } from '../services/pdfGenerator';
import '../styles/dashboard.css';

export const DashboardPage = () => {
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
      addToast("Erreur lors du chargement du tableau de bord", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (reportId) => {
    addToast(`Affichage du rapport ${reportId} (Bientôt disponible)`, "info");
  };

  const handleExportPDF = async (reportId) => {
    // Cette fonction sera également migrée si nécessaire, pour l'instant elle prévient l'utilisateur
    addToast("L'export individuel est en cours de migration. Utilisez la synthèse globale en haut !", "info");
  };

  const handleExportGlobalPDF = async () => {
    try {
      addToast("Génération de la synthèse PDF...", "info");
      await generateDashboardPDF(filters);
      addToast("PDF généré avec succès !", "success");
    } catch (err) {
      console.error(err);
      addToast("Échec de l'export PDF", "error");
    }
  };

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h2>Tableau de bord Administrateur</h2>
          <p>Vue d'ensemble de l'activité des assistants</p>
        </div>
        <div className="dashboard-actions">
          <button className="btn-export pdf" onClick={handleExportGlobalPDF} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 6px rgba(239, 68, 68, 0.2)' }}>
            📄 Exporter la synthèse PDF
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
