const { supabase } = require('../config/database');
const { generateReportPDF, generateDashboardPDF } = require('../services/pdfService');

async function exportSinglePdf(req, res) {
  try {
    const pdfBuffer = await generateReportPDF(req.params.id);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Rapport_RS_Tracking_${req.params.id}.pdf`);
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la génération du PDF" });
  }
}

async function exportDashboardPdf(req, res) {
  try {
    const { date, user_id, status, from, to } = req.query;
    let query = supabase.from('reports').select('*, users!inner(full_name)');
    
    if (user_id) query = query.eq('user_id', user_id);
    if (date) query = query.eq('report_date', date);
    if (status) query = query.eq('status', status);
    if (from) query = query.gte('report_date', from);
    if (to) query = query.lte('report_date', to);
    
    const { data: reports } = await query.order('report_date', { ascending: false });
    
    const tasksMap = {};
    if (reports && reports.length > 0) {
      const reportIds = reports.map(r => r.id);
      const { data: tasks } = await supabase.from('tasks').select('*').in('report_id', reportIds).order('sort_order');
      if (tasks) {
        tasks.forEach(t => {
          if (!tasksMap[t.report_id]) tasksMap[t.report_id] = [];
          tasksMap[t.report_id].push(t);
        });
      }
    }
    
    const formattedReports = (reports || []).map(r => ({ ...r, user_name: r.users?.full_name }));
    const pdfBuffer = await generateDashboardPDF(formattedReports, tasksMap);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Synthese_Rapports_RSTracking.pdf`);
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la génération de la synthèse PDF" });
  }
}

module.exports = { exportSinglePdf, exportDashboardPdf };
