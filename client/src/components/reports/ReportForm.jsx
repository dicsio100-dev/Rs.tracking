import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../ui/ToastContext';
import { TaskRow } from './TaskRow';
import { AttachmentUpload } from './AttachmentUpload';
import { StatusBadge } from './StatusBadge';

export const ReportForm = ({ initialDate }) => {
  const [report, setReport] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [status, setStatus] = useState('en_cours');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();

  const isLocked = report?.is_locked === 1;
  const totalTime = tasks.reduce((sum, task) => sum + (Number(task.time_spent) || 0), 0);

  // Charger le rapport du jour
  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      try {
        const res = await api.reports.getAll({ date: initialDate });
        if (res.reports && res.reports.length > 0) {
          // Si un rapport existe pour aujourd'hui, charger ses détails complets
          const fullReport = await api.reports.getById(res.reports[0].id);
          const r = fullReport.report;
          setReport(r);
          setTasks(r.tasks || []);
          setRemarks(r.remarks || '');
          setStatus(r.status || 'en_cours');
        } else {
          // Nouveau rapport vierge
          setReport(null);
          setTasks([{ description: '', time_spent: 0, status: 'en_cours' }]);
          setRemarks('');
          setStatus('en_cours');
        }
      } catch (error) {
        addToast("Erreur lors du chargement du rapport", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [initialDate, addToast]);

  const handleTaskChange = (index, field, value) => {
    const newTasks = [...tasks];
    newTasks[index][field] = value;
    setTasks(newTasks);
  };

  const addTask = () => {
    setTasks([...tasks, { description: '', time_spent: 0, status: 'en_cours' }]);
  };

  const removeTask = (index) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter((_, i) => i !== index));
    } else {
      addToast("Le rapport doit contenir au moins une tâche.", "warning");
    }
  };

  const saveReport = async (submit = false) => {
    // Validation basique
    if (tasks.some(t => !t.description.trim())) {
      addToast("Toutes les tâches doivent avoir une description.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const data = {
        report_date: initialDate,
        status,
        remarks,
        tasks
      };

      let currentReportId = report?.id;

      if (currentReportId) {
        await api.reports.update(currentReportId, data);
        addToast("Brouillon mis à jour avec succès", "success");
      } else {
        const res = await api.reports.create(data);
        setReport(res.report);
        currentReportId = res.report.id;
        addToast("Brouillon créé avec succès", "success");
      }

      if (submit) {
        const confirmSubmit = window.confirm("Attention : Une fois soumis, vous ne pourrez plus modifier ce rapport. Confirmer ?");
        if (confirmSubmit) {
          const res = await api.reports.submit(currentReportId);
          setReport(res.report);
          addToast("Rapport soumis et verrouillé !", "success");
        }
      }
    } catch (error) {
      addToast(error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpload = async (files) => {
    if (!report?.id) {
      addToast("Veuillez d'abord sauvegarder le rapport en brouillon avant d'ajouter des fichiers.", "warning");
      return;
    }

    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }

    try {
      await api.reports.uploadAttachments(report.id, formData);
      // Recharger pour voir les nouveaux fichiers
      const fullReport = await api.reports.getById(report.id);
      setReport(fullReport.report);
      addToast(`${files.length} fichier(s) uploadé(s)`, "success");
    } catch (error) {
      addToast(error.message, "error");
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (window.confirm("Supprimer cette pièce jointe ?")) {
      try {
        await api.reports.deleteAttachment(report.id, attachmentId);
        // Mettre à jour l'état local
        setReport({
          ...report,
          attachments: report.attachments.filter(a => a.id !== attachmentId)
        });
        addToast("Fichier supprimé", "info");
      } catch (error) {
        addToast(error.message, "error");
      }
    }
  };

  if (isLoading) {
    return <div className="report-loading"><span className="loader"></span></div>;
  }

  return (
    <div className={`report-container ${isLocked ? 'locked' : ''}`}>
      <div className="report-header card mb-4">
        <div className="report-meta">
          <h2>Rapport du {new Date(initialDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h2>
          {isLocked ? (
            <div className="locked-badge">✓ SOUMIS</div>
          ) : (
            <div className="draft-badge">✏️ BROUILLON</div>
          )}
        </div>
        
        <div className="report-global-status">
          <label>Statut global de la journée</label>
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            disabled={isLocked}
            className="status-select"
          >
            <option value="en_cours">En cours</option>
            <option value="termine">Terminé</option>
            <option value="bloque">Bloqué</option>
          </select>
          <StatusBadge status={status} />
        </div>
      </div>

      <div className="card mb-4">
        <div className="tasks-header">
          <h3>Tâches Réalisées</h3>
          <div className="total-time">
            Total : <strong>{totalTime} h</strong>
          </div>
        </div>

        <div className="tasks-list">
          {tasks.map((task, index) => (
            <TaskRow
              key={index}
              index={index}
              task={task}
              onChange={handleTaskChange}
              onRemove={removeTask}
              isLocked={isLocked}
            />
          ))}
        </div>

        {!isLocked && (
          <button type="button" className="btn-secondary mt-4" onClick={addTask}>
            + Ajouter une tâche
          </button>
        )}
      </div>

      <div className="grid-2-cols mb-4">
        <div className="card">
          <h3>Remarques / Difficultés</h3>
          <textarea
            className="remarks-input"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            disabled={isLocked}
            placeholder="Informations complémentaires, points bloquants..."
            rows={5}
          />
        </div>

        <div className="card">
          <AttachmentUpload
            attachments={report?.attachments}
            onUpload={handleUpload}
            onDelete={handleDeleteAttachment}
            isLocked={isLocked}
          />
        </div>
      </div>

      {!isLocked && (
        <div className="report-actions card">
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => saveReport(false)}
            disabled={isSaving}
          >
            💾 Sauvegarder (Brouillon)
          </button>
          <button 
            type="button" 
            className="btn-success"
            onClick={() => saveReport(true)}
            disabled={isSaving}
          >
            🚀 SOUMETTRE LE RAPPORT
          </button>
        </div>
      )}
    </div>
  );
};
