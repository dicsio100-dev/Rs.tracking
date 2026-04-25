import React from 'react';
import { StatusBadge } from '../reports/StatusBadge';

export const ReportTable = ({ reports, isLoading, onViewDetails }) => {
  if (isLoading) {
    return <div className="card text-center p-8"><span className="loader"></span></div>;
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="card text-center p-8 empty-state">
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
        <h3>Aucun rapport trouvé</h3>
        <p>Il n'y a pas de rapports correspondant à ces critères.</p>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  return (
    <div className="card table-container">
      <table className="report-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Assistant</th>
            <th>Statut</th>
            <th>Tâches</th>
            <th>Temps total</th>
            <th>État</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td className="font-medium">{formatDate(report.report_date)}</td>
              <td>
                <div className="user-cell">
                  <div className="user-avatar">{report.user_name.charAt(0)}</div>
                  {report.user_name}
                </div>
              </td>
              <td><StatusBadge status={report.status} /></td>
              <td className="text-center">{report.task_count}</td>
              <td className="text-center font-medium">{report.total_time} h</td>
              <td>
                {report.is_locked ? (
                  <span className="badge-locked-small">SOUMIS</span>
                ) : (
                  <span className="badge-draft-small">BROUILLON</span>
                )}
              </td>
              <td>
                <button 
                  className="btn-text-primary"
                  onClick={() => onViewDetails(report.id)}
                >
                  Voir détail
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
