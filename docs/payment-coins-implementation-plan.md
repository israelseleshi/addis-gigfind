# Addis GigFind - Payment & Coins System Implementation Plan

## Overview

This document outlines the implementation plan for the payment and coins system, inspired by Upwork's "Connects" model. The system allows freelancers to purchase coins and spend them when applying to gigs, while clients pay the platform when hiring freelancers.

---

## Business Logic Summary

| Actor | Action | Cost |
|-------|--------|------|
| Freelancer | Register | 5 free coins |
| Freelancer | Apply to gig | 1-2 coins |
| Client | Post gig | Free |
| Client | Hire freelancer | Pay platform fee via Chapa |
| Platform | Pay freelancer | Manual payout (demo) |

---

# PART 1: Frontend Implementation (Mock Data)

## Goal
Implement the full UI and user flows with mock/local state data to validate the user experience before integrating real payments.

## Pages to Create/Modify

### 1. `/buy-coins` - Coin Purchase Page (New)
**Purpose:** Freelancers buy coins to apply for gigs

**Components:**
- Hero section explaining coin value
- Coin packages display (3 tiers)
- Payment method info (Chapa)
- "Purchase" button (mock - redirects to success)

**Mock Data:**
```typescript
const coinPackages = [
  { id: "starter", coins: 10, price: 100, label: "Starter Pack", popular: false },
  { id: "pro", coins: 25, price: 200, label: "Pro Pack", popular: true },
  { id: "business", coins: 50, price: 350, label: "Business Pack", popular: false },
]
```

**UI Layout:**
- 3 cards side by side showing coin packages
- "Most Popular" badge on Pro Pack
- Click triggers mock payment flow

### 2. `/freelancer/dashboard` - Freelancer Dashboard (Modify)
**Purpose:** Show wallet balance, transaction history

**Add Sections:**
- Wallet card (coin balance, ETB earned)
- Quick actions (Buy Coins, View Applications)
- Recent transactions list
- Stats (applications made, hired count)

**Mock Data:**
```typescript
const mockWallet = {
  coins: 5,
  totalSpent: 0,
  totalEarned: 0,
  transactions: [
    { type: "bonus", amount: 5, date: "2026-04-01", description: "Welcome bonus" },
  ]
}
```

### 3. `/services` - Browse Gigs (Modify)
**Purpose:** Show gigs with application cost

**Modify:**
- Add "Apply" button showing coin cost (e.g., "Apply (1 Coin)")
- Disable button if insufficient coins
- Show coin balance in header if logged in

**Mock Data:**
```typescript
const mockGigs = [
  { id: "1", title: "House Painting", budget: 5000, cost: 1 },
  { id: "2", title: "Office Wiring", budget: 10000, cost: 2 },
  { id: "3", title: "Web Development", budget: 25000, cost: 2 },
]
```

### 4. `/client/dashboard` - Client Dashboard (Modify)
**Purpose:** Show payments made, freelancers hired

**Add Sections:**
- Total spent card
- Payments history table
- Active gigs with hire buttons
- "Pay Freelancer" quick action

**Mock Data:**
```typescript
const mockClientData = {
  totalSpent: 0,
  freelancersHired: 0,
  activeGigs: [],
  payments: [],
}
```

### 5. `/client/gigs/[id]` - Gig Detail & Hiring (New)
**Purpose:** Client views applicants and hires

**Components:**
- Gig details card
- Applicants list (freelancer name, rating, bid)
- "Hire" button → Opens payment modal

**Flow:**
1. Client clicks "Hire" on freelancer
2. Payment modal shows amount + platform fee
3. Click "Pay with Chapa" → Mock success
4. Freelancer marked as hired

### 6. `/payment/success` - Payment Success Page (Existing - Modify)
**Purpose:** Handle coin purchase and freelancer payment returns

**Modify:**
- Detect payment type (coins vs hiring)
- Show appropriate success message
- Update local state

---

## Components to Create

### `src/components/wallet/`
| Component | Purpose |
|-----------|---------|
| `wallet-card.tsx` | Shows coin balance and ETB |
| `coin-balance.tsx` | Compact coin display for header |
| `transaction-list.tsx` | History of coin activities |

### `src/components/payment/`
| Component | Purpose |
|-----------|---------|
| `coin-package-card.tsx` | Single coin package display |
| `payment-modal.tsx` | Payment confirmation modal |
| `payment-history.tsx` | List of past payments |

### `src/components/gig/`
| Component | Purpose |
|-----------|---------|
| `gig-card.tsx` | Gig display with Apply button |
| `applicant-card.tsx` | Single applicant display |

---

## State Management

Use Zustand (already installed) for global wallet state:

```typescript
// src/stores/wallet-store.ts
interface WalletState {
  coins: number;
  totalSpent: number;
  totalEarned: number;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addEarnings: (amount: number) => void;
}
```

---

## Frontend Implementation Order

1. Create wallet store (`src/stores/wallet-store.ts`)
2. Create wallet components (`wallet-card.tsx`, `transaction-list.tsx`)
3. Modify `/freelancer/dashboard` to show wallet
4. Create `/buy-coins` page with coin packages
5. Modify `/services` - add Apply buttons with coin check
6. Create `/client/gigs/[id]` page for hiring
7. Modify `/client/dashboard` - add payment section
8. Test full flow with mock data

---

# PART 2: Backend Implementation

## Goal
Integrate real Chapa payments and persist all data to Supabase.

## Database Schema (Supabase)

