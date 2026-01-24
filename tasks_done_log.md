# Tasks Done Log

## Jan 23, 2026

### Project Restructuring to src/ Architecture

**Migration Actions:**
1. Created `migrate-to-src.mjs` script to consolidate directories
2. Moved `app/` → `src/app/` (merged with existing)
3. Moved `components/` → `src/components/`
4. Moved `hooks/` → `src/hooks/`
5. Moved `lib/` → `src/lib/`
6. Updated `tsconfig.json` paths: `"@/*": ["./src/*"]`
7. Deleted root directories (`app/`, `components/`, `hooks/`, `lib/`)
8. Deleted migration script after success

### Demo Data Created

**Files Created:**
- `src/lib/types.ts` - TypeScript interfaces (User, Gig, Application, Message, Conversation, Location enums)
- `src/lib/demo-data.ts` - Mock data with 5 gigs, 3 users (Client, Freelancer, Admin), 10 Addis Ababa locations

### Structure Now

```
src/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   │   ├── admin/
│   │   ├── client/
│   │   └── freelancer/
│   ├── (public)/
│   └── api/
├── components/
├── hooks/
└── lib/
    ├── types.ts
    ├── demo-data.ts
    └── utils.ts
```

### Commands Run

```bash
# Migration
node migrate-to-src.mjs

# Clean up
rm -rf app components hooks lib migrate-to-src.mjs

# Clear Next.js cache
rm -rf .next

# Lint check
pnpm lint
```

### Issues Resolved

- Fixed `tsconfig.json` path alias to use `./src/*`
- Created missing `types.ts` for demo-data imports
- Fixed `components.json` path: `app/globals.css` → `src/app/globals.css`

### ENOENT Error Investigation

Next.js is looking for `/home/joy/Documents/SIS/Industrial/addis-gigfind/app` which doesn't exist. Root causes investigated:
- `components.json` CSS path (FIXED)
- `next.config.ts` (no issues found)
- `tsconfig.json` paths (correct)
- Stale `.next` cache (cleaned)

**Status:** Server restart required after cache cleanup.

### Dynamic Route Conflict Fixed (Jan 23, 2026)

**Error:** `You cannot use different slug names for the same dynamic path ('gigId' !== 'id').`

**Root Cause:** Two conflicting dynamic route folders existed in `src/app/(dashboard)/freelancer/find-work/`:
- `[id]/page.tsx` (old)
- `[gigId]/apply/page.tsx` (new)

**Fix Applied:**
1. Merged `[id]/page.tsx` content into `[gigId]/page.tsx`
2. Updated parameter from `params: { id: string }` to `params: { gigId: string }`
3. Deleted redundant `[id]/` folder
4. Updated links in `find-work/page.tsx` to use `gig.id`

**File Structure Now:**
```
find-work/
├── page.tsx
├── [gigId]/
│   ├── page.tsx      (gig detail page)
│   └── apply/
│       └── page.tsx  (apply page)
```

### Parallel Route Conflict Fixed (Jan 23, 2026)

**Error:** `You cannot have two parallel pages that resolve to the same path. Please check /(auth)/login and /login.`

**Root Cause:** Duplicate login/register pages existed:
- `src/app/(auth)/login/page.tsx` (route group)
- `src/app/login/page.tsx` (root level)

**Fix Applied:**
- Deleted entire `src/app/(auth)/` route group
- Kept root-level pages (`/login`, `/register`)

**Routes Now:**
- `/login` → `src/app/login/page.tsx`
- `/register` → `src/app/register/page.tsx`

### Tangelo Design System Implemented (Jan 23, 2026)

**Design System:** Tangelo Design System v1.0

**Color Palette:**
- **Primary:** Tangelo Orange (`oklch(0.63 0.15 27)`) - for buttons, links, active states
- **Neutral:** Zinc Scale - for borders, text, backgrounds

**Components Updated:**

