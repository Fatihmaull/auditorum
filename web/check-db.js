require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: users } = await supabase.from('users').select('*');
  const { data: ws } = await supabase.from('workspaces').select('*');
  console.log("USERS:", JSON.stringify(users, null, 2));
  console.log("WORKSPACES:", JSON.stringify(ws, null, 2));
}

check();
