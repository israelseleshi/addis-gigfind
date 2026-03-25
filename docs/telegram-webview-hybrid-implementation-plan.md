# Telegram Hybrid Webview Implementation Plan

## Goal

Deliver a hybrid Telegram experience for Addis GigFind where:

- Telegram chat remains the entry point for menus, notifications, and quick actions
- detailed workflow screens open in a web-style UI from the bot
- all fields, validation, and business rules stay aligned with the existing website and backend

This plan covers all three user groups:

- Freelancer
- Client
- Admin / Regulator

## Product Direction

The target experience is not a chat-only bot.

The target experience is:

1. Telegram bot message or menu
2. user taps a button such as `View details`, `Apply`, `Post gig`, or `Review`
3. Telegram opens a webview-style page
4. the page uses the same real data and the same fields already used by the website
5. submit actions write to the same database tables and follow the same authorization rules

This is a hybrid architecture:

- bot for entry, notifications, and lightweight menus
- webview pages for dense detail and form-heavy workflows

## Non-Negotiable Constraints

These rules must hold for the whole implementation:

- Do not invent new product fields that do not already exist in the website/backend.
- Gig descriptions shown in Telegram webview must come from the same stored description used by the website.
- Application forms must use the same fields already supported by current application flows.
- Client post-gig forms must use the same fields already supported by the current client website gig creation flow.
- Admin review pages must use the same verification and moderation data already present in the platform.
- Telegram must not become a second backend. Supabase remains the source of truth.

## Current State

### Already done

- Telegram bot is live and linked to real user accounts.
- Role-aware Telegram bot menus exist.
- Freelancer bot flows exist for browse, apply, applications, active jobs, and verification status.
- Client bot flows exist for review and a bot-side guided post-gig flow.
- Admin bot flows exist for verification review.

### Current gap

The current UX is still mostly Telegram chat UI:

- messages
- inline buttons
- guided chat prompts

That is usable, but not close enough to a page-based job/apply experience.

## Desired End State

### Freelancer

- browse gigs from Telegram
- tap `View details`
- open a detailed web-style gig page
- see the same gig description and core gig data as the website
- tap `Apply`
- open a real form page
- submit using the same existing application fields and validation
- return to Telegram confirmation or stay in webview confirmation state

### Client

- tap `Post gig` from Telegram
- open a proper post-gig page in webview
- fill the same fields already used on website:
  - title
  - category
  - description
  - budget
  - location
- submit using the same validation rules and database write path
- open `My gigs`
- tap a gig
- open detailed gig page with applicants count/status
- tap to review applicants in a page-oriented flow

### Admin / Regulator

- open pending verification queue from Telegram
- tap a record
- open a detailed moderation page in webview
- review the same existing verification metadata
- approve or reject using the same backend rules
- leave an existing supported rejection reason where applicable

## Architecture

## Layer 1: Telegram bot

Purpose:

- role-aware menu
- notification delivery
- lightweight list screens
- launch webview pages with signed/deep-linked URLs

The bot should own:

- `/start`
- account linking
- notifications
- quick summary lists
- open buttons that launch webview routes

The bot should stop trying to render all dense detail directly in chat once the webview route exists.

## Layer 2: Telegram webview pages

Purpose:

- detailed gig screens
- real forms
- dense moderation/detail views
- mobile-first UI inside Telegram

These should live in the main Next.js app, not a separate product.

Recommended route family:

```text
src/app/telegram/
  layout.tsx
  page.tsx
  freelancer/
    gigs/page.tsx
    gigs/[gigId]/page.tsx
    gigs/[gigId]/apply/page.tsx
    applications/page.tsx
    applications/[applicationId]/page.tsx
    active-jobs/page.tsx
    active-jobs/[applicationId]/page.tsx
  client/
    gigs/page.tsx
    gigs/create/page.tsx
    gigs/[gigId]/page.tsx
    gigs/[gigId]/applicants/page.tsx
    gigs/[gigId]/applicants/[applicationId]/page.tsx
  admin/
    verifications/page.tsx
    verifications/[documentId]/page.tsx
```

## Layer 3: Shared server actions and loaders

Webview pages must use the same shared action modules already used by the website and Telegram bot.

No duplicate business rules.

Recommended modules to rely on:

