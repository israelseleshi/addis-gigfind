# Feature Specification 08: Admin Dashboard

## 1. Executive Summary
Implements the admin panel for platform management. Includes user management, gig moderation, verification approvals, category management, and analytics.

## 2. Business Rules

### 2.1 AGF-BR-701 (Zero Tolerance Policy)
- Admins can ban/suspend users
- Banned users cannot access the platform
- Middleware checks is_banned flag

### 2.2 AGF-BR-801 (Regulator Access)
- Regulator role has read-only access to all data
- Cannot modify or delete any records

### 2.3 Admin Privileges
- Can view all users, gigs, applications, reviews
- Can approve/reject verifications
- Can ban/unban users
- Can delete gigs (with reason)
- Can force-resolve disputes

## 3. Database Schema Additions

### 3.1 audit_logs table
```sql
CREATE TABLE public.audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id uuid REFERENCES public.profiles(id),
  action text NOT NULL,
  target_type text NOT NULL,
  target_id uuid,
  details jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc', now())
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

### 3.2 reports table (for content moderation)
```sql
CREATE TABLE public.reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id uuid REFERENCES public.profiles(id) NOT NULL,
  gig_id uuid REFERENCES public.gigs(id),
  reason text NOT NULL,
  description text,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc', now())
);
```

## 4. Server Actions (lib/actions/admin.ts)

### 4.1 getDashboardStats()
```typescript
export async function getDashboardStats() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdmin(user)) throw new Error("Not authorized")
  
  const [users, gigs, applications, verifications] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact' }),
    supabase.from('gigs').select('id', { count: 'exact' }),
    supabase.from('applications').select('id', { count: 'exact' }),
    supabase.from('verification_documents').select('id', { count: 'exact' }).eq('status', 'pending'),
  ])
  
  const statusCounts = await supabase
    .from('gigs')
    .select('status', { count: 'exact' })
  
  return {
    totalUsers: users.count || 0,
    totalGigs: gigs.count || 0,
    totalApplications: applications.count || 0,
    pendingVerifications: verifications.count || 0,
    gigsByStatus: statusCounts.data?.reduce((acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1
      return acc
    }, {} as Record<string, number>),
  }
}
```

### 4.2 getAllUsers(filters)
```typescript
export async function getAllUsers(filters?: {
  role?: string
  verificationStatus?: string
  search?: string
  page?: number
}) {
  const supabase = createClient()
  
  let query = supabase
    .from('profiles')
    .select('*, audit_logs(count)', { count: 'exact' })
  
  if (filters?.role) {
    query = query.eq('role', filters.role)
  }
  if (filters?.verificationStatus) {
    query = query.eq('verification_status', filters.verificationStatus)
  }
  if (filters?.search) {
    query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
  }
  
  const { data, error } = await query
    .range((filters?.page || 0) * 20, ((filters?.page || 0) + 1) * 20 - 1)
    .order('created_at', { ascending: false })
  
  if (error) return { error: error.message }
  
  return { users: data }
}
```

### 4.3 banUser(userId, reason)
```typescript
export async function banUser(userId: string, reason: string) {
  const supabase = createClient()
  
  if (!isAdmin(await getCurrentUser())) throw new Error("Not authorized")
  
  // Update user status
  await supabase
    .from('profiles')
    .update({ 
      is_banned: true,
      ban_reason: reason,
      banned_at: new Date().toISOString(),
    })
    .eq('id', userId)
  
  // Create audit log
  await createAuditLog('user_banned', 'profiles', userId, { reason })
  
  return { success: true }
}
```

### 4.4 unbanUser(userId)
```typescript
export async function unbanUser(userId: string) {
  const supabase = createClient()
  
  if (!isAdmin(await getCurrentUser())) throw new Error("Not authorized")
  
  await supabase
    .from('profiles')
    .update({ 
      is_banned: false,
      ban_reason: null,
      banned_at: null,
    })
    .eq('id', userId)
  
  await createAuditLog('user_unbanned', 'profiles', userId)
  
  return { success: true }
}
```

### 4.5 deleteGig(gigId, reason)
```typescript
export async function deleteGig(gigId: string, reason: string) {
  const supabase = createClient()
  
  if (!isAdmin(await getCurrentUser())) throw new Error("Not authorized")
  
  await supabase.from('gigs').delete().eq('id', gigId)
  
  await createAuditLog('gig_deleted', 'gigs', gigId, { reason })
  
  return { success: true }
}
```

### 4.6 forceResolveGig(gigId, resolution)
```typescript
export async function forceResolveGig(gigId: string, resolution: 'completed' | 'cancelled') {
  const supabase = createClient()
  
  if (!isAdmin(await getCurrentUser())) throw new Error("Not authorized")
  
  await supabase
    .from('gigs')
    .update({ status: resolution })
    .eq('id', gigId)
  
  await createAuditLog('gig_force_resolved', 'gigs', gigId, { resolution })
  
  return { success: true }
}
```

### 4.7 getAuditLogs(filters)
```typescript
export async function getAuditLogs(filters?: {
  actorId?: string
  action?: string
  targetType?: string
  startDate?: string
  endDate?: string
  page?: number
}) {
  const supabase = createClient()
  
  let query = supabase
    .from('audit_logs')
    .select('*, actor:profiles!audit_logs_actor_id_fkey(*)')
  
  if (filters?.actorId) {
    query = query.eq('actor_id', filters.actorId)
  }
  if (filters?.action) {
    query = query.eq('action', filters.action)
  }
  if (filters?.targetType) {
    query = query.eq('target_type', filters.targetType)
  }
  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate)
  }
  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate)
  }
  
  const { data, error } = await query
    .range((filters?.page || 0) * 50, ((filters?.page || 0) + 1) * 50 - 1)
    .order('created_at', { ascending: false })
  
  if (error) return { error: error.message }
  
  return { logs: data }
}
```

## 5. UI Components

### 5.1 AdminSidebar (src/components/admin/admin-sidebar.tsx)
**Features:**
- Dashboard overview
- Users management
- Gigs management
- Verifications
- Reports
- Audit logs
- Settings

### 5.2 StatsCard (src/components/admin/stats-card.tsx)
**Features:**
- Title
- Value
- Trend indicator
- Icon
- Color coding

### 5.3 UserTable (src/components/admin/user-table.tsx)
**Features:**
- Columns: Name, Email, Role, Verification, Status, Joined, Actions
- Search functionality
- Filter by role
- Filter by status
- Pagination
- Action buttons (View, Ban/Unban)

### 5.4 GigTable (src/components/admin/gig-table.tsx)
**Features:**
- Columns: Title, Client, Budget, Status, Created, Actions
- Filter by status
- Filter by category
- Search by title
- Action buttons (View, Delete)

### 5.5 AuditLogTable (src/components/admin/audit-log-table.tsx)
**Features:**
- Columns: Actor, Action, Target, Details, Date
- Filter by action type
- Filter by date range
- Export functionality

## 6. Pages

### 6.1 Admin Dashboard Overview
**Location:** src/app/(main)/admin/page.tsx
**Features:**
- Render StatsCards
- Recent activity chart
- Pending verifications count
- Reported gigs count
- Quick actions

### 6.2 Users Management
**Location:** src/app/(main)/admin/users/page.tsx
**Features:**
- Render UserTable
- Search users
- Filter by role
- Filter by verification status
- Ban/Unban functionality
- View user details

### 6.3 Gigs Management
**Location:** src/app/(main)/admin/gigs/page.tsx
**Features:**
- Render GigTable
- Filter by status
- Filter by category
- Search gigs
- Delete gig functionality
- Force resolve disputes

### 6.4 Verifications Dashboard
**Location:** src/app/(main)/admin/verifications/page.tsx
**Features:**
- List pending verifications
- Approve/Reject functionality
- View document details
- See verification history

### 6.5 Audit Logs
**Location:** src/app/(main)/admin/audit-logs/page.tsx
**Features:**
- Render AuditLogTable
- Filter by action type
- Filter by date range
- Export to CSV

### 6.6 Reports Dashboard
**Location:** src/app/(main)/admin/reports/page.tsx
**Features:**
- List reported content
- View report details
- Dismiss report
- Take action on reported gig

## 7. Implementation Checklist

- [ ] Create src/lib/actions/admin.ts
- [ ] Create SQL for audit_logs and reports tables
- [ ] Create src/components/admin/admin-sidebar.tsx
- [ ] Create src/components/admin/stats-card.tsx
- [ ] Create src/components/admin/user-table.tsx
- [ ] Create src/components/admin/gig-table.tsx
- [ ] Create src/components/admin/audit-log-table.tsx
- [ ] Create /admin/page.tsx
- [ ] Create /admin/users/page.tsx
- [ ] Create /admin/gigs/page.tsx
- [ ] Create /admin/verifications/page.tsx
- [ ] Create /admin/audit-logs/page.tsx
- [ ] Create /admin/reports/page.tsx
- [ ] Test user management
- [ ] Test ban/unban functionality
- [ ] Test gig deletion
- [ ] Test force resolve
- [ ] Test audit logging

## 8. Testing Strategy

### 8.1 E2E Tests (Cypress)
- Test admin dashboard access (non-admin blocked)
- Test user listing and filtering
- Test ban user functionality
- Test gig management
- Test verification approval
- Test audit log viewing

## 9. Related Files
- **Auth Spec:** specs/F01_Auth_Spec.md
- **Verification Spec:** specs/F07_VerificationSystem_Spec.md
- **Design System:** design_system.md
- **Types:** src/lib/types.ts
- **Tasks:** tasks.md (Phase 8)

## 10. Status
- **Created:** January 23, 2026
- **Last Updated:** January 23, 2026
- **Status:** Ready for Implementation
