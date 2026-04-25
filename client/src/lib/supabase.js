import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nbrcvcugngjgaqpstffk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5icmN2Y3VnbmdqZ2FxcHN0ZmZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzA2OTg3MSwiZXhwIjoyMDkyNjQ1ODcxfQ.30Yb60sNzgEH2qjLgXjMQv9ezmgy1POSJpTm67CZ50A';

export const supabase = createClient(supabaseUrl, supabaseKey);
