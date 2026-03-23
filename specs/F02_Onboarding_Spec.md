# Feature Specification 02: Onboarding & Profile Management

## 1. Executive Summary
Establishes Global Layout (Header/Footer) and implements profile completion flow. Users must complete onboarding before accessing marketplace features.

## 2. Business Rules

### 2.1 AGF-BR-102 (Residency Requirement)
- User MUST select a valid Addis Ababa sub-city
- Enforced via Zod enum validation

### 2.2 AGF-BR-104 (Uniqueness)
- Phone numbers must be unique across platform
- Supabase unique constraint on phone_number column

### 2.3 UX Rule
- Users cannot navigate to /dashboard or /find-work until onboarding complete
- Check: location_sub_city IS NOT NULL

## 3. Database Operations

### 3.1 Update Profile
```typescript
// Update profile after onboarding
const { data, error } = await supabase
  .from('profiles')
  .update({
    phone_number: values.phone,
    location_sub_city: values.location,
    bio: values.bio,
    avatar_url: values.avatarUrl,
    updated_at: new Date().toISOString(),
  })
  .eq('id', user.id)
  .select()
  .single()
```

### 3.2 Fetch Profile
```typescript
// Fetch user profile for display
const { data: profile, error } = await supabase
  .from('profiles')
  .select('*, gigs(*), applications(*)')
  .eq('id', userId)
  .single()
```

## 4. Zod Validation Schema

```typescript
const onboardingSchema = z.object({
  phone: z.string().regex(/^09\d{8}$/, "Invalid Ethiopian phone number"),
  location: z.enum(['Bole', 'Yeka', 'Kirkos', 'Addis Ketema', 'Lideta', 
    'Akaki-Kality', 'Nifas Silk-Lafto', 'Kolfe Keranio', 'Gulele', 
    'Semt-Legedir', 'Kazanchis', 'Arada', 'Kolfe']),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(500),
  avatarUrl: z.string().optional(),
})
```

## 5. Global Layout Structure