### Table: `user_wallets`
```sql
CREATE TABLE user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  coin_balance INTEGER DEFAULT 5, -- Free 5 coins on signup
  total_coins_spent INTEGER DEFAULT 0,
  total_earned_etb INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table: `coin_purchases`
```sql
CREATE TABLE coin_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  package_id VARCHAR(50) NOT NULL,
  coins_purchased INTEGER NOT NULL,
  amount_paid_etb INTEGER NOT NULL,
  payment_tx_ref VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table: `gig_applications` (Modify existing)
```sql
-- Add columns
ALTER TABLE gig_applications 
ADD COLUMN coins_spent INTEGER DEFAULT 0,
ADD COLUMN payment_tx_ref VARCHAR(100);
```

### Table: `payments`
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) NOT NULL,
  freelancer_id UUID REFERENCES auth.users(id) NOT NULL,
  gig_id UUID REFERENCES gigs(id) NOT NULL,
  amount_etb INTEGER NOT NULL,
  platform_fee_etb INTEGER DEFAULT 0,
  payment_tx_ref VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## API Routes

### 1. `POST /api/wallet/get`
**Purpose:** Get user's wallet balance

**Request:** `{ userId }`

**Response:**
```json
{
  "coins": 5,
  "totalSpent": 10,
  "totalEarned": 5000
}
```

### 2. `POST /api/wallet/purchase`
**Purpose:** Initialize coin purchase via Chapa

**Request:**
```json
{
  "packageId": "pro",
  "coins": 25,
  "price": 200
}
```

**Response:**
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.chapa.co/...",
  "txRef": "coin-pro-123456"
}
```

### 3. `POST /api/wallet/verify`
**Purpose:** Verify payment and add coins (webhook)

**Request:**
```json
{
  "txRef": "coin-pro-123456",
  "status": "success"
}
```

### 4. `POST /api/applications/apply`
**Purpose:** Apply to gig (deduct coins)

**Request:**
```json
{
  "gigId": "abc123",
  "cost": 1
}
```

**Logic:**
1. Check user's coin balance ≥ cost
2. If yes: deduct coins, create application record
3. Return success/failure

### 5. `POST /api/payments/hire`
**Purpose:** Client pays to hire freelancer

**Request:**
```json
{
  "freelancerId": "user-abc",
  "gigId": "gig-123",
  "amount": 5000,
  "platformFee": 500
}
```

**Response:**
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.chapa.co/...",
  "txRef": "hire-gig123-user456"
}
```

### 6. `POST /api/payments/webhook`
**Purpose:** Handle Chapa payment callbacks

**Logic:**
- Verify payment signature
- Update payment status
- For coin purchase: add coins to wallet
- For hiring: mark freelancer as hired, record payment

---

## Chapa Integration Details

### Test Credentials (Already Configured)
```
Secret Key: CHASECK_TEST-4S5bcVWDE4np4nSC9lrKZbeJhdPNeqxJ
Base URL: https://api.chapa.co/v1
```

### Payment Flows

**Coin Purchase Flow:**
```
User clicks "Buy" → API /wallet/purchase → Chapa Checkout → 
Success → Webhook updates wallet → User redirected to dashboard
```

**Hire Freelancer Flow:**
```
Client clicks "Hire" → API /payments/hire → Chapa Checkout →
Success → Webhook records payment → Gig marked as hired
```

---

## Updated Page Logic

### `/buy-coins`
- Replace mock button with real Chapa checkout
- Pass `paymentType: "coin_purchase"` to API

### `/services`
- Replace local state with real wallet check via API
- Show "Insufficient coins" if balance < cost

### `/freelancer/dashboard`
- Fetch real wallet data via `GET /api/wallet`
- Show actual transactions from `coin_purchases` table

### `/client/gigs/[id]`
- Real hiring with payment integration

---

## Implementation Order (Backend)

1. **Database:**
   - Run migrations to create new tables
   - Add policies for RLS

2. **API Routes:**
   - Create `/api/wallet/get` (GET)
   - Create `/api/wallet/purchase` (POST)
   - Create `/api/wallet/verify` (POST - webhook)
   - Create `/api/applications/apply` (modify existing)
   - Create `/api/payments/hire` (POST)
   - Create `/api/payments/webhook` (POST)

3. **Frontend Updates:**
   - Replace Zustand store with API calls
   - Add loading states
   - Handle errors gracefully

4. **Testing:**
   - Test coin purchase flow (use test card)
   - Test application flow
   - Test hiring flow (use test card)

---

## Testing Credentials (Chapa Test Mode)

### Test Card (Visa)
- Card: `4200 0000 0000 0000`
- Expiry: `12/34`
- CVV: `123`
- OTP: `12345`

### Test TeleBirr
- Phone: `0900123456`
- OTP: `12345`

---

## Notes

1. **First 5 Free Coins:** Handle via database default value (5 coins) on user creation, or add trigger on profile creation

2. **Platform Fee:** Suggested 10% of gig budget (e.g., 5000 ETB gig = 500 ETB fee)

3. **Payouts:** For demo, skip actual freelancer payouts. Record earnings in database but don't process real transfers. This can be added post-graduation with Stripe Connect or similar.

4. **Security:** Always verify Chapa webhooks with signature validation before updating any data.

---

## Summary

| Phase | Focus | Key Deliverables |
|-------|-------|------------------|
| Part 1 | Frontend (Mock) | Buy coins page, wallet display, apply flow, hire flow |
| Part 2 | Backend (Real) | Database tables, API routes, Chapa integration, webhook handling |

This plan gives you a working payment system ready for your graduation demo.
