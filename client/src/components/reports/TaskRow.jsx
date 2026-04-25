import React from 'react';

export const TaskRow = ({ task, index, onChange, onRemove, isLocked }) => {
  return (
    <div className="task-row animate-fade-in">
      <div className="task-number">{index + 1}</div>
      
      <div className="task-content">
        <div className="task-group flex-grow">
          <label>Description de la tâche</label>
          <textarea
            value={task.description}
            onChange={(e) => onChange(index, 'description', e.target.value)}
            placeholder="Détaillez ce que vous avez accompli..."
            rows={2}
            disabled={isLocked}
            required
          />
        </div>

        <div className="task-meta">
          <div className="task-group">
            <label>Temps (h)</label>
            <input
              type="number"
              step="0.25"
              min="0"
              value={task.time_spent}
              onChange={(e) => onChange(index, 'time_spent', parseFloat(e.target.value) || 0)}
              disabled={isLocked}
              required
            />
          </div>

          <div className="task-group">
            <label>Statut</label>
            <select
              value={task.status}
              onChange={(e) => onChange(index, 'status', e.target.value)}
              disabled={isLocked}
            >
              <option value="en_cours">En cours</option>
              <option value="termine">Terminé</option>
              <option value="bloque">Bloqué</option>
            </select>
          </div>
        </div>
      </div>

      {!isLocked && (
        <button
          type="button"
          className="task-remove-btn"
          onClick={() => onRemove(index)}
          title="Supprimer la tâche"
        >
          ✕
        </button>
      )}
    </div>
  );
};
