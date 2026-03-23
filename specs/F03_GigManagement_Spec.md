# Feature Specification 03: Gig Management (Client Features)

## 1. Executive Summary
Implements the core marketplace functionality for Clients to post, manage, and track gigs. Includes gig creation, listing, editing, applicant management, and status updates.

## 2. Business Rules

### 2.1 AGF-BR-301 (Minimum Wage Protection)
- Budget must be >= 100 ETB
- Enforced via Zod validation

### 2.2 AGF-BR-302 (Location Specificity)
- Client must select a specific Addis Ababa sub-city
- "Addis Ababa" (generic) is not allowed

### 2.3 AGF-BR-303 (Contact Sanitization)
- Phone numbers in gig descriptions must be hidden
- Regex filter to replace phone patterns with [Hidden]

### 2.4 AGF-BR-204 (Posting Velocity)
- Max 3 gigs per 24 hours per client
- Enforced via Server Action check

### 2.5 Gig Status Workflow
```
draft → open → assigned → in_progress → completed
                ↓
            cancelled
```

## 3. Database Schema

### 3.1 gigs table
```sql
CREATE TABLE public.gigs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  budget numeric(10,2) NOT NULL CHECK (budget >= 100),
  location text NOT NULL,
  status gig_status DEFAULT 'open',
  deadline timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc', now()),
  updated_at timestamp with time zone DEFAULT timezone('utc', now())
);

-- RLS Policies
ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gigs are viewable by everyone" ON gigs
  FOR SELECT USING (true);

CREATE POLICY "Clients can insert gigs" ON gigs
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update own gigs" ON gigs
  FOR UPDATE USING (auth.uid() = client_id);
```

### 3.2 applications table
```sql
CREATE TABLE public.applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  gig_id uuid REFERENCES public.gigs(id) ON DELETE CASCADE NOT NULL,
  freelancer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  cover_note text,
  bid_amount numeric(10,2),
  status application_status DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc', now()),
  UNIQUE(gig_id, freelancer_id)
);

-- RLS Policies
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Freelancers can see their applications" ON applications
  FOR SELECT USING (auth.uid() = freelancer_id);

CREATE POLICY "Clients can see applications for their gigs" ON applications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM gigs WHERE id = applications.gig_id AND client_id = auth.uid())
  );

CREATE POLICY "Freelancers can insert applications" ON applications
  FOR INSERT WITH CHECK (auth.uid() = freelancer_id);
```

## 4. Zod Validation Schema

```typescript
const gigSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000),
  category: z.string().min(1, "Please select a category"),
  budget: z.number().min(100, "Minimum budget is 100 ETB"),
  location: z.string().min(1, "Please select a location"),
  deadline: z.string().optional(),
})

// Helper to sanitize phone numbers
function sanitizeDescription(text: string): string {
  const phoneRegex = /(\+251|0)?\d{9}/g
  return text.replace(phoneRegex, '[Hidden]')
}
```

## 5. Gig Categories

```typescript
export const GIG_CATEGORIES = [
  "Web Development",
  "Graphic Design",
  "Content Writing",
  "UI/UX Design",
  "Digital Marketing",
  "Mobile Development",
  "Video Editing",
  "Translation",
  "Data Entry",
  "Other",
]
```

## 6. Server Actions (lib/actions/gigs.ts)

### 6.1 createGig(values)
```typescript
'use server'
import { createClient } from "@/lib/supabase/server"
import { gigSchema } from "@/lib/validations/gig"
import { revalidatePath } from "next/cache"

export async function createGig(values: z.infer<typeof gigSchema>) {
  const supabase = createClient()
  
  // Validate
  const validated = gigSchema.parse(values)
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  
  // Check posting velocity (max 3 gigs per 24 hours)
  const { data: recentGigs } = await supabase
    .from('gigs')
    .select('id')
    .eq('client_id', user.id)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
  
  if (recentGigs && recentGigs.length >= 3) {
    return { error: "You can only post 3 gigs per 24 hours" }
  }
  
  // Sanitize description (hide phone numbers)
  const sanitizedDescription = sanitizeDescription(validated.description)
  
  // Create gig
  const { data: gig, error } = await supabase
    .from('gigs')
    .insert({
      client_id: user.id,
      title: validated.title,
      description: sanitizedDescription,
      category: validated.category,
      budget: validated.budget,
      location: validated.location,
      deadline: validated.deadline || null,
      status: 'open',
    })
    .select()
    .single()
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/dashboard')
  return { success: true, gig }
}
```

