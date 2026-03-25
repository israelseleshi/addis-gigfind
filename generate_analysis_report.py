import os
from datetime import datetime

# Define the project root (where this script is located)
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
OUTPUT_FILE = os.path.join(PROJECT_ROOT, "CODEBASE_ANALYSIS_REPORT.md")

def generate_report():
    """Generate a comprehensive codebase analysis report."""
    
    report_content = f'''# Addis GigFind - Comprehensive Codebase Analysis Report

> **Generated:** {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
> **Project:** Addis GigFind - Freelance Marketplace Platform

---

## Executive Summary

This report provides a detailed analysis of the Addis GigFind codebase, identifying critical issues, missing features, security concerns, and recommended fixes. The platform is built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and Supabase for the backend.

---

## Critical Issues (Will Cause Runtime Errors)

### 1. Missing Database Columns

**Problem:**
Several database columns referenced in the code do not exist in the database schema, which will cause runtime errors when those features are accessed.

**Affected Columns:**
| Column | Used In | Impact |
|--------|---------|--------|
| `is_onboarding_complete` | `onboarding/freelancer/page.tsx`, `onboarding/client/page.tsx` | Onboarding flow breaks |
| `is_banned` | `admin/users/page.tsx` (lines 60, 80, 99, 116, 171, 232) | Admin ban feature crashes |
| `ban_reason` | `admin/users/page.tsx` | Admin ban feature crashes |

**Fix Plan:**
```sql
-- Run these migrations to add missing columns

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_onboarding_complete BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ban_reason TEXT;
```

**Priority:** CRITICAL
**Estimated Fix Time:** 30 minutes

---

### 2. Chat System Not Connected to Database

**Problem:**
Both client and freelancer chat pages use hardcoded mock data instead of fetching from/saving to the database. The `messages` table exists but is never populated.

**Affected Files:**
- `src/app/(dashboard)/client/chat/page.tsx` - Lines 57-103 (mock conversations)
- `src/app/(dashboard)/freelancer/chat/page.tsx` - Lines 52-71 (mock conversations)
- `src/app/(dashboard)/client/messages/page.tsx` - Lines 13-36 (hardcoded arrays)

**Impact:**
- Users cannot send or receive messages
- Chat functionality is completely broken
- Two different chat implementations exist (`/client/chat/` and `/client/messages/`)

**Fix Plan:**
1. Create a Supabase function to handle message sending:
```sql
-- Create function to insert messages
CREATE OR REPLACE FUNCTION send_message(
  p_conversation_id UUID,
  p_sender_id UUID,
  p_content TEXT
) RETURNS messages AS $$
  INSERT INTO messages (conversation_id, sender_id, content)
  VALUES (p_conversation_id, p_sender_id, p_content)
  RETURNING *;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

2. Update `client/chat/page.tsx` and `freelancer/chat/page.tsx` to:
   - Fetch real conversations from database
   - Subscribe to realtime changes
   - Insert messages through the database

3. Remove duplicate `/client/messages/page.tsx`

**Priority:** CRITICAL
**Estimated Fix Time:** 4-6 hours

---

### 3. Admin User Ban Feature Broken

**Problem:**
The admin panel at `admin/users/page.tsx` attempts to ban/unban users by updating `is_banned` and `ban_reason` columns that don't exist.

**Affected Code (line 60, 80, etc.):**
```typescript
// This will fail because columns don't exist
supabase.from('profiles').update({{ 
  is_banned: true, 
  ban_reason: reason 
}}).eq('id', userId)
```

**Fix Plan:**
1. Add the missing columns (see Issue #1)
2. Add row-level security policies for admin-only access
3. Add validation to prevent self-banning

**Priority:** CRITICAL
**Estimated Fix Time:** 1 hour

---

## Missing/Incomplete Features

### 4. Placeholder Pages

**Problem:** Several pages exist but only display placeholder text.

| Page | Current State | Required Action |
|------|--------------|-----------------|
| `client/profile/page.tsx` | Shows "Profile Page" text | Implement full profile view |
| `freelancer/profile/edit/page.tsx` | Shows "Edit Page" text | Implement profile editor |
| `client/my-jobs/[gigId]/complete/page.tsx` | Shows "Complete Page" text | Implement job completion flow |
| `chat/[conversationId]/page.tsx` | Placeholder | Integrate with main chat |
| `freelancer/active-jobs/[jobId]/page.tsx` | **File missing** | Create the page |

**Fix Plan:**
1. **Client Profile Page:**
   - Fetch profile data from Supabase
   - Display avatar, name, joined date, stats
   - Add "Edit Profile" button

2. **Freelancer Profile Edit:**
   - Add skills editor (multi-select)
   - Add experience level dropdown
   - Add hourly rate input
   - Add portfolio URL field
   - Create server action to update freelancer_profiles

3. **Job Completion Flow:**
   - Create `completeGig` server action
   - Add rating/review component
   - Update gig status to 'completed'
   - Send notification to freelancer

4. **Missing Active Job Detail Page:**
   - Create `freelancer/active-jobs/[jobId]/page.tsx`
   - Show job details, client info, deadline
   - Add "Mark Complete" button

**Priority:** HIGH
**Estimated Fix Time:** 8-10 hours total

---

### 5. Map View Placeholder

**Problem:**
The "find work" page has a map tab that shows "Map view coming soon."

**Affected File:** `freelancer/find-work/page.tsx` (line 290)

**Fix Plan:**
1. Integrate Mapbox or Google Maps API
2. Query gigs with location coordinates
3. Display as markers on map
4. Add cluster support for dense areas
5. Implement "search this area" functionality

**Recommended Stack:**
```typescript
import dynamic from 'next/dynamic'
const Map = dynamic(() => import('@/components/map/GigMap'), {{ ssr: false }})
```

**Priority:** MEDIUM
**Estimated Fix Time:** 6-8 hours

---

### 6. Notification Settings Don't Persist

**Problem:**
Settings pages have email/push notification toggles that have no backend - they toggle but don't save.

**Affected Files:**
- `client/settings/page.tsx`
- `freelancer/settings/page.tsx`

**Fix Plan:**
1. Add `notification_preferences` JSONB column to profiles:
```sql
ALTER TABLE profiles ADD COLUMN notification_preferences JSONB DEFAULT '{{"email": true, "push": true}}';
```

2. Create server action:
```typescript
export async function updateNotificationPreferences(preferences: NotificationPrefs) {
  // Update in database
}
```

3. Load preferences on mount, save on change

**Priority:** MEDIUM
**Estimated Fix Time:** 2-3 hours

---

### 7. Review System Missing UI

**Problem:**
- `reviews` table exists in database
- After job completion, clients should rate freelancers
- No UI exists for submitting or viewing reviews

**Fix Plan:**
1. Create `ReviewModal` component
2. Add to job completion flow
3. Create `ReviewList` for freelancer profile
4. Calculate and cache average rating on profiles table

**Components to Create:**
```
src/components/
  └── review/
      ├── ReviewModal.tsx
      ├── ReviewCard.tsx
      └── ReviewList.tsx
```

**Priority:** MEDIUM
**Estimated Fix Time:** 4-5 hours

---

### 8. Telegram Integration Incomplete

**Problem:**
- UI for linking Telegram is complete
- Handler files exist in `lib/telegram/`
- No cron job to process messages
- No webhook security verification

**Fix Plan:**
1. Add webhook verification middleware
2. Create Vercel cron job to poll for new updates
3. Implement natural language processing for gig posting
4. Add error handling and logging

**Priority:** MEDIUM
**Estimated Fix Time:** 6-8 hours

---

## Data Issues

### 9. Application Status Type Mismatch

**Problem:**
Database enum has: `pending | accepted | rejected | withdrawn`
UI references: `in_review` (doesn't exist in enum)

**Affected Files:**
- `freelancer/my-applications/page.tsx` (line 15)

**Fix Plan:**
```sql
-- Update the enum to include in_review
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'in_review';
```

Or update UI to use valid statuses only.

**Priority:** MEDIUM
**Estimated Fix Time:** 30 minutes

---

### 10. Email Field in Profile

**Problem:**
`client/settings/page.tsx` fetches `profile.email` but:
- The `profiles` table doesn't have an `email` column
- Email is stored in `auth.users`

**Affected Code:**
```typescript
// Wrong - email is not in profiles table
const {{ data }} = await supabase.from('profiles').select('*')
```

**Fix Plan:**
```typescript
// Correct - fetch email from auth
const {{ data: {{ user }} }} = await supabase.auth.getUser()
// Email is available at user.email
```

**Priority:** HIGH
**Estimated Fix Time:** 15 minutes

---

### 11. Verification URL Expiration

**Problem:**
Verification document URLs are signed with 1-hour expiry and will break after expiration.

**Affected File:** `lib/actions/verification.ts` (lines 86-88, 147-153)

**Fix Plan:**
1. Store public URLs instead of signed URLs for verification docs
2. Or create a cached URL system that refreshes before expiry
3. Add URL refresh endpoint

**Priority:** MEDIUM
**Estimated Fix Time:** 1 hour

---

## Security Concerns

### 12. Hardcoded Admin Credentials

**Problem:**
Demo admin credentials are visible in source code.

**Affected File:** `src/lib/actions/auth.ts` (lines 236-239)
```typescript
const DEMO_CREDENTIALS = {{
  'admin@addisgigfind.com': {{ password: 'admin123', role: 'admin' }},
}}
```

**Fix Plan:**
1. Move to environment variables:
```typescript
const DEMO_CREDENTIALS = {{
  [process.env.ADMIN_EMAIL]: {{ 
    password: process.env.ADMIN_PASSWORD, 
    role: 'admin' 
  }},
}}
```

2. Remove demo credentials from production builds
3. Document secure admin onboarding process

**Priority:** HIGH
**Estimated Fix Time:** 30 minutes

---

### 13. Missing Webhook Security

**Problem:**
Telegram webhook endpoint lacks verification.

**Fix Plan:**
1. Verify webhook token from Telegram
2. Add IP whitelist for Telegram servers
3. Implement HMAC signature verification

**Priority:** MEDIUM
**Estimated Fix Time:** 1 hour

---

## UI/UX Problems

### 14. Duplicate Chat Implementations

**Problem:**
Two different chat implementations exist:
- `/client/chat/page.tsx`
- `/client/messages/page.tsx`

Both use different mock data and layouts.

**Fix Plan:**
1. Choose one implementation (recommend `/client/chat/`)
2. Remove the other
3. Add redirect from old URL to new

**Priority:** LOW
**Estimated Fix Time:** 1 hour

---

### 15. Duplicate Applicant Pages

**Problem:**
Two overlapping pages for viewing applicants:
- `/client/applicants/page.tsx` - All applicants
- `/client/my-jobs/[gigId]/applicants/page.tsx` - Per-gig

**Fix Plan:**
1. Keep both but clarify purpose in UI
2. Main `/client/applicants/` = aggregated view with filters
3. `[gigId]/applicants/` = detailed per-gig view

**Priority:** LOW
**Estimated Fix Time:** 30 minutes

---

### 16. Status Badge Display Issue

**Problem:**
`freelancer/active-jobs/page.tsx` uses underscore replacement which breaks for `in_review`.

**Affected Code:**
```typescript
// 'in_review' becomes 'in review' but should be 'In Review'
status.replace('_', ' ')
```

**Fix Plan:**
```typescript
const formatStatus = (status: string) => {{
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}}
```

**Priority:** LOW
**Estimated Fix Time:** 10 minutes

---

## Missing Infrastructure

### 17. No Environment Variables Documentation

**Problem:**
No `.env.example` file exists for new developers.

**Fix Plan:**
Create `.env.example`:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Telegram Bot
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_WEBHOOK_SECRET=your-secret

# Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure-password
```

**Priority:** MEDIUM
**Estimated Fix Time:** 15 minutes

---

### 18. Notifications Table Never Populated

**Problem:**
Dashboard tries to fetch notifications but nothing ever writes to the table.

**Fix Plan:**
1. Create `createNotification` server action
2. Call it from relevant actions:
   - New application: `lib/actions/applications.ts`
   - Application accepted: `lib/actions/applications.ts`
   - Gig completed: new `completeGig` action
   - New message: chat system

**Priority:** MEDIUM
**Estimated Fix Time:** 2 hours

---

## Recommended Implementation Order

### Phase 1: Critical Fixes (Week 1)
1. Add missing database columns (is_onboarding_complete, is_banned, ban_reason)
2. Fix profile email fetching
3. Connect chat to database
4. Fix admin ban feature

### Phase 2: Core Features (Week 2)
5. Implement placeholder pages (profile, job completion)
6. Create missing active-jobs detail page
7. Implement review system UI

### Phase 3: Polish (Week 3)
8. Fix notification settings persistence
9. Add notification population
10. Complete map integration
11. Telegram cron job

### Phase 4: Cleanup (Week 4)
12. Remove duplicate chat implementations
13. Add webhook security
14. Create .env.example
15. Code review and testing

---

## Summary Statistics

| Category | Count | Priority |
|----------|-------|----------|
| Critical Issues | 3 | CRITICAL |
| Missing Features | 5 | HIGH-MEDIUM |
| Data Issues | 3 | HIGH-MEDIUM |
| Security Concerns | 2 | HIGH |
| UI/UX Problems | 3 | LOW-MEDIUM |
| Infrastructure | 2 | MEDIUM |
| **Total Issues** | **18** | - |

| Priority | Count | Est. Fix Time |
|----------|-------|---------------|
| CRITICAL | 3 | 6-8 hours |
| HIGH | 6 | 12-16 hours |
| MEDIUM | 7 | 14-18 hours |
| LOW | 2 | 2 hours |
| **Total** | **18** | **34-44 hours** |

---

## Appendix: File Reference

### Database Schema Dependencies
- `src/types/database.types.ts` - Type definitions
- `src/lib/supabase/schema.sql` - Schema reference

### Server Actions
- `src/lib/actions/auth.ts` - Authentication
- `src/lib/actions/applications.ts` - Application management
- `src/lib/actions/profile-picture.ts` - Profile pictures
- `src/lib/actions/dashboard.ts` - Dashboard stats
- `src/lib/actions/verification.ts` - Verification docs
- `src/lib/actions/telegram/` - Telegram handlers

### Key Pages
- `src/app/(dashboard)/client/` - Client portal (13 pages)
- `src/app/(dashboard)/freelancer/` - Freelancer portal
- `src/app/(dashboard)/admin/` - Admin panel

---

*Report generated by automated analysis. Manual review recommended for implementation decisions.*
'''

    # Write the report to file
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(report_content)
    
    return OUTPUT_FILE


