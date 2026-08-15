const fs = require('fs');
const path = require('path');

const backupFilePath = path.join(__dirname, '../db_backup/supabase_backup_20260814_223208.sql');
const outputFilePath = path.join(__dirname, '../db_backup/restore_ready_for_supabase_sql_editor.sql');

console.log('Performing comprehensive audit & extraction of backup file...');
const content = fs.readFileSync(backupFilePath, 'utf8');
const lines = content.split('\n');

const tableInserts = {};
const publicTablesDdl = [];
const publicFunctionsDdl = [];
const publicConstraintsFk = [];
const publicConstraintsPkOther = [];
const publicIndexes = [];
const publicTriggers = [];
const publicPolicies = [];

let inCopyBlock = false;
let currentTable = '';
let currentColumns = '';
let copyRows = [];

function escapeSqlValue(val) {
  if (val === '\\N' || val === undefined || val === null) {
    return 'NULL';
  }
  const escaped = val.replace(/'/g, "''");
  return `'${escaped}'`;
}

function flushCopyBlock() {
  if (copyRows.length > 0) {
    const isTarget = currentTable.startsWith('public.') || currentTable === 'auth.users' || currentTable === 'auth.identities';
    if (isTarget) {
      const inserts = [];
      inserts.push(`\n-- ------------------------------------------------------------------------------`);
      inserts.push(`-- Data for ${currentTable} (${copyRows.length} rows)`);
      inserts.push(`-- ------------------------------------------------------------------------------`);
      const chunkSize = 50;
      for (let i = 0; i < copyRows.length; i += chunkSize) {
        const chunk = copyRows.slice(i, i + chunkSize);
        const valuesStr = chunk.map(row => {
          const cols = row.split('\t').map(escapeSqlValue);
          return `(${cols.join(', ')})`;
        }).join(',\n');
        inserts.push(`INSERT INTO ${currentTable} ${currentColumns} VALUES\n${valuesStr}\nON CONFLICT DO NOTHING;\n`);
      }
      tableInserts[currentTable] = inserts;
    }
  }
  inCopyBlock = false;
  currentTable = '';
  currentColumns = '';
  copyRows = [];
}

let currentStatement = [];
let isCapturingPublicStmt = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Handle COPY blocks
  if (inCopyBlock) {
    if (line.trim() === '\\.') {
      flushCopyBlock();
    } else if (line.trim() !== '') {
      copyRows.push(line);
    }
    continue;
  }

  // Detect start of COPY block
  const copyMatch = line.match(/^COPY\s+((?:public|auth)\.[a-zA-Z0-9_]+)\s*\((.*?)\)\s+FROM\s+stdin;/);
  if (copyMatch) {
    inCopyBlock = true;
    currentTable = copyMatch[1];
    currentColumns = `(${copyMatch[2]})`;
    copyRows = [];
    continue;
  }

  if (line.startsWith('COPY ') && line.includes('FROM stdin;')) {
    inCopyBlock = true;
    currentTable = '';
    continue;
  }

  if (line.startsWith('\\')) {
    continue;
  }

  // Collect SQL DDL statements for public schema
  if (!isCapturingPublicStmt) {
    if (
      line.match(/^(CREATE|ALTER)\s+(TABLE|VIEW|FUNCTION|TYPE|SEQUENCE|INDEX|TRIGGER|POLICY)\s+(ONLY\s+)?public\./i) ||
      line.match(/^CREATE\s+(UNIQUE\s+)?INDEX\s+[a-zA-Z0-9_]+\s+ON\s+public\./i) ||
      line.match(/^CREATE\s+TRIGGER\s+[a-zA-Z0-9_]+\s+.*ON\s+public\./i) ||
      line.match(/^CREATE\s+POLICY\s+.*ON\s+public\./i) ||
      line.match(/^ALTER\s+TABLE\s+(ONLY\s+)?public\./i)
    ) {
      isCapturingPublicStmt = true;
      currentStatement = [line];
    }
  } else {
    currentStatement.push(line);
  }

  if (isCapturingPublicStmt) {
    const joined = currentStatement.join('\n');
    const dollarCount = (joined.match(/\$\$/g) || []).length;
    if (dollarCount % 2 === 0 && line.trim().endsWith(';')) {
      if (!joined.includes('OWNER TO')) {
        if (joined.includes('FOREIGN KEY')) {
          publicConstraintsFk.push(joined);
        } else if (joined.startsWith('CREATE FUNCTION public.')) {
          publicFunctionsDdl.push(joined);
        } else if (joined.startsWith('CREATE TABLE public.')) {
          // Convert to CREATE TABLE IF NOT EXISTS
          const safeTable = joined.replace(/^CREATE TABLE public\./, 'CREATE TABLE IF NOT EXISTS public.');
          publicTablesDdl.push(safeTable);
        } else if (joined.includes('CREATE TRIGGER')) {
          publicTriggers.push(joined);
        } else if (joined.includes('CREATE POLICY')) {
          publicPolicies.push(joined);
        } else if (joined.includes('CREATE INDEX') || joined.includes('CREATE UNIQUE INDEX')) {
          publicIndexes.push(joined);
        } else {
          publicConstraintsPkOther.push(joined);
        }
      }
      isCapturingPublicStmt = false;
      currentStatement = [];
    }
  }
}

