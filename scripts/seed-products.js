const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Constants
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Supabase URL or Key is missing from .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runSeeder() {
  console.log('🚀 Memulai proses Bulk Seeding Produk...\n');

  // Load JSON Data
  const jsonPath = path.join(__dirname, 'products-template.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ File JSON tidak ditemukan di: ${jsonPath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(jsonPath, 'utf8');
  let data;
  try {
    data = JSON.parse(rawData);
  } catch (err) {
    console.error('❌ Gagal membaca file JSON. Pastikan formatnya valid.', err);
    process.exit(1);
  }

  console.log(`📦 Ditemukan ${data.length} Game di dalam JSON.`);

  // Loop every game in JSON
  for (const gameGroup of data) {
    const { game_name, products } = gameGroup;

    console.log(`\n🔍 Mencari ID untuk game: "${game_name}"...`);
    
    // 1. Get Game ID from Supabase
    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .select('id')
      .ilike('name', game_name) // Case insensitive match
      .single();

    if (gameError || !gameData) {
      console.warn(`⚠️ Game "${game_name}" tidak ditemukan di database. Melewati produk-produknya.`);
      continue;
    }

    const gameId = gameData.id;
    console.log(`✅ Game ditemukan (ID: ${gameId}). Bersiap memasukkan ${products.length} produk...`);

    // 2. Insert/Upsert Products
    let successCount = 0;
    let failCount = 0;

    for (const prod of products) {
      // Upsert by name and game_id (requires unique constraint in DB, but we'll just insert for now to be safe, or we can check first)
      
      // Let's check if product already exists to avoid exact duplicates
      const { data: existingProd } = await supabase
        .from('products')
        .select('id')
        .eq('game_id', gameId)
        .eq('name', prod.name)
        .single();

      const productPayload = {
        game_id: gameId,
        name: prod.name,
        price: prod.price,
        original_price: prod.original_price || prod.price,
        image_url: prod.image_url || null,
        active: true,
      };

      if (existingProd) {
        // Update
        const { error: updateError } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', existingProd.id);
        
        if (updateError) failCount++; else successCount++;
      } else {
        // Insert
        const { error: insertError } = await supabase
          .from('products')
          .insert([productPayload]);
        
        if (insertError) failCount++; else successCount++;
      }
    }

    console.log(`📊 Hasil untuk "${game_name}": ${successCount} Berhasil, ${failCount} Gagal.`);
  }

  console.log('\n🎉 Bulk Seeding Selesai!');
}

runSeeder();
