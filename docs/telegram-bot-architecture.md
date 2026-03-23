# Telegram Bot Architecture

## Goal

Build a Telegram bot for Addis GigFind that lets users complete the highest-value marketplace workflows without opening the website for every step.

Phase 1 focuses on:

- Freelancer gig discovery and application
- Client gig posting and applicant review
- Admin verification review
- Telegram notifications for core events

Phase 1 does not include:

- Full chat parity with the website
- Full onboarding/signup inside Telegram
- Rich analytics and reporting
- Full KYC submission inside Telegram

## Architecture Summary

The bot should be implemented inside the existing Next.js + Supabase codebase.

### Core principle

Telegram should be another interface layer over the same backend rules, not a separate product with separate logic.

That means:

- Business rules stay in shared server-side actions/services
- Telegram handlers only orchestrate conversations and format responses
- Supabase remains the source of truth

## Recommended Stack

### Existing stack to reuse

- Next.js
- TypeScript
- Supabase
- Zod

### New packages

- `grammy`
- `@grammyjs/conversations`
- `@grammyjs/menu`
- `@grammyjs/parse-mode`
- `pino`
- `pino-pretty`

### Why this stack

- `grammy` is simple, modern, and TypeScript-friendly
- conversation plugin fits multi-step job posting and application flows
- menu plugin helps role-based command menus
- parse-mode helps clean Telegram message formatting
- logging is needed because bot debugging is event-driven

## High-Level Design

```text
Telegram User
   |
   v
Telegram Bot API
   |
   v
Next.js webhook route
   |
   v
grammy bot instance
   |
   +--> Telegram handlers
   |      |
   |      +--> shared action/service layer
   |               |
   |               +--> Supabase DB / Storage / Auth
   |
   +--> notification sender
```

## Repo Structure

```text
src/
  app/
    api/
      telegram/
        webhook/
          route.ts
  lib/
    telegram/
      bot.ts
      config.ts
      types.ts
      context.ts
      keyboards.ts
      messages.ts
      auth-link.ts
      sender.ts
      handlers/
        start.ts
        freelancer.ts
        client.ts
        admin.ts
        notifications.ts
      conversations/
        post-gig.ts
        apply-gig.ts
        review-verification.ts
    actions/
      telegram/
        accounts.ts
        gigs.ts
        applications.ts
        verifications.ts
        notifications.ts
```

## Data Model Changes

Add a table for Telegram linkage.

### `telegram_accounts`

```sql
create table public.telegram_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  telegram_user_id text not null,
  telegram_chat_id text not null,
  telegram_username text,
  telegram_first_name text,
  telegram_last_name text,
  is_active boolean not null default true,
  linked_at timestamptz not null default now(),
  last_seen_at timestamptz
);

create unique index telegram_accounts_user_id_key
  on public.telegram_accounts(user_id);

create unique index telegram_accounts_telegram_user_id_key
  on public.telegram_accounts(telegram_user_id);
```

### Optional later

- `telegram_outbox` for reliable queued notifications
- `telegram_bot_audit_logs` for moderation and traceability

## Authentication Model

Do not implement full signup/login in Telegram first.

### Recommended model

1. User logs in on the website
2. User clicks `Connect Telegram`
3. Website generates a short-lived linking code
4. User sends code to the bot
5. Bot stores `telegram_user_id` and `telegram_chat_id`

### Why

- avoids password handling in Telegram
- avoids duplicating auth flows
- gives safe account ownership proof
- is faster to ship

## Bot Roles and Capabilities

### Freelancer

- `/start`
- `Browse gigs`
- `Search gigs`
- `Filter by category/location`
- `View gig details`
- `Apply to gig`
- `My applications`
- `Active jobs`
- `Verification status`

### Client

- `/start`
- `Post gig`
- `My gigs`
- `View applicants`
- `Accept applicant`
- `Reject applicant`
- `Gig status summary`

### Admin

- `/start`
- `Pending verifications`
- `Approve verification`
- `Reject verification`
- `Basic dashboard stats`

## Shared Service Boundaries

Telegram handlers should not write directly to Supabase except through shared actions/services.

### Required shared modules

- `telegram/accounts.ts`
  - link account
  - unlink account
  - resolve platform user from Telegram user

- `telegram/gigs.ts`
  - browse gigs
  - get gig details
  - create gig
  - list client gigs

- `telegram/applications.ts`
  - apply for gig
  - list my applications
  - accept application
  - reject application

- `telegram/verifications.ts`
  - get verification status
  - list pending verifications
  - approve/reject verification

- `telegram/notifications.ts`
  - send Telegram notification to linked users

## Conversation Flows

### 1. Connect account

```text
/start
  -> check linked?
     -> yes: show role menu
     -> no: ask for link code
        -> verify code
        -> save telegram account
        -> show role menu
```

### 2. Freelancer applies to a gig

```text
Browse gigs
  -> select gig
  -> view details
  -> Apply
  -> ask for cover note
  -> validate
  -> call shared apply action
  -> confirm submission
```

### 3. Client posts a gig

```text
Post gig
  -> title
  -> category
  -> description
  -> budget
  -> location
  -> confirmation
  -> create gig
```

### 4. Admin reviews verification

```text
Pending verifications
  -> select user/document
  -> show summary
  -> Approve or Reject
  -> optional rejection note
  -> persist result
```

## Webhook Design

### Route

- `POST /api/telegram/webhook`

### Responsibilities

- verify request source if configured
- parse Telegram update
- pass update into `grammy`
- return quickly

### Deployment note

Webhook is better than polling for production because:

- easier to host with the existing web app
- less noisy
- lower idle overhead

## Notifications Design

Telegram notifications should be event-driven and only sent to users with linked Telegram accounts.

### Phase 1 notification events

- new application received
- application accepted
- application rejected
- verification approved
- verification rejected
- gig status updated

### Trigger points

- after successful application creation
- after applicant acceptance/rejection
- after verification approval/rejection
- after gig status transition

## Security Requirements

- Never trust Telegram role claims; always resolve role from DB
- Use link codes with short expiry
- Restrict admin actions by DB role check
- Keep bot token in environment variables only
- Validate all Telegram payload-derived inputs with Zod
- Rate-limit sensitive flows if abuse appears

## Environment Variables

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Delivery Plan

### Phase 1

- add Telegram account linking
- add webhook route and base bot
- freelancer browse/apply flow
- client post/review flow
- admin verification flow
- Telegram notifications for core events

### Phase 2

- richer search filters
- message center integration
- KYC upload support in bot
- notification preferences
- queued delivery/retry

### Phase 3

- full chat parity
- advanced moderation
- analytics and reporting

## Recommended First Implementation Order

1. Add `telegram_accounts` table and link-code flow
2. Create shared action layer for bot-safe operations
3. Add `grammy` bot bootstrap and webhook route
4. Implement `/start` and role-aware menus
5. Implement freelancer browse/apply
6. Implement client post/review
7. Implement admin verification review
8. Add Telegram notification triggers
9. Add logging and failure handling

## Current Risks in Existing App

- some DB writes happen directly from client pages instead of hardened server actions
- notifications are specified but not fully implemented
- chat pages are mostly mock UI
- some schema fields used in UI appear ahead of the typed schema

Because of that, bot work should use a cleaned-up shared service layer instead of calling UI code patterns directly.

## Decision

Build the Telegram bot in this repo now, but treat it as a new interface layer over shared backend actions. Do not build it as a separate backend unless scale or team structure later requires that split.
