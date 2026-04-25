import React from 'react';

export const StatusBadge = ({ status }) => {
  let label = '';
  let className = '';

  switch (status) {
    case 'en_cours':
      label = 'En cours';
      className = 'badge-progress';
      break;
    case 'termine':
      label = 'Terminé';
      className = 'badge-complete';
      break;
    case 'bloque':
      label = 'Bloqué';
      className = 'badge-blocked';
      break;
    default:
      label = 'Inconnu';
      className = 'badge-default';
  }

  return (
    <span className={`status-badge ${className}`}>
      {label}
    </span>
  );
};
