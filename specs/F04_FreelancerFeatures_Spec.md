# Feature Specification 04: Freelancer Features

## 1. Executive Summary
Implements the freelancer side of the marketplace: browsing gigs, searching/filtering, applying for gigs, and managing applications. Includes verification status checks.

## 2. Business Rules

### 2.1 AGF-BR-101 (Kebele Mandate)
- Freelancer CANNOT apply if verification_status !== 'verified'
- UI: Disable "Apply" button and show warning

### 2.2 AGF-BR-201 (5-Active Rule)
- Max 5 pending applications at a time
- Check before allowing application submission

### 2.3 AGF-BR-205 (Self-Hiring Ban)
- Freelancer cannot apply to their own gig
- Check: gig.client_id !== current_user.id

### 2.4 AGF-BR-603 (Platform Neutrality)
- Gigs sorted by created_at (newest first)
- No manual boosting or favoritism

## 3. Database Queries

### 3.1 Fetch Open Gigs
```typescript
async function fetchOpenGigs(filters?: {
  search?: string
  category?: string
  location?: string
  minBudget?: number
  maxBudget?: number
}) {
  let query = supabase
    .from('gigs')
    .select(`
      *,
      client:profiles!gigs_client_id_fkey (
        id, full_name, avatar_url, average_rating, reviews_count
      )
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
  
  if (filters?.search) {
    query = query.ilike('title', `%${filters.search}%`)
  }
  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  if (filters?.location) {
    query = query.eq('location', filters.location)
  }
  if (filters?.minBudget) {
    query = query.gte('budget', filters.minBudget)
  }
  if (filters?.maxBudget) {
    query = query.lte('budget', filters.maxBudget)
  }
  
  return query
}
```

### 3.2 Fetch My Applications
```typescript
async function fetchMyApplications() {
  return supabase
    .from('applications')
    .select(`
      *,
      gig:gigs (
        id, title, description, budget, location, category, status,
        client:profiles!gigs_client_id_fkey (
          id, full_name, avatar_url
        )
      )
    `)
    .eq('freelancer_id', user.id)
    .order('created_at', { ascending: false })
}
```

### 3.3 Check Pending Applications Count
```typescript
async function getPendingApplicationsCount() {
  const { count } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('freelancer_id', user.id)
    .eq('status', 'pending')
  return count || 0
}
```

## 4. Zod Validation Schema

```typescript
const applicationSchema = z.object({
  coverLetter: z.string()
    .min(20, "Cover letter must be at least 20 characters")
    .max(1000, "Cover letter must be less than 1000 characters"),
  proposedBudget: z.number()
    .min(50, "Minimum bid is 50 ETB"),
  gigId: z.string().uuid("Invalid gig ID"),
})
```

## 5. Server Actions (lib/actions/freelancer.ts)

### 5.1 browseGigs(filters)
```typescript
export async function browseGigs(filters?: {
  search?: string
  category?: string
  location?: string
  minBudget?: number
  maxBudget?: number
}) {
  const supabase = createClient()
  
  let query = supabase
    .from('gigs')
    .select(`
      *,
      client:profiles!gigs_client_id_fkey (
        id, full_name, avatar_url, average_rating, reviews_count
      )
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
  
  if (filters?.search) {
    query = query.ilike('title', `%${filters.search}%`)
  }
  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  if (filters?.location) {
    query = query.eq('location', filters.location)
  }
  if (filters?.minBudget) {
    query = query.gte('budget', filters.minBudget)
  }
  if (filters?.maxBudget) {
    query = query.lte('budget', filters.maxBudget)
  }
  
  const { data, error } = await query
  
  if (error) {
    return { error: error.message }
  }
  
  return { gigs: data }
}
```

### 5.2 applyForGig(values)
```typescript
export async function applyForGig(values: z.infer<typeof applicationSchema>) {
  const supabase = createClient()
  
  // Validate
  const validated = applicationSchema.parse(values)
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  
  // Check verification status
  const { data: profile } = await supabase
    .from('profiles')
    .select('verification_status')
    .eq('id', user.id)
    .single()
  
  if (profile?.verification_status !== 'verified') {
    return { error: "You must verify your ID before applying for gigs" }
  }
  
  // Check 5-active rule
  const { count: pendingCount } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('freelancer_id', user.id)
    .eq('status', 'pending')
  
  if (pendingCount && pendingCount >= 5) {
    return { error: "You can only have 5 active applications at a time" }
  }
  
  // Check self-hiring ban
  const { data: gig } = await supabase
    .from('gigs')
    .select('client_id')
    .eq('id', validated.gigId)
    .single()
  
  if (gig?.client_id === user.id) {
    return { error: "You cannot apply to your own gig" }
  }
  
  // Check for existing application
  const { data: existing } = await supabase
    .from('applications')
    .select('id')
    .eq('gig_id', validated.gigId)
    .eq('freelancer_id', user.id)
    .single()
  
  if (existing) {
    return { error: "You have already applied to this gig" }
  }
  
  // Create application
  const { error } = await supabase
    .from('applications')
    .insert({
      gig_id: validated.gigId,
      freelancer_id: user.id,
      cover_note: validated.coverLetter,
      bid_amount: validated.proposedBudget,
      status: 'pending',
    })
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/find-work')
  return { success: true }
}
```

### 5.3 withdrawApplication(applicationId)
```typescript
export async function withdrawApplication(applicationId: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  
  // Verify ownership
  const { data: application } = await supabase
    .from('applications')
    .select('freelancer_id')
    .eq('id', applicationId)
    .single()
  
  if (application?.freelancer_id !== user.id) {
    return { error: "Not authorized" }
  }
  
  // Can only withdraw pending applications
  const { data: current } = await supabase
    .from('applications')
    .select('status')
    .eq('id', applicationId)
    .single()
  
  if (current?.status !== 'pending') {
    return { error: "Cannot withdraw application that is not pending" }
  }
  
  const { error } = await supabase
    .from('applications')
    .update({ status: 'withdrawn' })
    .eq('id', applicationId)
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/my-jobs')
  return { success: true }
}
```

### 5.4 getMyApplications()
```typescript
export async function getMyApplications() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      gig:gigs (
        id, title, description, budget, location, category, status,
        client:profiles!gigs_client_id_fkey (
          id, full_name, avatar_url
        )
      )
    `)
    .eq('freelancer_id', user.id)
    .order('created_at', { ascending: false })
  
  if (error) {
    return { error: error.message }
  }
  
  return { applications: data }
}
```

### 5.5 getActiveJobs()
```typescript
export async function getActiveJobs() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  
  // Get gigs where application is accepted
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      gig:gigs (
        id, title, description, budget, location, status,
        client:profiles!gigs_client_id_fkey (
          id, full_name, avatar_url, phone
        )
      )
    `)
    .eq('freelancer_id', user.id)
    .eq('status', 'accepted')
    .in('gig.status', ['assigned', 'in_progress'])
    .order('created_at', { ascending: false })
  
  if (error) {
    return { error: error.message }
  }
  
  return { jobs: data }
}
```

