const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env file manually
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8').replace(/\r/g, '');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
// CRITICAL: Use Service Role Key to bypass RLS
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing SUPABASE_SERVICE_ROLE_KEY in .env. RLS will block data fetch.');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Using Service Role Key (bypasses RLS)');

const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Updated list to include all tables and views
const tables = [
  'profiles', 
  'client_profiles', 
  'freelancer_profiles', 
  'gigs',
  'applications', 
  'user_wallets', 
  'coin_purchases', 
  'payments',
  'reviews', 
  'conversations', 
  'messages', 
  'notifications',
  'otp_verifications', 
  'telegram_accounts', 
  'telegram_link_codes',
  'verification_documents',
  'user_verification_status' // View
];

async function exportAll() {
  let mdContent = '# Addis GigFind Live Data (Admin Export)\n\n';
  mdContent += `Exported on: ${new Date().toLocaleString()}\n\n---\n\n`;

  for (const table of tables) {
    console.log(`Exporting ${table}...`);
    
    // Use { count: 'exact' } to help debug row numbers
    const { data, error, count } = await supabaseClient
      .from(table)
      .select('*', { count: 'exact' });
    
    if (error) {
      console.log(`  Error fetching ${table}: ${error.message}`);
      mdContent += `## Table: ${table}\n\n_Error: ${error.message}_\n\n`;
      continue;
    }

    const rowCount = data?.length || 0;
    mdContent += `## Table: ${table}\n\n`;
    mdContent += `**Total Rows Found:** ${rowCount}\n\n`;
    
    if (rowCount === 0) {
      mdContent += '_No data returned. Check if the table is empty._\n\n';
      continue;
    }

    const headers = Object.keys(data[0]);
    mdContent += `| ${headers.join(' | ')} |\n`;
    mdContent += `| ${headers.map(() => '---').join(' | ')} |\n`;

    data.slice(0, 25).forEach(row => {
      const formattedRow = headers.map(h => {
        const val = row[h];
        if (val === null) return 'null';
        return String(val).replace(/\|/g, '\\|').replace(/\n/g, ' ');
      });
      mdContent += `| ${formattedRow.join(' | ')} |\n`;
    });
    
    if (rowCount > 25) mdContent += `\n_... and ${rowCount - 25} more rows_\n`;
    mdContent += '\n---\n';
  }

  const outputPath = path.join(__dirname, '..', 'docs', 'database_context.md');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, mdContent);
  console.log(`\nSuccess! Context stored at: ${outputPath}`);
}

exportAll().catch(console.error);