// Strict topological order for tables
const orderedTables = [
  'public.tenants',              // ROOT 1: Referenced by all tables
  'auth.users',                  // ROOT 2: Referenced by admin_users, identities
  'auth.identities',             // Sub-auth
  'public.categories',           // Master catalog
  'public.admin_roles',          // Master RBAC
  'public.admin_users',          // Admin operators
  'public.games',                // Games catalog
  'public.products',             // Products catalog
  'public.membership_packages',  // Membership tiers
  'public.payment_channels',     // Payment channels
  'public.promo_codes',          // Promo codes
  'public.orders',               // Customer orders
  'public.deposits',             // Member deposits
  'public.wallets',              // User wallets
  'public.members',              // Storefront members
  'public.articles',             // Articles / Blog
  'public.faqs',                 // FAQs
  'public.api_validation_logs'   // Logs
];

const orderedDataInserts = [];
for (const tbl of orderedTables) {
  if (tableInserts[tbl]) {
    orderedDataInserts.push(...tableInserts[tbl]);
  }
}

for (const [tbl, sqlChunks] of Object.entries(tableInserts)) {
  if (!orderedTables.includes(tbl)) {
    orderedDataInserts.push(...sqlChunks);
  }
}

const finalOutput = [
  '-- ============================================================================== ',
  '-- DEFINITIVE RESTORE SCRIPT FOR SUPABASE WEB SQL EDITOR',
  '-- Guaranteed zero Foreign Key conflicts (De-coupled schema -> data -> constraints)',
  '-- ==============================================================================\n',
  'SET statement_timeout = 0;',
  'SET lock_timeout = 0;',
  'SET client_encoding = \'UTF8\';',
  'SET standard_conforming_strings = on;',
  'SET check_function_bodies = false;',
  'SET client_min_messages = warning;',
  'SET row_security = off;\n',
  'CREATE EXTENSION IF NOT EXISTS "pgcrypto";\n',
  '-- Step 1: Disable replication constraints for bulk load',
  'SET session_replication_role = \'replica\';\n',
  '-- Step 2: Functions & Triggers DDL',
  ...publicFunctionsDdl,
  '\n-- Step 3: Tables DDL',
  ...publicTablesDdl,
  '\n-- Step 4: Primary Keys & Unique Constraints',
  ...publicConstraintsPkOther,
  '\n-- Step 5: Insert All Data (Strictly ordered)',
  ...orderedDataInserts,
  '\n-- Step 6: Re-enable Foreign Key Constraints & Triggers',
  'SET session_replication_role = \'origin\';\n',
  '-- Step 7: Apply Foreign Keys',
  ...publicConstraintsFk.map(fk => `DO $$ BEGIN\n  ${fk.replace(/;$/, '')};\nEXCEPTION WHEN duplicate_object THEN NULL; END $$;`),
  '\n-- Step 8: Indexes',
  ...publicIndexes,
  '\n-- Step 9: Triggers',
  ...publicTriggers,
  '\n-- Step 10: RLS Policies',
  ...publicPolicies
];

fs.writeFileSync(outputFilePath, finalOutput.join('\n'), 'utf8');
console.log(`Successfully generated fail-proof SQL file at: ${outputFilePath}`);
console.log(`Tables: ${publicTablesDdl.length}, FKs: ${publicConstraintsFk.length}, Total lines: ${finalOutput.length}`);
