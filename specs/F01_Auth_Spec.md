# Feature Specification 01: Authentication System

## 1. Executive Summary
Implements secure entry point using Supabase Auth and Next.js Server Actions. Includes Sign Up (Client/Freelancer), Login, Password Recovery, and Session Management.

## 2. Database Schema (Supabase)

### 2.1 Tables Used
- `auth.users` - Managed by Supabase
- `public.profiles` - Extended user data
- `public.verification_documents` - ID verification docs

### 2.2 Required Columns
**profiles table:**
- `id` uuid (PK, references auth.users)
- `full_name` text
- `role` user_role (enum: client, freelancer, admin)
- `phone_number` text unique
- `avatar_url` text
- `bio` text
- `location_sub_city` text
- `verification_status` verification_status
- `average_rating` numeric(3,2)
- `reviews_count` int

### 2.3 Required Triggers
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 
          (new.raw_user_meta_data->>'role')::user_role);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## 3. Zod Validation Schemas

### 3.1 Client Registration Schema
```typescript
const clientSignUpSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  industry: z.string().min(1, "Please select an industry"),
  location: z.string().min(1, "Please select a location"),
  phone: z.string().min(9, "Please enter a valid phone number"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

### 3.2 Freelancer Registration Schema
```typescript
const freelancerSignUpSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  phone: z.string().min(9, "Please enter a valid phone number"),
  location: z.string().min(1, "Please select a location"),
  skills: z.string().min(5, "Please enter at least one skill"),
  experience: z.string().min(1, "Please select your experience level"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

### 3.3 Login Schema
```typescript
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
```

### 3.4 Password Recovery Schema
```typescript
const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});
```

## 4. Server Actions (lib/actions/auth.ts)

### 4.1 registerClient(values)
- Validate using clientSignUpSchema
- Call supabase.auth.signUp with email, password, and metadata
- Metadata should include: full_name, role: 'client', companyName, industry, location, phone
- Handle errors and return success/failure
- Redirect to /onboarding on success

### 4.2 registerFreelancer(values)
- Validate using freelancerSignUpSchema
- Call supabase.auth.signUp with email, password, and metadata
- Metadata should include: full_name, role: 'freelancer', location, phone, skills, experience, bio
- Handle errors and return success/failure
- Redirect to /onboarding on success

### 4.3 loginUser(credentials)
- Validate using loginSchema
- Call supabase.auth.signInWithPassword
- Fetch user profile to determine role
- Redirect based on role: client → /dashboard, freelancer → /find-work
- Handle invalid credentials error

### 4.4 logoutUser()
- Call supabase.auth.signOut()
- Clear any client-side state
- Redirect to /login

### 4.5 recoverPassword(email)
- Validate using forgotPasswordSchema
- Call supabase.auth.resetPasswordForEmail
- Show generic success message (security best practice)

## 5. UI Components

### 5.1 ClientSignUpForm (src/app/register/_components/ClientSignUpForm.tsx)
**Existing code:** Uses shadcn Form, Input, Select components
**Required additions:**
- Add toast notifications instead of alert()
- Connect to registerClient server action
- Show loading state during submission
- Add password visibility toggle

### 5.2 FreelancerSignUpForm (src/app/register/_components/FreelancerSignUpForm.tsx)
**Existing code:** Uses shadcn Form, Input, Select components
**Required additions:**
- Add toast notifications instead of alert()
- Connect to registerFreelancer server action
- Show loading state during submission
- Add password visibility toggle

### 5.3 LoginForm (new component)
**Location:** src/components/auth/login-form.tsx
**Features:**
- Email input with icon
- Password input with visibility toggle
- "Remember me" checkbox
- "Forgot Password" link
- Submit button with loading state
- Toast notifications for errors

### 5.4 ForgotPasswordForm (new component)
**Location:** src/components/auth/forgot-password-form.tsx
**Features:**
- Email input
- Submit button
- Success message after submission
- Link back to login

## 6. Pages Structure

### 6.1 /register Page
**Location:** src/app/register/page.tsx
**Features:**
- Toggle between Client and Freelancer registration
- Render appropriate form based on selection
- Clean layout with branding

### 6.2 /login Page
**Location:** src/app/login/page.tsx
**Features:**
- Render LoginForm component
- Link to registration page
- Link to forgot password page

### 6.3 /forgot-password Page
**Location:** src/app/forgot-password/page.tsx
**Features:**
- Render ForgotPasswordForm component
- Link back to login page

## 7. Middleware Protection

### 7.1 middleware.ts
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response.cookies.setAll(cookiesToSet)
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/find-work') ||
      request.nextUrl.pathname.startsWith('/onboarding')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirect logged in users away from auth pages
  if (request.nextUrl.pathname === '/login' ||
      request.nextUrl.pathname === '/register' ||
      request.nextUrl.pathname === '/forgot-password') {
    if (session) {
      // Fetch profile to determine redirect
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
      
      const redirectUrl = profile?.role === 'client' ? '/dashboard' : '/find-work'
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/find-work/:path*', '/onboarding/:path*', 
            '/login', '/register', '/forgot-password'],
}
```

## 8. Constants

### 8.1 Industries List
```typescript
export const industries = [
  "Technology",
  "Marketing",
  "Design",
  "E-commerce",
  "Healthcare",
  "Education",
  "Finance",
  "Real Estate",
  "Manufacturing",
  "Other",
]
```

### 8.2 Experience Levels
```typescript
export const experienceLevels = [
  "Beginner (0-1 years)",
  "Intermediate (1-3 years)",
  "Advanced (3-5 years)",
  "Expert (5+ years)",
]
```

### 8.3 Locations (Addis Ababa Sub-cities)
```typescript
export const locations = [
  "Bole",
  "Kazanchis",
  "Nifas Silk",
  "Addis Ketema",
  "Gulele",
  "Yeka",
  "Arada",
  "Kolfe",
  "Kirkos",
  "Lideta",
  "Akaki-Kality",
  "Kolfe Keranio",
  "Nifas Silk-Lafto",
  "Semt-Legedir",
]
```

## 9. Implementation Checklist

- [ ] Create lib/validations/auth.ts with all schemas
- [ ] Create lib/actions/auth.ts with all server actions
- [ ] Update ClientSignUpForm to use server action and toast
- [ ] Update FreelancerSignUpForm to use server action and toast
- [ ] Create LoginForm component
- [ ] Create ForgotPasswordForm component
- [ ] Create /login page
- [ ] Create /forgot-password page
- [ ] Update /register page if needed
- [ ] Create/update middleware.ts
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test password recovery
- [ ] Test session persistence
- [ ] Test route protection

## 10. Testing Strategy

### 10.1 Unit Tests
- Test Zod schemas with valid/invalid data
- Test server action error handling

### 10.2 E2E Tests (Cypress)
- Test client registration flow
- Test freelancer registration flow
- Test login with valid credentials
- Test login with invalid credentials
- Test password recovery flow
- Test route protection

## 11. Related Files
- **Types:** src/lib/types.ts
- **Design System:** design_system.md
- **Windsurf Rules:** .windsurfrules
- **Tasks:** tasks.md (Phase 1)

## 12. Status
- **Created:** January 23, 2026
- **Last Updated:** January 23, 2026
- **Status:** Ready for Implementation
