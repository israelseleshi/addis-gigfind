-- Debug query to check gigs table
SELECT 
  g.id,
  g.title,
  g.client_id,
  p.full_name,
  p.role,
  g.status,
  g.created_at
FROM gigs g
LEFT JOIN profiles p ON g.client_id = p.id
ORDER BY g.created_at DESC;

-- Check current user's gigs (replace with actual user ID)
SELECT * FROM gigs WHERE client_id = 'YOUR_USER_ID_HERE';

-- Check all gigs count
SELECT COUNT(*) as total_gigs FROM gigs;

-- Check gigs by status
SELECT status, COUNT(*) as count FROM gigs GROUP BY status;