1. **globals.css**
   - Primary color: Orange (#f97316)
   - Background: White
   - Foreground: Zinc-900
   - Cards: White with zinc-200 borders

2. **Button Component** (`src/components/ui/button.tsx`)
   - Default: `bg-orange-500 text-white hover:bg-orange-600`
   - Outline: `border-zinc-200 bg-white hover:bg-zinc-50 hover:text-orange-600`
   - Ghost: `text-zinc-600 hover:text-orange-600 hover:bg-orange-50`
   - Secondary: `bg-zinc-100 text-zinc-900`

3. **Input Component** (`src/components/ui/input.tsx`)
   - Border: `border-zinc-200`
   - Focus: `focus-visible:border-orange-500 focus-visible:ring-orange-500/20`
   - Selection: `selection:bg-orange-500 selection:text-white`

4. **Card Component** (`src/components/ui/card.tsx`)
   - Border: `border-zinc-200`
   - Background: `bg-white`
   - Header border: `border-zinc-100`
   - Title: `text-zinc-900`
   - Description: `text-zinc-500`

**Pages Updated with Zinc Colors:**
- Landing page (`src/app/page.tsx`)
- Login page (`src/app/login/page.tsx`)
- Register page (`src/app/register/page.tsx`)
- Find work page (`src/app/(dashboard)/freelancer/find-work/page.tsx`)
- Messages page (`src/app/(dashboard)/freelancer/messages/page.tsx`)
- Settings page (`src/app/(dashboard)/freelancer/settings/page.tsx`)
- Client dashboard pages
- All placeholder pages

## Jan 23, 2026 (Continued)

### F01: Authentication System & F02: Onboarding Implemented

**Features Completed:**
- **User Registration:** Separate forms for "Clients" and "Freelancers" using email and password.
- **User Login:** Standard email and password sign-in.
- **Google OAuth:** Implemented "Sign in with Google" and "Sign up with Google" flows.
- **Password Recovery:** "Forgot Password" flow that sends a reset link via email.
- **Onboarding Process:** A dedicated page (`/onboarding`) to collect additional user details after initial sign-up (phone, location, bio, avatar).
- **Profile & Avatar Management:** Server actions and UI components for updating profiles and uploading avatars to Supabase Storage.

**Key Files Created/Modified:**
- `src/lib/actions/auth.ts`: Server actions for `registerClient`, `registerFreelancer`, `loginUser`, `logoutUser`, `recoverPassword`.
- `src/lib/actions/profile.ts`: Server actions for `completeOnboarding`, `updateProfile`, `uploadAvatar`.
- `src/lib/validations/auth.ts`: Zod schemas for all authentication forms.
- `src/lib/validations/onboarding.ts`: Zod schema for the onboarding form.
- `src/components/auth/`: All authentication form components (`client-signup-form.tsx`, `freelancer-signup-form.tsx`, `login-form.tsx`, `forgot-password-form.tsx`).
- `src/components/onboarding/`: Onboarding form and avatar upload components.
- `src/app/auth/callback/route.ts`: Route handler for Supabase OAuth callbacks.
- `src/lib/supabase/client.ts`: Supabase client for browser-side operations.
- `src/lib/supabase/route-handler-client.ts`: Supabase client specifically for Next.js Route Handlers.

### Debugging & Refinements

**Issues Resolved:**
1.  **500 Internal Server Error on Sign-Up:**
    - **Cause:** The `registerClient` and `registerFreelancer` server actions were sending extra metadata not expected by the initial `auth.signUp` call.
    - **Fix:** Modified the actions to only send `full_name` and `role`. Other data is now collected exclusively during onboarding. Added `try...catch` blocks for better error reporting.
2.  **`cookieStore.get is not a function` Error:**
    - **Cause:** The `/auth/callback` route was using the standard server client, which is incompatible with Route Handlers.
    - **Fix:** Installed `@supabase/auth-helpers-nextjs` and created a dedicated `createRouteClient` for use in the callback, resolving the crash.
3.  **Google Sign-In/Sign-Up Flow:**
    - **Cause:** Initial implementation incorrectly used a server action for a client-side OAuth redirect.
    - **Fix:** Moved the `signInWithOAuth` logic to the client-side within the form components. Added separate "Sign up with Google" buttons to each registration tab to correctly assign user roles.

**UI/UX Enhancements:**
- Added Google logos to all OAuth buttons.
- Standardized input placeholders to be more descriptive (e.g., "Enter your...").
- Added password visibility toggles to "Confirm Password" fields and fixed a related state bug in the freelancer form.
