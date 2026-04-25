const ExcelJS = require('exceljs');

async function generateReportsExcel(reports, tasksMap) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'RS.Tracking';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Synthèse des Rapports');

  // Define columns
  sheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Assistant', key: 'assistant', width: 25 },
    { header: 'Statut Global', key: 'status', width: 15 },
    { header: 'Tâches Effectuées', key: 'task_count', width: 20 },
    { header: 'Temps Total (h)', key: 'total_time', width: 15 },
    { header: 'Détail des tâches', key: 'task_details', width: 60 },
    { header: 'Remarques', key: 'remarks', width: 40 }
  ];

  // Style header row
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }; // primary-600
  sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  const statusLabels = { 'en_cours': 'En cours', 'termine': 'Terminé', 'bloque': 'Bloqué' };

  reports.forEach(r => {
    const rTasks = tasksMap[r.id] || [];
    const taskDetails = rTasks.map(t => `- ${t.description} (${t.time_spent}h)`).join('\n');
    const totalTime = rTasks.reduce((sum, t) => sum + (t.time_spent || 0), 0);

    const row = sheet.addRow({
      date: new Date(r.report_date).toLocaleDateString('fr-FR'),
      assistant: r.user_name,
      status: statusLabels[r.status] || r.status,
      task_count: rTasks.length,
      total_time: totalTime,
      task_details: taskDetails,
      remarks: r.remarks || ''
    });

    row.getCell('task_details').alignment = { wrapText: true, vertical: 'top' };
    row.getCell('remarks').alignment = { wrapText: true, vertical: 'top' };
    row.getCell('total_time').alignment = { horizontal: 'center' };
    row.getCell('task_count').alignment = { horizontal: 'center' };
  });

  return await workbook.xlsx.writeBuffer();
}

module.exports = { generateReportsExcel };
