const cron = require('node-cron');
const { supabase } = require('../config/database');

function initReminderCron() {
  const schedule = process.env.REMINDER_CRON || '0 17 * * 1-5';
  
  cron.schedule(schedule, async () => {
    console.log(`⏰ [CRON] Exécution du rappel de fin de journée (${new Date().toLocaleString()})`);
    
    const today = new Date().toISOString().split('T')[0];
    
    const { data: users } = await supabase.from('users').select('id, full_name').eq('role', 'assistant').eq('is_active', true);
    if (!users || users.length === 0) return;

    for (const u of users) {
      const { data: report } = await supabase.from('reports').select('id, is_locked').eq('user_id', u.id).eq('report_date', today).single();
      
      if (!report || !report.is_locked) {
        const { data: existing } = await supabase.from('reminders').select('id').eq('user_id', u.id).eq('reminder_date', today).single();
        if (!existing) {
          await supabase.from('reminders').insert({ user_id: u.id, reminder_date: today });
          console.log(`🔔 Rappel programmé pour: ${u.full_name}`);
        }
      }
    }
  });
  
  console.log(`🕒 Service de rappels activé (Cron: ${schedule})`);
}

module.exports = { initReminderCron };
