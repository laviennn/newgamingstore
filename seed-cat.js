import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const categories = [
    { name: 'Top Up Games', slug: 'top-up-games', icon_name: 'Gamepad2', sort_order: 1 },
    { name: 'Specialist Mobile Legends', slug: 'specialist-ml', icon_name: 'Sparkles', sort_order: 2 },
    { name: 'Voucher & Tagihan', slug: 'voucher', icon_name: 'Ticket', sort_order: 3 },
    { name: 'E-Money', slug: 'e-money', icon_name: 'Wallet', sort_order: 4 },
    { name: 'Pulsa & Masa Aktif', slug: 'pulsa', icon_name: 'Globe', sort_order: 5 },
    { name: 'Streaming App', slug: 'streaming', icon_name: 'Tv', sort_order: 6 },
    { name: 'Via Login', slug: 'via-login', icon_name: 'Flame', sort_order: 7 }
  ];
  
  const { error } = await supabase.from('categories').insert(categories);
  if (error) console.log("Error inserting:", error);
  else console.log("Seeded successfully!");
}
run();