### 5.1 Root Layout (src/app/layout.tsx)
```typescript
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-50 font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

### 5.2 Main Layout Group (src/app/(main)/layout.tsx)
```typescript
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
```

## 6. Components

### 6.1 SiteHeader (src/components/layout/site-header.tsx)
**Props:** None (fetches user from Supabase)
**Features:**
- Sticky top position
- Logo (left aligned, text-orange-500)
- Navigation links (center)
- User menu (right aligned, Avatar + Dropdown)
- Mobile responsive (hamburger menu)

**Navigation Logic:**
```typescript
// If user NOT onboarded → hide all nav links
// If Client → Show "Post Gig", "My Gigs"
// If Freelancer → Show "Find Work", "My Jobs"
```

**User Dropdown Items:**
- Profile (links to /profile)
- Settings (links to /settings)
- Logout (triggers logoutUser action)

### 6.2 SiteFooter (src/components/layout/site-footer.tsx)
**Features:**
- Simple copyright text
- Links to About, Terms, Privacy
- Fixed at bottom of page

### 6.3 AvatarUpload (src/components/onboarding/avatar-upload.tsx)
**Features:**
- Circular upload area
- Click to select file
- Image preview
- Upload to Supabase Storage (avatars bucket)
- Return public URL
- Loading spinner during upload

### 6.4 OnboardingForm (src/components/onboarding/onboarding-form.tsx)
**Features:**
- Phone number input with +251 prefix
- Location dropdown (select from sub-cities)
- Bio textarea
- Avatar upload
- Submit button
- Validation error messages
- Toast notifications

## 7. Pages

### 7.1 Onboarding Page
**Location:** src/app/(main)/onboarding/page.tsx
**Features:**
- Centered layout, max-w-2xl
- Title: "Complete your Profile"
- Subtitle: "Tell us a bit about yourself to get started"
- Render OnboardingForm
- Handle server errors

**Redirect Logic:**
```typescript
// After successful submission
if (profile.role === 'client') {
  redirect('/dashboard')
} else {
  redirect('/find-work')
}
```

### 7.2 Client Profile Page
**Location:** src/app/(main)/client/profile/page.tsx
**Features:**
- Display profile picture
- Show company name (if available)
- Display location
- Show verification status
- Display average rating
- Show reviews count
- Edit profile button

### 7.3 Freelancer Profile Page
**Location:** src/app/(main)/freelancer/profile/page.tsx
**Features:**
- Display profile picture
- Show skills tags
- Display experience level
- Display bio
- Show location
- Show verification status
- Display average rating
- Show reviews count
- Edit profile button

### 7.4 Edit Profile Page
**Location:** src/app/(main)/profile/edit/page.tsx
**Features:**
- Pre-fill form with current profile data
- Allow updating all editable fields
- Avatar update functionality
- Save changes button
- Cancel button (go back)
- Toast notifications

## 8. Server Actions (lib/actions/profile.ts)

### 8.1 completeOnboarding(values)
```typescript
'use server'
import { createClient } from "@/lib/supabase/server"
import { onboardingSchema } from "@/lib/validations/onboarding"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function completeOnboarding(values: z.infer<typeof onboardingSchema>) {
  const supabase = createClient()
  
  // Validate
  const validated = onboardingSchema.parse(values)
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  
  // Check phone uniqueness (exclude current user)
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('phone_number', validated.phone)
    .neq('id', user.id)
    .single()
  
  if (existing) {
    return { error: "Phone number already in use" }
  }
  
  // Update profile
  const { error } = await supabase
    .from('profiles')
    .update({
      phone_number: validated.phone,
      location_sub_city: validated.location,
      bio: validated.bio,
      avatar_url: validated.avatarUrl,
    })
    .eq('id', user.id)
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/')
  
  // Get user role and redirect
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role === 'client') {
    redirect('/dashboard')
  } else {
    redirect('/find-work')
  }
}
```

### 8.2 updateProfile(values)
```typescript
export async function updateProfile(values: Partial<Profile>) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Not authenticated")
  
  const { error } = await supabase
    .from('profiles')
    .update({
      ...values,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/profile')
  return { success: true }
}
```

### 8.3 uploadAvatar(file)
```typescript
export async function uploadAvatar(file: File) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Not authenticated")
  
  const fileName = `${user.id}/${Date.now()}-${file.name}`
  
  const { error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file)
  
  if (error) {
    return { error: error.message }
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)
  
  return { url: publicUrl }
}
```

## 9. Constants (src/lib/constants.ts)

```typescript
export const ADDIS_SUB_CITIES = [
  "Bole", "Yeka", "Kirkos", "Addis Ketema", "Lideta",
  "Akaki-Kality", "Nifas Silk-Lafto", "Kolfe Keranio", "Gulele",
  "Semt-Legedir", "Kazanchis", "Arada", "Kolfe",
] as const

export const SKILLS = [
  "Web Development", "Graphic Design", "Content Writing",
  "UI/UX Design", "Digital Marketing", "Mobile Development",
  "Video Editing", "Translation", "Data Entry", "Other",
]
```

## 10. Implementation Checklist

- [ ] Create src/lib/constants.ts with sub-cities
- [ ] Create src/lib/validations/onboarding.ts
- [ ] Create src/lib/actions/profile.ts
- [ ] Create src/components/layout/site-header.tsx
- [ ] Create src/components/layout/site-footer.tsx
- [ ] Create src/components/onboarding/avatar-upload.tsx
- [ ] Create src/components/onboarding/onboarding-form.tsx
- [ ] Update src/app/layout.tsx
- [ ] Create src/app/(main)/layout.tsx
- [ ] Create src/app/(main)/onboarding/page.tsx
- [ ] Create profile pages (client/freelancer)
- [ ] Create edit profile page
- [ ] Test onboarding flow
- [ ] Test profile updates
- [ ] Test avatar upload
- [ ] Test navigation logic

## 11. Testing Strategy

### 11.1 E2E Tests (Cypress)
- Test form validation (empty, invalid phone, invalid location)
- Test successful onboarding
- Test phone uniqueness constraint
- Test redirect logic (client → dashboard, freelancer → find-work)
- Test profile viewing
- Test profile editing
- Test avatar upload

## 12. Related Files
- **Auth Spec:** specs/F01_Auth_Spec.md
- **Design System:** design_system.md
- **Types:** src/lib/types.ts
- **Tasks:** tasks.md (Phase 2)

## 13. Status
- **Created:** January 23, 2026
- **Last Updated:** January 23, 2026
- **Status:** Ready for Implementation
