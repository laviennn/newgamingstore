const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^["'](.*)["']$/, '$1');
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'] || env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
  console.log('Checking activity_logs table on Supabase...');
  const { data, error } = await supabase.from('activity_logs').select('id').limit(1);
  if (error) {
    console.log('activity_logs table does not exist or error:', error.message);
    console.log('Note: Please run migration/migration_activity_logs.sql in Supabase SQL Editor if table is not created yet.');
  } else {
    console.log('activity_logs table is ready and verified on Supabase!');
  }
}

checkTable();