- `src/lib/actions/telegram/gigs.ts`
- `src/lib/actions/telegram/applications.ts`
- `src/lib/actions/telegram/verifications.ts`
- existing website-side action modules where they already represent canonical behavior

## Authentication Strategy

The webview pages need a secure way to know which linked Telegram user opened them.

Recommended v1 approach:

1. Telegram bot generates a short-lived signed access token or signed route payload
2. user taps a bot button
3. Telegram opens:

```text
/telegram/freelancer/gigs/[gigId]?tg_token=...
```

4. the server verifies:
   - token signature
   - expiry
   - linked Telegram account
   - expected role
5. route loads real data

Important:

- do not rely on public query params alone
- do not trust raw `telegram_user_id` in URL
- do not expose service-role logic to client-side code

## UI Principles

## Webview design goals

- mobile-first
- simple and dense, not decorative
- easy to scan inside Telegram’s narrow viewport
- clear primary action at bottom
- sticky action area where useful
- full-width cards, not desktop-style layout
- very low friction to return to Telegram menu

## Content rules

- reuse existing field labels where website already has them
- if website field is missing, do not invent one for Telegram
- description text must be the same stored description
- application form fields must match current real application fields
- post-gig fields must match current real gig form

## Navigation rules

- every webview page needs a clear back path
- every webview detail page needs a close/return-to-list path
- primary action should sit at bottom on mobile
- use Telegram bot as home, webview as task surface

## Full User Flows

## Freelancer flows

### F1. Browse gigs

1. user opens bot
2. taps `Browse gigs`
3. bot can show a lightweight list or directly open the webview list
4. user sees list page in webview
5. user can:
   - filter by category
   - filter by location
   - open details

### F2. Gig detail

Gig detail page should show only fields already in system or already intended in existing UI/data model.

Required:

- title
- category
- location
- budget
- posted time/date if available in current data
- client/company display if available in current data
- full stored description

Optional only if already present in current backend/UI:

- status
- rating
- verification badges

Must not invent:

- vacancies
- education qualification
- experience level
- skills chips
- company stats

unless those already exist in Addis GigFind’s current real data model and UI.

### F3. Apply form

Apply page must use current real application fields only.

Current likely real field set from current implementation:

- cover note

If more real application fields already exist in website implementation, include only those.

Flow:

1. user opens gig detail
2. taps `Apply`
3. open apply form page
4. submit
5. success state
6. route back to application detail or job detail

### F4. My applications

1. user taps `My applications`
2. can open either bot list or webview list
3. detail page shows:
   - gig title
   - current status
   - stored cover note
   - linked gig summary

### F5. Active jobs

1. user opens active jobs
2. sees accepted jobs only
3. opens job detail
4. can run allowed actions such as mark `in_progress` if current backend allows it

## Client flows

## C1. Post gig

This page must mirror the existing website client gig creation fields exactly.

Current website fields found in repo:

- title
- category
- description
- budget
- location

Flow:

1. client taps `Post gig`
2. open webview form
3. fill fields
4. submit
5. success state
6. return to gig detail or my gigs list

## C2. My gigs

1. client opens `My gigs`
2. sees list page
3. opens gig detail
4. sees:
   - title
   - category
   - location
   - budget
   - description
   - status
   - applicant count

## C3. Review applicants

1. client opens gig detail
2. taps `Review applicants`
3. sees applicant list page
4. opens applicant detail
5. accepts or rejects using same backend action path as website

Applicant detail should show only real current fields:

- freelancer name
- status
- cover note
- bid amount only if current application model actually uses it
- phone or review stats only if already in current UI/data model

## Admin / Regulator flows

## A1. Pending verifications list

1. admin opens `Pending verifications`
2. can use bot list or webview queue
3. opens verification detail

## A2. Verification detail

Show only existing moderation data:

- user name
- document type
- id number
- status
- description
- submitted date
- admin notes / rejection reason where relevant

Actions:

- approve
- reject with reason

No invented moderation fields.

## Phases

## Phase 0: Foundations

### Objective

Prepare the hybrid system without breaking the current bot.

### Tasks

- define Telegram webview route namespace under `src/app/telegram`
- define signed access strategy for webview links
- add shared Telegram webview auth helper
- define reusable mobile webview layout
- define shared page shell components:
  - header
  - section card
  - sticky action footer
  - empty state
  - loading state

