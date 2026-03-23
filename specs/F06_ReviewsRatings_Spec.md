# Feature Specification 06: Reviews & Ratings

## 1. Executive Summary
Implements the review and rating system for completed gigs. Includes leaving reviews, viewing reviews, and calculating average ratings.

## 2. Business Rules

### 2.1 AGF-BR-502 (Completion-Only Ratings)
- User can ONLY rate after Gig Status is 'completed'
- UI: Disable "Rate" button unless gig is completed

### 2.2 AGF-BR-501 (Review Lock-in)
- Reviews cannot be updated after submission
- Reviews cannot be deleted after submission
- Enforced via RLS policies (no UPDATE/DELETE)

### 2.3 AGF-BR-503 (Review Constraints)
- One review per gig per person (unique constraint)
- Cannot review yourself
- Rating must be 1-5 stars

## 3. Database Schema

### 3.1 reviews table
```sql
CREATE TABLE public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  gig_id uuid REFERENCES public.gigs(id) ON DELETE CASCADE NOT NULL,
  reviewer_id uuid REFERENCES public.profiles(id) NOT NULL,
  reviewee_id uuid REFERENCES public.profiles(id) NOT NULL,
  rating int CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT timezone('utc', now()),
  UNIQUE(gig_id, reviewer_id)
);

-- RLS Policies
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM gigs
      WHERE id = reviews.gig_id
      AND status = 'completed'
    )
  );

-- No UPDATE or DELETE policies = reviews are locked
```

### 3.2 Update Average Rating Trigger
```sql
CREATE OR REPLACE FUNCTION update_profile_rating()
RETURNS trigger AS $$
BEGIN
  -- Update reviewee's average rating
  UPDATE public.profiles
  SET 
    average_rating = (
      SELECT AVG(rating)::numeric(3,2)
      FROM public.reviews
      WHERE reviewee_id = NEW.reviewee_id
    ),
    reviews_count = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE reviewee_id = NEW.reviewee_id
    ),
    updated_at = timezone('utc', now())
  WHERE id = NEW.reviewee_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE PROCEDURE update_profile_rating();
```

## 4. Zod Validation Schema

```typescript
const reviewSchema = z.object({
  gigId: z.string().uuid("Invalid gig ID"),
  revieweeId: z.string().uuid("Invalid reviewee ID"),
  rating: z.number().min(1, "Rating must be at least 1 star").max(5, "Rating cannot exceed 5 stars"),
  comment: z.string().min(10, "Review must be at least 10 characters").max(500),
})
```

## 5. Server Actions (lib/actions/reviews.ts)

### 5.1 createReview(values)
```typescript
export async function createReview(values: z.infer<typeof reviewSchema>) {
  const supabase = createClient()
  
  // Validate
  const validated = reviewSchema.parse(values)
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  
  // Cannot review yourself
  if (user.id === validated.revieweeId) {
    return { error: "You cannot review yourself" }
  }
  
  // Check if gig is completed
  const { data: gig } = await supabase
    .from('gigs')
    .select('status')
    .eq('id', validated.gigId)
    .single()
  
  if (gig?.status !== 'completed') {
    return { error: "You can only review completed gigs" }
  }
  
  // Check if already reviewed
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('gig_id', validated.gigId)
    .eq('reviewer_id', user.id)
    .single()
  
  if (existing) {
    return { error: "You have already reviewed this gig" }
  }
  
  // Create review
  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      gig_id: validated.gigId,
      reviewer_id: user.id,
      reviewee_id: validated.revieweeId,
      rating: validated.rating,
      comment: validated.comment,
    })
    .select()
    .single()
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath(`/profile/${validated.revieweeId}`)
  return { success: true, review }
}
```

