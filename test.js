const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://gxjcsreigvdnyhusxyyp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4amNzcmVpZ3ZkbnlodXN4eXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0ODYwOTEsImV4cCI6MjEwMTA2MjA5MX0.kzQtGZr9caf4BaRfqx4oTtDhzDapaXx-_PkmhiTaNHk');
async function test() {
  const { data } = await supabase.from('products').select('*').limit(1);
  console.log(data);
}
test();
