#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load .env file manually
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8').replace(/\r/g, '');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env file');
  process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(supabaseUrl, supabaseKey);

// Known tables to query for audit
const tables = [
  'profiles', 'gigs', 'applications', 'freelancer_profiles', 
  'client_profiles', 'user_wallets', 'coin_purchases', 'payments', 
  'reviews', 'conversations', 'messages', 'notifications',
  'otp_verifications', 'telegram_accounts', 'telegram_link_codes',
  'verification_documents'
];

async function auditSchema() {
  console.log('=== Schema Audit ===\n');
  
  const schemaInfo = {};
  
  for (const tableName of tables) {
    console.log(`Checking ${tableName}...`);
    
    // Try to get one row to see structure
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`  Error: ${error.message}`);
      schemaInfo[tableName] = { error: error.message };
    } else {
      // Get column info by checking the data keys
      const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
      schemaInfo[tableName] = { 
        accessible: true,
        columns: columns,
        sample: data?.[0] || null
      };
      console.log(`  Columns: ${columns.join(', ')}`);
    }
  }
  
  // Save schema audit
  fs.writeFileSync('supabase_schema_audit.json', JSON.stringify(schemaInfo, null, 2));
  console.log('\nSchema saved to supabase_schema_audit.json');
  
  // Try to get index info by checking a table that likely has indexes
  console.log('\n=== Index Info ===');
  const { data: gigs } = await supabase.from('gigs').select('*').limit(1);
  console.log('Gigs table accessible:', !!gigs);
  
  // Try to get trigger info  
  console.log('\n=== Trigger Info ===');
  const { data: notif } = await supabase.from('notifications').select('*').limit(1);
  console.log('Notifications table accessible:', !!notif);
  
  // Save basic info
  const basicAudit = {
    timestamp: new Date().toISOString(),
    tablesAccessible: tables.filter(t => schemaInfo[t]?.accessible),
    tablesError: Object.entries(schemaInfo).filter(([_, v]) => v.error).map(([k, v]) => ({ table: k, error: v.error }))
  };
  
  fs.writeFileSync('supabase_basic_audit.json', JSON.stringify(basicAudit, null, 2));
  console.log('\nBasic audit saved to supabase_basic_audit.json');
  
  console.log('\nDone!');
}

auditSchema().catch(console.error);