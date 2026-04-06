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
  console.error('Error: Missing environment variables!');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Set' : 'Missing');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Using Service Role Key (bypasses RLS)\n');

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createFreelancerGigPolicies() {
  console.log('=== Creating Freelancer Gig Status Update Policies ===\n');

  // Check existing policies on gigs table
  console.log('1. Checking existing policies on gigs table...');
  const { data: existingPolicies, error: policiesError } = await supabase
    .from('pg_policies')
    .select('policyname, cmd')
    .eq('tablename', 'gigs');

  if (policiesError) {
    console.log('   Could not fetch policies (may need different query):', policiesError.message);
  } else {
    console.log('   Existing policies:');
    existingPolicies?.forEach(p => console.log(`     - ${p.policyname} (${p.cmd})`));
  }

  // SQL to create the policies using postgrest
  // We'll use the REST API directly since there's no exec_sql function
  console.log('\n2. Creating policies via REST API...');

  // Policy 1 SQL
  const policy1SQL = `
    CREATE POLICY "Freelancers can start work on accepted gigs"
    ON gigs FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM applications
        WHERE applications.gig_id = gigs.id
        AND applications.freelancer_id = auth.uid()
        AND applications.status = 'accepted'
      )
      AND status = 'assigned'
    )
    WITH CHECK (
      status = 'in_progress'
    );
  `;

  // Policy 2 SQL
  const policy2SQL = `
    CREATE POLICY "Freelancers can complete work on in_progress gigs"
    ON gigs FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM applications
        WHERE applications.gig_id = gigs.id
        AND applications.freelancer_id = auth.uid()
        AND applications.status = 'accepted'
      )
      AND status = 'in_progress'
    )
    WITH CHECK (
      status = 'completed'
    );
  `;

  // Since Supabase doesn't have a direct SQL exec endpoint, we'll need to use pg_catalog
  // Try to use the pg_policies insert if possible, or just report what needs to be done
  
  console.log('\n3. NOTE: Supabase REST API cannot directly create policies.');
  console.log('   You need to run this SQL in your Supabase SQL Editor:\n');
  
  console.log('='.repeat(60));
  console.log('SQL TO RUN IN SUPABASE SQL EDITOR:');
  console.log('='.repeat(60));
  console.log(policy1SQL);
  console.log('---\n' + policy2SQL);
  console.log('='.repeat(60));

  // Try to query via different method - use direct table insert into pg_policies
  // This won't work due to RLS on pg_policies, but let's try
  console.log('\n4. Attempting to create policies via alternative method...');

  try {
    // Try using the storage endpoint which sometimes allows more
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({})
    });
  } catch (e) {
    console.log('   Direct API approach not available');
  }

  // Final verification - just query what's there
  console.log('\n5. Current gig table policies (if accessible):');
  try {
    const { data: verifyPolicies } = await supabase
      .from('pg_policies')
      .select('policyname, cmd')
      .eq('tablename', 'gigs');
    
    if (verifyPolicies) {
      console.log(JSON.stringify(verifyPolicies, null, 2));
    }
  } catch (e) {
    console.log('   Could not verify - this is expected without proper permissions');
  }

  console.log('\n=== SUMMARY ===');
  console.log('To fix the freelancer gig status update issue:');
  console.log('1. Go to your Supabase Dashboard');
  console.log('2. Open SQL Editor');
  console.log('3. Run the SQL shown above');
  console.log('4. The policies will allow freelancers to update gig status when they have accepted applications');
}

createFreelancerGigPolicies()
  .then(() => {
    console.log('\nScript completed.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });