import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// We need SERVICE_ROLE_KEY to bypass RLS if enabled, but ANON is fine if RLS is disabled.
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function runMigration() {
  console.log('Starting Multi-Tenant Data Migration...');

  // 1. Truncate Orders
  console.log('Truncating orders...');
  const { error: orderError } = await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (orderError) console.error('Order truncate error:', orderError);

  console.log('NOTE: Please ensure you have run the ALTER TABLE SQL script before running this data script.');

  // Get all tenants
  const { data: tenants, error: tenantsError } = await supabase.from('tenants').select('id, name');
  if (tenantsError || !tenants) {
    console.error('Failed to fetch tenants', tenantsError);
    return;
  }

  console.log(`Found ${tenants.length} tenants.`);
  
  for (const tenant of tenants) {
    console.log(`\nMigrating data for Tenant: ${tenant.name} (${tenant.id})`);
    
    // --- CATEGORIES ---
    const { data: categories } = await supabase.from('categories').select('*').is('tenant_id', null);
    const categoryMap = new Map<string, string>(); // oldId -> newId
    if (categories && categories.length > 0) {
      console.log(`Copying ${categories.length} categories...`);
      const newCategories = categories.map(c => {
        const newId = crypto.randomUUID();
        categoryMap.set(c.id, newId);
        return { ...c, id: newId, tenant_id: tenant.id, slug: `${c.slug}-${tenant.id.substring(0, 5)}` };
      });
      await supabase.from('categories').insert(newCategories);
    }

    // --- GAMES ---
    const { data: games } = await supabase.from('games').select('*').is('tenant_id', null);
    const gameMap = new Map<string, string>();
    if (games && games.length > 0) {
      console.log(`Copying ${games.length} games...`);
      const newGames = games.map(g => {
        const newId = crypto.randomUUID();
        gameMap.set(g.id, newId);
        return { 
          ...g, 
          id: newId, 
          tenant_id: tenant.id, 
          slug: `${g.slug}-${tenant.id.substring(0, 5)}`,
          category_id: g.category_id ? categoryMap.get(g.category_id) : null
        };
      });
      await supabase.from('games').insert(newGames);
    }

    // --- PRODUCTS ---
    const { data: products } = await supabase.from('products').select('*').is('tenant_id', null);
    if (products && products.length > 0) {
      console.log(`Copying ${products.length} products...`);
      const newProducts = products.map(p => {
        return { 
          ...p, 
          id: crypto.randomUUID(), 
          tenant_id: tenant.id,
          game_id: p.game_id ? gameMap.get(p.game_id) : null
        };
      });
      await supabase.from('products').insert(newProducts);
    }

    // --- ARTICLES ---
    const { data: articles } = await supabase.from('articles').select('*').is('tenant_id', null);
    if (articles && articles.length > 0) {
      console.log(`Copying ${articles.length} articles...`);
      const newArticles = articles.map(a => ({
        ...a, id: crypto.randomUUID(), tenant_id: tenant.id, slug: `${a.slug}-${tenant.id.substring(0, 5)}`
      }));
      await supabase.from('articles').insert(newArticles);
    }

    // --- FAQS ---
    const { data: faqs } = await supabase.from('faqs').select('*').is('tenant_id', null);
    if (faqs && faqs.length > 0) {
      console.log(`Copying ${faqs.length} faqs...`);
      const newFaqs = faqs.map(f => ({ ...f, id: crypto.randomUUID(), tenant_id: tenant.id }));
      await supabase.from('faqs').insert(newFaqs);
    }

    // --- PAYMENT CHANNELS ---
    const { data: channels } = await supabase.from('payment_channels').select('*').is('tenant_id', null);
    if (channels && channels.length > 0) {
      console.log(`Copying ${channels.length} payment channels...`);
      const newChannels = channels.map(c => ({ ...c, id: crypto.randomUUID(), tenant_id: tenant.id }));
      await supabase.from('payment_channels').insert(newChannels);
    }

    // --- MEMBERSHIP PACKAGES ---
    const { data: packages } = await supabase.from('membership_packages').select('*').is('tenant_id', null);
    if (packages && packages.length > 0) {
      console.log(`Copying ${packages.length} membership packages...`);
      const newPkgs = packages.map(p => ({ ...p, id: crypto.randomUUID(), tenant_id: tenant.id }));
      await supabase.from('membership_packages').insert(newPkgs);
    }
  }

  console.log('\nCleaning up old global records...');
  // The cascade delete from categories will clean up old games and products.
  await supabase.from('categories').delete().is('tenant_id', null);
  await supabase.from('articles').delete().is('tenant_id', null);
  await supabase.from('faqs').delete().is('tenant_id', null);
  await supabase.from('payment_channels').delete().is('tenant_id', null);
  await supabase.from('membership_packages').delete().is('tenant_id', null);

  console.log('Migration Complete!');
}

runMigration().catch(console.error);
