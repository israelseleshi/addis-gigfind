#!/bin/bash
# Supabase Diagnostic Script for Addis GigFind

set -e

# Load environment variables
source .env.local

PROJECT_URL="$NEXT_PUBLIC_SUPABASE_URL"
ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY"

echo "=== Supabase Diagnostic Tool ==="
echo "Project URL: $PROJECT_URL"
echo ""

# Test 1: Check if Supabase is accessible
echo "1. Testing Supabase API accessibility..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PROJECT_URL/rest/v1/profiles?limit=1" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "406" ] || [ "$HTTP_CODE" = "400" ]; then
  echo "   ✓ Supabase is accessible (HTTP $HTTP_CODE)"
else
  echo "   ✗ Supabase not accessible (HTTP $HTTP_CODE)"
fi

# Test 2: Check if profiles table exists and get structure
echo ""
echo "2. Checking profiles table..."
curl -s "$PROJECT_URL/rest/v1/profiles?limit=1" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" | head -c 500

# Test 3: Check auth.users table (to see if signup creates users)
echo ""
echo ""
echo "3. Checking auth.users (recent signups)..."
curl -s "$PROJECT_URL/rest/v1/users?limit=3&order=created_at.desc" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" | head -c 1000

# Test 4: Check if trigger function exists
echo ""
echo ""
echo "4. Checking trigger function..."
curl -s "$PROJECT_URL/rest/v1/rpc/check_trigger_exists" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{}' 2>/dev/null || echo "   (RPC call may not exist - check manually in SQL Editor)"

# Test 5: Check enum types
echo ""
echo "5. Checking enum types..."
curl -s "$PROJECT_URL/rest/v1/profiles?select=role&limit=1" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY"

echo ""
echo ""
echo "=== Diagnostic Complete ==="
echo ""
echo "To run SQL directly, use Supabase Dashboard → SQL Editor:"
echo "1. Go to https://supabase.com/dashboard"
echo "2. Select your project"
echo "3. Click SQL Editor in the left sidebar"
echo "4. Run the following query to check the trigger:"
echo ""
cat << 'EOF'
-- Check if trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public' AND trigger_name = 'on_auth_user_created';

-- Check profiles table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check recent auth.users
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
EOF