### Deliverables

- `telegram` route group skeleton
- access-token verification helper
- shared Telegram webview layout and style primitives

## Phase 1: Freelancer webview

### Objective

Make freelancer workflows feel like page-based UX.

### Tasks

- build freelancer gig list page
- build freelancer gig detail page
- build freelancer apply form page using existing application fields only
- wire bot buttons:
  - `Browse gigs`
  - `View details`
  - `Apply`
- build freelancer applications list/detail pages
- build freelancer active jobs list/detail pages

### Acceptance criteria

- `View details` opens a real page
- full description appears in page layout
- `Apply` opens a real form page
- form submits through existing application rules

## Phase 2: Client webview

### Objective

Make client posting and hiring workflows page-oriented.

### Tasks

- build client post-gig page using existing website gig fields only
- build client gigs list page
- build client gig detail page
- build applicant list page
- build applicant detail page
- wire bot buttons for:
  - `Post gig`
  - `My gigs`
  - `Review applicants`

### Acceptance criteria

- client can post a gig from webview using existing fields only
- client can review and decide applicants from webview
- status changes are reflected in website and bot

## Phase 3: Admin webview

### Objective

Move admin verification review into a denser, cleaner task UI.

### Tasks

- build pending verification queue page
- build verification detail page
- build reject-reason form page or inline panel
- wire approve/reject actions to existing moderation path
- optionally keep quick approval in chat as secondary path

### Acceptance criteria

- admin can review and act from a page-oriented interface
- same verification data is shown as on website/backend
- all actions remain audited

## Phase 4: Hybrid polish

### Objective

Make bot and webview feel like one product.

### Tasks

- add `Open in Telegram webview` buttons consistently
- add success return states from webview back to bot
- add deep links from notifications to the relevant webview page
- add role-specific landing pages
- improve empty and permission-denied states

## Required Technical Modules

### Add

```text
src/app/telegram/
src/lib/telegram/webview/
  auth.ts
  tokens.ts
  urls.ts
  types.ts
  loader.ts
src/components/telegram-webview/
  telegram-shell.tsx
  telegram-header.tsx
  telegram-card.tsx
  telegram-footer-action.tsx
  telegram-empty-state.tsx
```

### Update

- `src/lib/telegram/keyboards.ts`
- `src/lib/telegram/messages.ts`
- `src/lib/telegram/handlers/freelancer.ts`
- `src/lib/telegram/handlers/client.ts`
- `src/lib/telegram/handlers/admin.ts`
- `src/lib/telegram/handlers/callbacks.ts`

## Data Alignment Checklist

Before implementation of each screen, verify:

### Freelancer gig detail

- title exists
- category exists
- location exists
- budget exists
- description exists
- posted timestamp exists
- client/company display source exists

### Application form

- confirm exact website application fields
- do not add fields beyond those

### Client post-gig form

- confirm exact existing fields from current page:
  - title
  - category
  - description
  - budget
  - location

### Admin verification page

- confirm exact moderation fields already stored

## Risks

### Product risks

- users may expect full website parity immediately
- if page design diverges from current website fields, Telegram becomes inconsistent

### Engineering risks

- insecure webview link handling
- duplicated validation between website pages and Telegram pages
- role leaks if route auth is not enforced server-side

### Mitigations

- use signed short-lived route tokens
- reuse server actions and canonical validation
- render on server for protected detail pages when possible
- keep a strict no-new-fields rule

## Definition of Done

This hybrid initiative is done when:

- freelancer can browse detailed gigs in webview and apply through a real page
- client can post gigs and review applicants through webview
- admin can review verification requests through webview
- bot and webview share the same backend rules and data
- no Telegram-specific fake fields are introduced
- the webview screens are mobile-first and usable inside Telegram

## Recommended Execution Order

1. Phase 0 foundation
2. Freelancer gig detail + apply page
3. Client post-gig page
4. Client applicant review pages
5. Admin verification pages
6. Notification deep links and polish

## Immediate Next Build Task

Start with:

- Telegram webview foundation
- freelancer gig detail page
- freelancer apply page

That gives the biggest UX jump first while staying closest to the current user pain.