### 6.2 updateGig(gigId, values)
```typescript
export async function updateGig(gigId: string, values: Partial<z.infer<typeof gigSchema>>) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  
  // Verify ownership
  const { data: gig } = await supabase
    .from('gigs')
    .select('client_id')
    .eq('id', gigId)
    .single()
  
  if (gig?.client_id !== user.id) {
    return { error: "Not authorized to edit this gig" }
  }
  
  // Only allow editing if status is 'open' or 'draft'
  if (gig?.status !== 'open' && gig?.status !== 'draft') {
    return { error: "Cannot edit gig after applications received" }
  }
  
  const { error } = await supabase
    .from('gigs')
    .update({
      ...values,
      description: values.description ? sanitizeDescription(values.description) : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', gigId)
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/dashboard')
  revalidatePath(`/gigs/${gigId}`)
  return { success: true }
}
```

### 6.3 deleteGig(gigId)
```typescript
export async function deleteGig(gigId: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  
  // Verify ownership
  const { data: gig } = await supabase
    .from('gigs')
    .select('client_id, status')
    .eq('id', gigId)
    .single()
  
  if (gig?.client_id !== user.id) {
    return { error: "Not authorized to delete this gig" }
  }
  
  if (gig?.status === 'assigned' || gig?.status === 'in_progress') {
    return { error: "Cannot delete gig with active applications" }
  }
  
  const { error } = await supabase
    .from('gigs')
    .delete()
    .eq('id', gigId)
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/dashboard')
  return { success: true }
}
```

### 6.4 acceptApplication(applicationId)
```typescript
export async function acceptApplication(applicationId: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  
  // Get application with gig info
  const { data: application } = await supabase
    .from('applications')
    .select('*, gigs(client_id)')
    .eq('id', applicationId)
    .single()
  
  // Verify client owns the gig
  if (application?.gigs?.client_id !== user.id) {
    return { error: "Not authorized" }
  }
  
  // Update application status
  await supabase
    .from('applications')
    .update({ status: 'accepted' })
    .eq('id', applicationId)
  
  // Update gig status to 'assigned'
  await supabase
    .from('gigs')
    .update({ status: 'assigned' })
    .eq('id', application.gig_id)
  
  // Reject other applications
  await supabase
    .from('applications')
    .update({ status: 'rejected' })
    .eq('gig_id', application.gig_id)
    .neq('id', applicationId)
  
  revalidatePath('/dashboard')
  revalidatePath(`/gigs/${application.gig_id}`)
  return { success: true }
}
```

### 6.5 rejectApplication(applicationId)
```typescript
export async function rejectApplication(applicationId: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  
  const { data: application } = await supabase
    .from('applications')
    .select('*, gigs(client_id)')
    .eq('id', applicationId)
    .single()
  
  if (application?.gigs?.client_id !== user.id) {
    return { error: "Not authorized" }
  }
  
  await supabase
    .from('applications')
    .update({ status: 'rejected' })
    .eq('id', applicationId)
  
  revalidatePath('/dashboard')
  return { success: true }
}
```

