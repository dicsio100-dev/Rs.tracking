const { supabase } = require('../config/database');
const fs = require('fs');
const path = require('path');
const { UPLOAD_DIR } = require('../middleware/upload');

async function getReports(req, res) {
  const { date, user_id, status, from, to } = req.query;
  let query = supabase.from('reports').select('*, users!inner(full_name, username), tasks(id, time_spent)');
  
  if (req.user.role !== 'admin') query = query.eq('user_id', req.user.id);
  else if (user_id) query = query.eq('user_id', user_id);
  
  if (date) query = query.eq('report_date', date);
  if (status) query = query.eq('status', status);
  if (from) query = query.gte('report_date', from);
  if (to) query = query.lte('report_date', to);
  
  const { data: reports, error } = await query.order('report_date', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });

  const formatted = reports.map(r => {
    const taskCount = r.tasks ? r.tasks.length : 0;
    const totalTime = r.tasks ? r.tasks.reduce((sum, t) => sum + Number(t.time_spent || 0), 0) : 0;
    return {
      ...r,
      user_name: r.users?.full_name,
      username: r.users?.username,
      task_count: taskCount,
      total_time: totalTime,
      tasks: undefined,
      users: undefined
    };
  });
  res.json({ reports: formatted });
}

async function getReportById(req, res) {
  const { data: report, error } = await supabase.from('reports').select('*, users!inner(full_name, username)').eq('id', req.params.id).single();
  if (!report || error) return res.status(404).json({ error: 'Rapport non trouvé.' });
  if (req.user.role !== 'admin' && report.user_id !== req.user.id) return res.status(403).json({ error: 'Accès interdit.' });

  const { data: tasks } = await supabase.from('tasks').select('*').eq('report_id', report.id).order('sort_order');
  const { data: attachments } = await supabase.from('attachments').select('*').eq('report_id', report.id);

  const formatted = { ...report, user_name: report.users?.full_name, username: report.users?.username, tasks: tasks || [], attachments: attachments || [], users: undefined };
  res.json({ report: formatted });
}

async function createReport(req, res) {
  const { report_date, status, remarks, tasks } = req.body;
  const date = report_date || new Date().toISOString().split('T')[0];

  const { data: existing } = await supabase.from('reports').select('*').eq('user_id', req.user.id).eq('report_date', date).single();
  if (existing) {
    if (existing.is_locked) return res.status(403).json({ error: 'Ce rapport est verrouillé.' });
    return res.status(409).json({ error: 'Un rapport existe déjà pour cette date.', report_id: existing.id });
  }

  const { data: report, error } = await supabase.from('reports').insert({ user_id: req.user.id, report_date: date, status: status || 'en_cours', remarks }).select().single();
  if (error) return res.status(500).json({ error: error.message });

  if (tasks && tasks.length) {
    const taskInserts = tasks.map((t, i) => ({ report_id: report.id, description: t.description, time_spent: t.time_spent || 0, status: t.status || 'en_cours', sort_order: i }));
    await supabase.from('tasks').insert(taskInserts);
  }

  const { data: savedTasks } = await supabase.from('tasks').select('*').eq('report_id', report.id).order('sort_order');
  res.status(201).json({ message: 'Rapport créé.', report: { ...report, tasks: savedTasks || [] } });
}

async function updateReport(req, res) {
  const { data: report } = await supabase.from('reports').select('*').eq('id', req.params.id).single();
  if (!report) return res.status(404).json({ error: 'Rapport non trouvé.' });
  if (report.is_locked) return res.status(403).json({ error: 'Ce rapport est verrouillé.' });
  if (req.user.role !== 'admin' && report.user_id !== req.user.id) return res.status(403).json({ error: 'Accès interdit.' });

  const { status, remarks, tasks } = req.body;
  const { data: updatedReport } = await supabase.from('reports').update({ status: status || report.status, remarks }).eq('id', report.id).select().single();
  
  if (tasks && tasks.length) {
    await supabase.from('tasks').delete().eq('report_id', report.id);
    const taskInserts = tasks.map((t, i) => ({ report_id: report.id, description: t.description, time_spent: t.time_spent || 0, status: t.status || 'en_cours', sort_order: i }));
    await supabase.from('tasks').insert(taskInserts);
  }

  const { data: savedTasks } = await supabase.from('tasks').select('*').eq('report_id', report.id).order('sort_order');
  res.json({ message: 'Rapport mis à jour.', report: { ...updatedReport, tasks: savedTasks || [] } });
}