### 5.2 getReviewsForProfile(profileId)
```typescript
export async function getReviewsForProfile(profileId: string) {
  const supabase = createClient()
  
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:profiles!reviews_reviewer_id_fkey (
        id, full_name, avatar_url
      ),
      gig:gigs (
        id, title, category
      )
    `)
    .eq('reviewee_id', profileId)
    .order('created_at', { ascending: false })
  
  if (error) {
    return { error: error.message }
  }
  
  return { reviews }
}
```

### 5.3 getReviewStats(profileId)
```typescript
export async function getReviewStats(profileId: string) {
  const supabase = createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('average_rating, reviews_count')
    .eq('id', profileId)
    .single()
  
  // Get rating distribution
  const { data: distribution } = await supabase
    .from('reviews')
    .select('rating')
    .eq('reviewee_id', profileId)
  
  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  distribution?.forEach((r) => {
    if (ratingCounts[r.rating] !== undefined) {
      ratingCounts[r.rating]++
    }
  })
  
  return {
    averageRating: profile?.average_rating || 0,
    totalReviews: profile?.reviews_count || 0,
    distribution: ratingCounts,
  }
}
```

### 5.4 canReview(gigId, userId)
```typescript
export async function canReview(gigId: string, userId: string) {
  const supabase = createClient()
  
  // Check if gig is completed
  const { data: gig } = await supabase
    .from('gigs')
    .select('status, client_id')
    .eq('id', gigId)
    .single()
  
  if (!gig) return { canReview: false, reason: "Gig not found" }
  if (gig.status !== 'completed') return { canReview: false, reason: "Gig not completed" }
  
  // Determine if user is client or freelancer
  const isClient = gig.client_id === userId
  const isFreelancer = await checkAcceptedApplication(gigId, userId)
  
  if (!isClient && !isFreelancer) {
    return { canReview: false, reason: "Not a participant" }
  }
  
  // Determine reviewee ID
  const revieweeId = isClient 
    ? (await getFreelancerId(gigId))  // Client reviews freelancer
    : gig.client_id  // Freelancer reviews client
  
  // Check if already reviewed
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('gig_id', gigId)
    .eq('reviewer_id', userId)
    .single()
  
  if (existing) {
    return { canReview: false, reason: "Already reviewed", revieweeId }
  }
  
  return { canReview: true, revieweeId }
}
```

## 6. UI Components

### 6.1 StarRating (src/components/reviews/star-rating.tsx)
**Features:**
- 5 star icons
- Interactive (for input)
- Read-only (for display)
- Hover effects
- Size variants (sm, md, lg)
- Color: orange-500 for filled, zinc-300 for empty

### 6.2 ReviewForm (src/components/reviews/review-form.tsx)
**Features:**
- StarRating input
- Comment textarea
- Submit button
- Cancel button
- Validation errors
- Loading state

### 6.3 ReviewCard (src/components/reviews/review-card.tsx)
**Features:**
- Reviewer info (name, avatar)
- StarRating display
- Comment text
- Date display
- Gig title/category
- Verified badge

### 6.4 RatingSummary (src/components/reviews/rating-summary.tsx)
**Features:**
- Average rating display (large number)
- StarRating display
- Total reviews count
- Rating distribution bars
- Progress bars for each star level

## 7. Pages

### 7.1 Leave Review Modal/Page
**Location:** src/app/(main)/reviews/new/[gigId]/page.tsx
**Features:**
- Gig info display
- Determine who to review (client or freelancer)
- Render ReviewForm
- Check if user can review
- Redirect if not eligible

### 7.2 Profile Reviews Section
**Location:** src/app/(main)/profile/[id]/reviews/page.tsx
**Features:**
- Render RatingSummary
- Render ReviewCard list
- Pagination or infinite scroll
- Filter by rating (optional)

### 7.3 Gig Reviews Section
**Location:** src/app/(main)/gigs/[id]/reviews/page.tsx
**Features:**
- Show reviews for specific gig
- Render ReviewCard list

## 8. Implementation Checklist

- [ ] Create src/lib/validations/review.ts
- [ ] Create src/lib/actions/reviews.ts
- [ ] Create SQL trigger for rating update
- [ ] Create src/components/reviews/star-rating.tsx
- [ ] Create src/components/reviews/review-form.tsx
- [ ] Create src/components/reviews/review-card.tsx
- [ ] Create src/components/reviews/rating-summary.tsx
- [ ] Create /reviews/new/[gigId]/page.tsx
- [ ] Update profile page to show reviews
- [ ] Test review creation
- [ ] Test rating calculation
- [ ] Test review constraints
- [ ] Test lock-in enforcement

## 9. Testing Strategy

### 9.1 E2E Tests (Cypress)
- Test review creation with valid data
- Test review creation blocked for incomplete gig
- Test self-review prevention
- Test duplicate review prevention
- Test rating display
- Test rating summary calculation

## 10. Related Files
- **Auth Spec:** specs/F01_Auth_Spec.md
- **Gig Management Spec:** specs/F03_GigManagement_Spec.md
- **Freelancer Features Spec:** specs/F04_FreelancerFeatures_Spec.md
- **Design System:** design_system.md
- **Types:** src/lib/types.ts
- **Tasks:** tasks.md (Phase 6)

## 11. Status
- **Created:** January 23, 2026
- **Last Updated:** January 23, 2026
- **Status:** Ready for Implementation