### 6.6 updateGigStatus(gigId, status)
```typescript
export async function updateGigStatus(gigId: string, status: GigStatus) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  
  const { data: gig } = await supabase
    .from('gigs')
    .select('client_id, status')
    .eq('id', gigId)
    .single()
  
  if (gig?.client_id !== user.id) {
    return { error: "Not authorized" }
  }
  
  // Status transition validation
  const validTransitions: Record<GigStatus, GigStatus[]> = {
    draft: ['open', 'cancelled'],
    open: ['assigned', 'cancelled'],
    assigned: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  }
  
  if (!validTransitions[gig.status].includes(status)) {
    return { error: `Cannot transition from ${gig.status} to ${status}` }
  }
  
  const { error } = await supabase
    .from('gigs')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', gigId)
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/dashboard')
  return { success: true }
}
```

## 7. UI Components

### 7.1 GigForm (src/components/gigs/gig-form.tsx)
**Features:**
- Title input
- Description textarea
- Category select
- Budget input (ETB)
- Location select
- Deadline picker
- Zod validation
- Loading state
- Toast notifications

### 7.2 GigCard (src/components/gigs/gig-card.tsx)
**Features:**
- Title display
- Budget display (green text)
- Location display (map pin icon)
- Category badge
- Status badge
- Time posted
- Applicant count
- Action buttons (View, Edit, Delete)

### 7.3 ApplicationCard (src/components/gigs/application-card.tsx)
**Features:**
- Freelancer name
- Freelancer avatar
- Cover letter
- Proposed budget
- Rating display
- Accept/Reject buttons
- Status badge

## 8. Pages

### 8.1 Post Gig Page
**Location:** src/app/(main)/client/gigs/new/page.tsx
**Features:**
- Render GigForm
- Title: "Post a New Gig"
- Cancel button (go back)

### 8.2 My Gigs Dashboard
**Location:** src/app/(main)/client/dashboard/page.tsx
**Features:**
- Fetch client's gigs
- Display GigCards in grid
- Show stats (total, open, assigned, completed)
- "Post New Gig" button
- Empty state

### 8.3 Gig Detail Page
**Location:** src/app/(main)/client/gigs/[id]/page.tsx
**Features:**
- Display gig details
- Show applications list
- Edit button (if editable)
- Delete button (if deletable)
- Status management buttons

### 8.4 Edit Gig Page
**Location:** src/app/(main)/client/gigs/[id]/edit/page.tsx
**Features:**
- Pre-fill form with gig data
- Render GigForm
- Update button

### 8.5 Applicants Page
**Location:** src/app/(main)/client/gigs/[id]/applicants/page.tsx
**Features:**
- Fetch applications for gig
- Display ApplicationCards
- Accept/Reject functionality

## 9. Implementation Checklist

- [ ] Create src/lib/validations/gig.ts
- [ ] Create src/lib/actions/gigs.ts
- [ ] Create src/components/gigs/gig-form.tsx
- [ ] Create src/components/gigs/gig-card.tsx
- [ ] Create src/components/gigs/application-card.tsx
- [ ] Create /client/gigs/new/page.tsx
- [ ] Create /client/dashboard/page.tsx
- [ ] Create /client/gigs/[id]/page.tsx
- [ ] Create /client/gigs/[id]/edit/page.tsx
- [ ] Create /client/gigs/[id]/applicants/page.tsx
- [ ] Test gig creation
- [ ] Test gig editing
- [ ] Test gig deletion
- [ ] Test application acceptance
- [ ] Test application rejection
- [ ] Test status transitions
- [ ] Test posting velocity limit

## 10. Testing Strategy

### 10.1 E2E Tests (Cypress)
- Test gig creation with valid data
- Test gig creation with invalid data
- Test budget validation (min 100 ETB)
- Test location validation
- Test gig listing
- Test gig editing
- Test gig deletion
- Test application viewing
- Test application acceptance
- Test status transitions

## 11. Related Files
- **Auth Spec:** specs/F01_Auth_Spec.md
- **Onboarding Spec:** specs/F02_Onboarding_Spec.md
- **Design System:** design_system.md
- **Types:** src/lib/types.ts
- **Tasks:** tasks.md (Phase 3)

## 12. Status
- **Created:** January 23, 2026
- **Last Updated:** January 23, 2026
- **Status:** Ready for Implementation