async function submitReport(req, res) {
  const { data: report } = await supabase.from('reports').select('*').eq('id', req.params.id).single();
  if (!report) return res.status(404).json({ error: 'Rapport non trouvé.' });
  if (report.is_locked) return res.status(400).json({ error: 'Rapport déjà soumis.' });

  const { count } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('report_id', report.id);
  if (count === 0) return res.status(400).json({ error: 'Ajoutez au moins une tâche avant de soumettre.' });

  const { data: updated } = await supabase.from('reports').update({ is_locked: true }).eq('id', report.id).select().single();
  res.json({ message: 'Rapport soumis et verrouillé.', report: updated });
}

async function unlockReport(req, res) {
  await supabase.from('reports').update({ is_locked: false }).eq('id', req.params.id);
  res.json({ message: 'Rapport déverrouillé.' });
}

async function uploadAttachments(req, res) {
  const { data: report } = await supabase.from('reports').select('*').eq('id', req.params.id).single();
  if (!report || report.is_locked) return res.status(403).json({ error: 'Rapport verrouillé ou non trouvé.' });

  const attachments = req.files.map(f => ({ report_id: report.id, original_name: f.originalname, stored_name: f.filename, file_size: f.size }));
  await supabase.from('attachments').insert(attachments);
  res.status(201).json({ message: 'Fichiers uploadés.', attachments });
}

async function deleteAttachment(req, res) {
  const { data: att } = await supabase.from('attachments').select('*').eq('id', req.params.attachmentId).eq('report_id', req.params.id).single();
  if (!att) return res.status(404).json({ error: 'Pièce jointe non trouvée.' });
  
  const filePath = path.join(UPLOAD_DIR, att.stored_name);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  
  await supabase.from('attachments').delete().eq('id', att.id);
  res.json({ message: 'Pièce jointe supprimée.' });
}

async function getStats(req, res) {
  const today = new Date().toISOString().split('T')[0];
  
  const { count: totalToday } = await supabase.from('reports').select('*', { count: 'exact', head: true }).eq('report_date', today);
  const { count: submittedToday } = await supabase.from('reports').select('*', { count: 'exact', head: true }).eq('report_date', today).eq('is_locked', true);
  const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_active', true).eq('role', 'assistant');
  
  const { data: tasks } = await supabase.from('tasks').select('time_spent, reports!inner(report_date)').eq('reports.report_date', today);
  const totalTime = tasks ? tasks.reduce((sum, t) => sum + Number(t.time_spent || 0), 0) : 0;

  const { data: reports } = await supabase.from('reports').select('status').eq('report_date', today);
  const byStatus = reports ? reports.reduce((acc, r) => {
    const existing = acc.find(a => a.status === r.status);
    if (existing) existing.count++; else acc.push({ status: r.status, count: 1 });
    return acc;
  }, []) : [];

  res.json({
    stats: {
      today, total_reports_today: totalToday || 0, submitted_today: submittedToday || 0,
      pending_today: (totalUsers || 0) - (submittedToday || 0), total_active_assistants: totalUsers || 0,
      total_hours_today: Math.round(totalTime * 10) / 10, by_status: byStatus
    }
  });
}

module.exports = { getReports, getReportById, createReport, updateReport, submitReport, unlockReport, uploadAttachments, deleteAttachment, getStats };
