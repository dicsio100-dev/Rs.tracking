import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { supabase } from '../lib/supabase';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

export const generateDashboardPDF = async (filters = {}) => {
  try {
    let query = supabase.from('reports').select('*, users!inner(full_name)');
    
    if (filters.user_id) query = query.eq('user_id', filters.user_id);
    if (filters.date) query = query.eq('report_date', filters.date);
    if (filters.status) query = query.eq('status', filters.status);
    
    const { data: reports, error: reportsError } = await query.order('report_date', { ascending: false });
    if (reportsError) throw reportsError;
    
    const tasksMap = {};
    if (reports && reports.length > 0) {
      const reportIds = reports.map(r => r.id);
      const { data: tasks, error: tasksError } = await supabase.from('tasks').select('*').in('report_id', reportIds).order('sort_order');
      if (tasksError) throw tasksError;
      if (tasks) {
        tasks.forEach(t => {
          if (!tasksMap[t.report_id]) tasksMap[t.report_id] = [];
          tasksMap[t.report_id].push(t);
        });
      }
    }
    
    const formattedReports = (reports || []).map(r => ({ ...r, user_name: r.users?.full_name }));
    
    const formattedDate = new Date().toLocaleDateString('fr-FR');
    const statusMap = { 'en_cours': 'En cours', 'termine': 'Terminé', 'bloque': 'Bloqué' };

    const content = [
      { text: 'RS.Tracking - Synthèse d\'Activité Globale', style: 'mainHeader' },
      { text: `Document généré le : ${formattedDate}`, style: 'subtext', margin: [0, 0, 0, 25] }
    ];

    if (!formattedReports || formattedReports.length === 0) {
      content.push({ text: 'Aucun rapport trouvé pour les critères sélectionnés.', italics: true, color: 'gray' });
    } else {
      formattedReports.forEach(report => {
        const reportTasks = tasksMap[report.id] || [];
        const totalTime = reportTasks.reduce((sum, task) => sum + Number(task.time_spent || 0), 0);
        const rDate = new Date(report.report_date).toLocaleDateString('fr-FR');

        content.push({
          table: {
            widths: ['*'],
            body: [
              [
                {
                  columns: [
                    { text: `Assistant : ${report.user_name || 'Inconnu'}`, style: 'reportTitle' },
                    { text: `Date : ${rDate}`, style: 'reportDate', alignment: 'right' }
                  ],
                  fillColor: '#f1f5f9',
                  border: [false, false, false, false],
                  margin: [10, 10, 10, 10]
                }
              ]
            ]
          },
          layout: { defaultBorder: false, paddingLeft: () => 0, paddingRight: () => 0, paddingTop: () => 0, paddingBottom: () => 0 },
          margin: [0, 15, 0, 5]
        });

        content.push({
          text: `Statut du jour : ${statusMap[report.status] || report.status}   |   Temps total pointé : ${totalTime} h   |   Tâches : ${reportTasks.length}`,
          style: 'reportStats',
          margin: [10, 5, 0, 15]
        });

        if (reportTasks.length > 0) {
          const taskBody = [
            [
              { text: 'Description de la tâche', style: 'tableHeader' },
              { text: 'Temps (h)', style: 'tableHeader', alignment: 'center' },
              { text: 'Statut', style: 'tableHeader', alignment: 'center' }
            ]
          ];
          
          reportTasks.forEach(t => {
            taskBody.push([
              { text: t.description, fontSize: 10 },
              { text: t.time_spent.toString(), alignment: 'center', fontSize: 10 },
              { text: statusMap[t.status] || t.status, alignment: 'center', fontSize: 10 }
            ]);
          });

          content.push({
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto'],
              body: taskBody
            },
            layout: 'lightHorizontalLines',
            margin: [10, 0, 10, 15]
          });
        } else {
          content.push({ text: 'Aucune tâche renseignée pour cette journée.', italics: true, fontSize: 10, color: 'gray', margin: [10, 0, 0, 15] });
        }

        if (report.remarks) {
          content.push({ text: 'Remarques / Difficultés :', style: 'remarksHeader', margin: [10, 0, 0, 5] });
          content.push({ text: report.remarks, style: 'remarksContent', margin: [10, 0, 10, 20] });
        } else {
          content.push({ text: '', margin: [0, 0, 0, 15] }); 
        }
        
        content.push({
          canvas: [ { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#cbd5e1' } ],
          margin: [0, 10, 0, 15]
        });
      });
    }

    const docDefinition = {
      content: content,
      styles: {
        mainHeader: { fontSize: 22, bold: true, color: '#0f172a' },
        subtext: { fontSize: 10, color: '#64748b' },
        reportTitle: { fontSize: 13, bold: true, color: '#1e3a5f' },
        reportDate: { fontSize: 12, bold: true, color: '#3b82f6' },
        reportStats: { fontSize: 10, bold: true, color: '#475569' },
        tableHeader: { bold: true, fontSize: 10, color: '#0f172a', fillColor: '#e2e8f0', margin: [0, 4, 0, 4] },
        remarksHeader: { fontSize: 10, bold: true, color: '#b91c1c' },
        remarksContent: { fontSize: 10, color: '#334155', italics: true }
      },
      defaultStyle: { font: 'Helvetica', fontSize: 10, color: '#334155' }
    };

    pdfMake.createPdf(docDefinition).download('Synthese_Rapports_RSTracking.pdf');
    return true;
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw error;
  }
};