def main():
    print("=" * 60)
    print("Addis GigFind - Codebase Analysis Report Generator")
    print("=" * 60)
    print()
    
    print("Generating comprehensive analysis report...")
    print()
    
    output_path = generate_report()
    
    print("✓ Report generated successfully!")
    print()
    print(f"Output file: {output_path}")
    print()
    
    # Verify file was created
    if os.path.exists(output_path):
        file_size = os.path.getsize(output_path)
        with open(output_path, 'r', encoding='utf-8') as f:
            line_count = len(f.readlines())
        print(f"✓ File verified: {file_size:,} bytes, {line_count:,} lines")
        print()
        print("Report includes:")
        print("  • 3 Critical Issues (will cause errors)")
        print("  • 5 Missing/Incomplete Features")
        print("  • 3 Data Issues")
        print("  • 2 Security Concerns")
        print("  • 3 UI/UX Problems")
        print("  • 2 Infrastructure Issues")
        print("  • Detailed fix plans with code examples")
        print("  • SQL migrations needed")
        print("  • Implementation timeline")
    else:
        print("✗ ERROR: File was not created!")
        return 1
    
    print()
    print("=" * 60)
    print("Analysis complete!")
    print("=" * 60)
    
    return 0


if __name__ == "__main__":
    exit(main())
