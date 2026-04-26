const PdfPrinter = require('pdfmake');
const { supabase } = require('../config/database');

const fonts = {
  Helvetica: { normal: 'Helvetica', bold: 'Helvetica-Bold', italics: 'Helvetica-Oblique', bolditalics: 'Helvetica-BoldOblique' }
};

const translations = {
  en: {
    report_title: 'RS.Tracking - Daily Report',
    dashboard_title: 'RS.Tracking - Global Activity Summary',
    generated_on: 'Document generated on:',
    assistant: 'Assistant:',
    date: 'Date:',
    global_status: 'Global status:',
    total_time: 'Total tracked time:',
    tasks_count: 'Tasks:',
    completed_tasks: 'Completed Tasks',
    description: 'Description',
    time: 'Time (h)',
    status: 'Status',
    remarks: 'Remarks / Difficulties',
    no_reports: 'No reports found for the selected criteria.',
    no_tasks: 'No tasks recorded for this day.',
    status_map: { 'en_cours': 'In Progress', 'termine': 'Completed', 'bloque': 'Blocked' }
  },
  fr: {
    report_title: 'RS.Tracking - Rapport Quotidien',
    dashboard_title: 'RS.Tracking - Synthèse d\'Activité Globale',
    generated_on: 'Document généré le :',
    assistant: 'Assistant :',
    date: 'Date :',
    global_status: 'Statut global :',
    total_time: 'Temps total pointé :',
    tasks_count: 'Tâches :',
    completed_tasks: 'Tâches réalisées',
    description: 'Description',
    time: 'Temps (h)',
    status: 'Statut',
    remarks: 'Remarques / Difficultés',
    no_reports: 'Aucun rapport trouvé pour les critères sélectionnés.',
    no_tasks: 'Aucune tâche renseignée pour cette journée.',
    status_map: { 'en_cours': 'En cours', 'termine': 'Terminé', 'bloque': 'Bloqué' }
  }
};

async function generateReportPDF(reportId, lang = 'en') {
  const t = translations[lang] || translations.en;
  const { data: report } = await supabase.from('reports').select('*, users!inner(full_name)').eq('id', reportId).single();
  if (!report) throw new Error("Rapport non trouvé");

  const { data: tasks } = await supabase.from('tasks').select('*').eq('report_id', reportId).order('sort_order');
  const taskList = tasks || [];
  
  const totalTime = taskList.reduce((sum, task) => sum + Number(task.time_spent || 0), 0);
  const formattedDate = new Date(report.report_date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US');

  const docDefinition = {
    content: [
      { text: t.report_title, style: 'header' },
      { columns: [ { text: `${t.assistant} ${report.users?.full_name}`, style: 'subheader' }, { text: `${t.date} ${formattedDate}`, style: 'subheader', alignment: 'right' } ] },
      { text: `${t.global_status} ${t.status_map[report.status] || report.status}`, margin: [0, 0, 0, 20] },
      { text: t.completed_tasks, style: 'sectionHeader' },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto'],
          body: [
            [ { text: t.description, style: 'tableHeader' }, { text: t.time, style: 'tableHeader', alignment: 'center' }, { text: t.status, style: 'tableHeader', alignment: 'center' } ],
            ...taskList.map(task => [ task.description, { text: task.time_spent.toString(), alignment: 'center' }, { text: t.status_map[task.status] || task.status, alignment: 'center' } ])
          ]
        },
        layout: 'lightHorizontalLines', margin: [0, 0, 0, 20]
      },
      { text: `${t.total_time} ${totalTime} h`, style: 'total', alignment: 'right' },
      report.remarks ? [ { text: t.remarks, style: 'sectionHeader' }, { text: report.remarks, margin: [0, 0, 0, 20] } ] : null
    ],
    styles: { header: { fontSize: 22, bold: true, color: '#1e3a5f', margin: [0, 0, 0, 10] }, subheader: { fontSize: 14, bold: true, margin: [0, 0, 0, 5] }, sectionHeader: { fontSize: 16, bold: true, color: '#3b82f6', margin: [0, 10, 0, 10] }, tableHeader: { bold: true, fontSize: 12, color: 'black' }, total: { fontSize: 14, bold: true, color: '#047857', margin: [0, 10, 0, 20] } },
    defaultStyle: { font: 'Helvetica', fontSize: 11, color: '#334155' }
  };

  return new Promise((resolve, reject) => {
    try {
      const printer = new PdfPrinter(fonts);
      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      const chunks = [];
      pdfDoc.on('data', chunk => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.end();
    } catch (e) { reject(e); }
  });
}

async function generateDashboardPDF(reports, tasksMap = {}, lang = 'en') {
  const t = translations[lang] || translations.en;
  const formattedDate = new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US');

  const content = [
    { text: t.dashboard_title, style: 'mainHeader' },
    { text: `${t.generated_on} ${formattedDate}`, style: 'subtext', margin: [0, 0, 0, 25] }
  ];

  if (!reports || reports.length === 0) {
    content.push({ text: t.no_reports, italics: true, color: 'gray' });
  } else {
    reports.forEach(report => {
      const reportTasks = tasksMap[report.id] || [];
      const totalTime = reportTasks.reduce((sum, task) => sum + Number(task.time_spent || 0), 0);
      const rDate = new Date(report.report_date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US');

      content.push({
        table: {
          widths: ['*'],
          body: [
            [
              {
                columns: [
                  { text: `${t.assistant} ${report.user_name || 'Inconnu'}`, style: 'reportTitle' },
                  { text: `${t.date} ${rDate}`, style: 'reportDate', alignment: 'right' }
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
        text: `${t.global_status} ${t.status_map[report.status] || report.status}   |   ${t.total_time} ${totalTime} h   |   ${t.tasks_count} ${reportTasks.length}`,
        style: 'reportStats',
        margin: [10, 5, 0, 15]
      });

      if (reportTasks.length > 0) {
        const taskBody = [
          [
            { text: t.description, style: 'tableHeader' },
            { text: t.time, style: 'tableHeader', alignment: 'center' },
            { text: t.status, style: 'tableHeader', alignment: 'center' }
          ]
        ];
        
        reportTasks.forEach(task => {
          taskBody.push([
            { text: task.description, fontSize: 10 },
            { text: task.time_spent.toString(), alignment: 'center', fontSize: 10 },
            { text: t.status_map[task.status] || task.status, alignment: 'center', fontSize: 10 }
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
        content.push({ text: t.no_tasks, italics: true, fontSize: 10, color: 'gray', margin: [10, 0, 0, 15] });
      }

      if (report.remarks) {
        content.push({ text: `${t.remarks} :`, style: 'remarksHeader', margin: [10, 0, 0, 5] });
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

  return new Promise((resolve, reject) => {
    try {
      const printer = new PdfPrinter(fonts);
      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      const chunks = [];
      pdfDoc.on('data', chunk => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.end();
    } catch (e) { reject(e); }
  });
}

module.exports = { generateReportPDF, generateDashboardPDF };