## 6. UI Components

### 6.1 GigSearchFilters (src/components/freelancer/gig-search-filters.tsx)
**Features:**
- Search input (by title)
- Category dropdown
- Location dropdown
- Budget range inputs
- Clear filters button
- Active filters display

### 6.2 GigCard (src/components/freelancer/gig-card.tsx)
**Features:**
- Title display
- Budget display (green text, formatted ETB)
- Location display (map pin icon)
- Category badge
- Client info (name, rating)
- Time posted (relative time)
- "Apply Now" button
- Verification warning if not verified

### 6.3 ApplicationCard (src/components/freelancer/application-card.tsx)
**Features:**
- Gig title
- Status badge (pending/accepted/rejected/withdrawn)
- Cover letter preview
- Proposed budget
- Applied date
- "View Gig" button
- "Withdraw" button (if pending)

### 6.4 ApplyModal (src/components/freelancer/apply-modal.tsx)
**Features:**
- Gig info display
- Cover letter textarea
- Proposed budget input
- Submit button
- Cancel button
- Validation errors
- Loading state

## 7. Pages

### 7.1 Find Work Page
**Location:** src/app/(main)/freelancer/find-work/page.tsx
**Features:**
- Render GigSearchFilters
- Render GigCard grid
- Pagination or infinite scroll
- Empty state
- Loading skeletons

### 7.2 Gig Detail Page
**Location:** src/app/(main)/freelancer/gigs/[id]/page.tsx
**Features:**
- Full gig description
- Client profile info
- Client rating and reviews
- "Apply" button (or ApplyModal trigger)
- Verification status check
- Show warning if not verified

### 7.3 My Jobs Page
**Location:** src/app/(main)/freelancer/my-jobs/page.tsx
**Features:**
- Tabs: Applications / Active Jobs
- Render ApplicationCards (Applications tab)
- Render ApplicationCards (Active Jobs tab)
- Stats: total applications, accepted, pending

### 7.4 Active Job Detail Page
**Location:** src/app/(main)/freelancer/jobs/[id]/page.tsx
**Features:**
- Gig details
- Client contact info (if assigned)
- Status management buttons
- "Mark as In Progress" button
- "Mark as Completed" button
- Link to chat

## 8. Implementation Checklist

- [ ] Create src/lib/validations/application.ts
- [ ] Create src/lib/actions/freelancer.ts
- [ ] Create src/components/freelancer/gig-search-filters.tsx
- [ ] Create src/components/freelancer/gig-card.tsx
- [ ] Create src/components/freelancer/application-card.tsx
- [ ] Create src/components/freelancer/apply-modal.tsx
- [ ] Create /freelancer/find-work/page.tsx
- [ ] Create /freelancer/gigs/[id]/page.tsx
- [ ] Create /freelancer/my-jobs/page.tsx
- [ ] Create /freelancer/jobs/[id]/page.tsx
- [ ] Test gig browsing
- [ ] Test search and filters
- [ ] Test application submission
- [ ] Test verification check
- [ ] Test 5-active rule
- [ ] Test self-hiring ban
- [ ] Test application withdrawal
- [ ] Test active jobs view

## 9. Testing Strategy

### 9.1 E2E Tests (Cypress)
- Test gig listing and display
- Test search functionality
- Test filter functionality
- Test application with verified user
- Test application blocked for unverified user
- Test 5-active rule enforcement
- Test self-hiring ban
- Test application withdrawal
- Test status updates

## 10. Related Files
- **Auth Spec:** specs/F01_Auth_Spec.md
- **Onboarding Spec:** specs/F02_Onboarding_Spec.md
- **Gig Management Spec:** specs/F03_GigManagement_Spec.md
- **Design System:** design_system.md
- **Types:** src/lib/types.ts
- **Tasks:** tasks.md (Phase 4)

## 11. Status
- **Created:** January 23, 2026
- **Last Updated:** January 23, 2026
- **Status:** Ready for Implementation
