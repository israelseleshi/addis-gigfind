# Feature Specification 10: Testing & Deployment

## 1. Executive Summary
Comprehensive testing strategy and deployment guide for Addis GigFind. Includes unit tests, integration tests, E2E tests with Cypress, and deployment configuration.

## 2. Testing Strategy Overview

### 2.1 Testing Pyramid
```
        /\
       /  \      E2E Tests (Cypress)
      /____\     ~20 tests
     /      \
    /   Integration   ~50 tests
   /____      \
  /      \     Unit Tests (Vitest)
 /____    \    ~100 tests
```

### 2.2 Test Coverage Goals
- Minimum 80% code coverage
- 100% coverage on critical paths (auth, payments, data mutations)
- All business rules must have corresponding tests

## 3. Unit Tests (Vitest)

### 3.1 Zod Schema Tests
```typescript
// tests/unit/schemas/auth.test.ts
import { describe, it, expect } from 'vitest'
import { clientSignUpSchema, loginSchema } from '@/lib/validations/auth'

describe('Auth Schemas', () => {
  describe('clientSignUpSchema', () => {
    it('should pass with valid data', () => {
      const validData = {
        fullName: 'Abebe Kebede',
        email: 'abebe@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        companyName: 'Tech Solutions',
        industry: 'Technology',
        location: 'Bole',
        phone: '0912345678',
      }
      const result = clientSignUpSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should fail with invalid email', () => {
      const invalidData = {
        fullName: 'Abebe Kebede',
        email: 'invalid-email',
        password: 'password123',
        confirmPassword: 'password123',
        companyName: 'Tech Solutions',
        industry: 'Technology',
        location: 'Bole',
        phone: '0912345678',
      }
      const result = clientSignUpSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should fail with mismatched passwords', () => {
      const mismatchedData = {
        fullName: 'Abebe Kebede',
        email: 'abebe@test.com',
        password: 'password123',
        confirmPassword: 'differentpassword',
        companyName: 'Tech Solutions',
        industry: 'Technology',
        location: 'Bole',
        phone: '0912345678',
      }
      const result = clientSignUpSchema.safeParse(mismatchedData)
      expect(result.success).toBe(false)
    })

    it('should fail with short password', () => {
      const shortPasswordData = {
        fullName: 'Abebe Kebede',
        email: 'abebe@test.com',
        password: '123',
        confirmPassword: '123',
        companyName: 'Tech Solutions',
        industry: 'Technology',
        location: 'Bole',
        phone: '0912345678',
      }
      const result = clientSignUpSchema.safeParse(shortPasswordData)
      expect(result.success).toBe(false)
    })
  })

  describe('loginSchema', () => {
    it('should pass with valid credentials', () => {
      const validData = {
        email: 'abebe@test.com',
        password: 'password123',
      }
      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should fail with invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'password123',
      }
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})
```

### 3.2 Utility Function Tests
```typescript
// tests/unit/utils/formatting.test.ts
import { describe, it, expect } from 'vitest'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'

describe('Formatting Utilities', () => {
  describe('formatCurrency', () => {
    it('should format ETB correctly', () => {
      expect(formatCurrency(500)).toBe('500 ETB')
      expect(formatCurrency(1234.56)).toBe('1,234.56 ETB')
    })
  })

  describe('formatRelativeTime', () => {
    it('should return "Just now" for recent times', () => {
      const recent = new Date(Date.now() - 30000)
      expect(formatRelativeTime(recent)).toBe('Just now')
    })

    it('should return minutes for times under an hour', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago')
    })
  })
})
```

### 3.3 Component Tests (React Testing Library)
```typescript
// tests/unit/components/button.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('should render children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })

  it('should be disabled when disabled prop is set', () => {
    render(<Button disabled>Click me</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

## 4. E2E Tests (Cypress)

### 4.1 Cypress Configuration
```typescript
// cypress.config.ts
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    env: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
  },
})
```

### 4.2 Auth Flow Tests
```typescript
// cypress/e2e/auth.cy.ts
describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
  })

  describe('Client Registration', () => {
    it('should register a new client successfully', () => {
      cy.visit('/register')
      
      // Select Client role
      cy.get('[role="tab"]').contains('Client').click()
      
      // Fill form
      cy.get('input[name="fullName"]').type('Abebe Kebede')
      cy.get('input[name="email"]').type('abebe.test@example.com')
      cy.get('input[name="password"]').type('SecurePass123!')
      cy.get('input[name="confirmPassword"]').type('SecurePass123!')
      cy.get('input[name="companyName"]').type('Tech Solutions')
      cy.get('select[name="industry"]').select('Technology')
      cy.get('select[name="location"]').select('Bole')
      cy.get('input[name="phone"]').type('0912345678')
      
      // Submit
      cy.get('button[type="submit"]').click()
      
      // Should redirect to onboarding
      cy.url().should('include', '/onboarding')
    })

    it('should show validation errors for empty form', () => {
      cy.visit('/register')
      cy.get('button[type="submit"]').click()
      
      cy.contains('Full name must be at least 2 characters').should('be.visible')
      cy.contains('Invalid email address').should('be.visible')
      cy.contains('Password must be at least 8 characters').should('be.visible')
    })
  })

  describe('Login', () => {
    it('should login successfully with valid credentials', () => {
      cy.visit('/login')
      
      cy.get('input[name="email"]').type('test@example.com')
      cy.get('input[name="password"]').type('password123')
      cy.get('button[type="submit"]').click()
      
      // Should redirect based on role
      cy.url().should('match', /\/(dashboard|find-work)/)
    })

    it('should show error for invalid credentials', () => {
      cy.visit('/login')
      
      cy.get('input[name="email"]').type('wrong@example.com')
      cy.get('input[name="password"]').type('wrongpassword')
      cy.get('button[type="submit"]').click()
      
      cy.contains('Invalid login credentials').should('be.visible')
    })
  })
})
```

### 4.3 Gig Flow Tests
```typescript
// cypress/e2e/gigs.cy.ts
describe('Gig Management', () => {
  beforeEach(() => {
    // Login as client
    cy.login('client@test.com', 'password123')
  })

  describe('Create Gig', () => {
    it('should create a new gig successfully', () => {
      cy.visit('/client/gigs/new')
      
      cy.get('input[name="title"]').type('Web Development for Restaurant')
      cy.get('textarea[name="description"]').type(
        'Looking for a web developer to create a website for our restaurant. ' +
        'The website should have menu display, online ordering, and reservation system.'
      )
      cy.get('select[name="category"]').select('Web Development')
      cy.get('input[name="budget"]').type('5000')
      cy.get('select[name="location"]').select('Bole')
      
      cy.get('button[type="submit"]').click()
      
      // Should redirect to dashboard
      cy.url().should('include', '/dashboard')
      cy.contains('Web Development for Restaurant').should('be.visible')
    })

    it('should fail with budget below minimum', () => {
      cy.visit('/client/gigs/new')
      
      cy.get('input[name="title"]').type('Test Gig')
      cy.get('textarea[name="description"]').type('Test description')
      cy.get('select[name="category"]').select('Web Development')
      cy.get('input[name="budget"]').type('50') // Below 100 ETB minimum
      cy.get('select[name="location"]').select('Bole')
      
      cy.get('button[type="submit"]').click()
      
      cy.contains('Minimum budget is 100 ETB').should('be.visible')
    })
  })

  describe('View Applicants', () => {
    it('should show applicants for a gig', () => {
      cy.visit('/client/dashboard')
      cy.contains('View Applicants').click()
      
      // Should show applications list
      cy.url().should('include', '/applicants')
    })

    it('should accept an applicant', () => {
      cy.visit('/client/gigs/123/applicants')
      
      cy.contains('Accept').first().click()
      cy.contains('Confirm Hire').click()
      
      // Application status should change
      cy.contains('Accepted').should('be.visible')
    })
  })
})
```

### 4.4 Freelancer Flow Tests
```typescript
// cypress/e2e/freelancer.cy.ts
describe('Freelancer Features', () => {
  beforeEach(() => {
    cy.login('freelancer@test.com', 'password123')
  })

  describe('Browse Gigs', () => {
    it('should display available gigs', () => {
      cy.visit('/freelancer/find-work')
      
      cy.contains('Available Gigs').should('be.visible')
      cy.get('[data-testid="gig-card"]').should('have.length.at.least', 1)
    })

    it('should filter gigs by category', () => {
      cy.visit('/freelancer/find-work')
      
      cy.get('select[name="category"]').select('Web Development')
      cy.get('button[type="submit"]').click()
      
      // All displayed gigs should be Web Development
      cy.get('[data-testid="gig-category"]').each(($el) => {
        expect($el.text()).toContain('Web Development')
      })
    })
  })

  describe('Apply for Gig', () => {
    beforeEach(() => {
      // Ensure freelancer is verified
      cy.visit('/freelancer/verification')
      // Upload verification documents if not verified
    })

    it('should apply for a gig successfully', () => {
      cy.visit('/freelancer/find-work')
      cy.contains('Apply Now').first().click()
      
      // Fill application form
      cy.get('textarea[name="coverLetter"]').type(
        'I am interested in this position. I have 3 years of experience...'
      )
      cy.get('input[name="proposedBudget"]').type('4500')
      
      cy.get('button[type="submit"]').click()
      
      cy.contains('Application submitted successfully').should('be.visible')
    })

    it('should block application if not verified', () => {
      // Set verification_status to 'unverified' for test
      cy.visit('/freelancer/find-work')
      
      cy.contains('Apply Now').should('be.disabled')
      cy.contains('Verify your ID to apply').should('be.visible')
    })

    it('should block application if 5 active applications exist', () => {
      // Create 5 pending applications
      cy.createMultipleApplications(5)
      
      cy.visit('/freelancer/find-work')
      
      cy.contains('Apply Now').click()
      cy.contains('You can only have 5 active applications').should('be.visible')
    })
  })
})
```

### 4.5 Chat Tests
```typescript
// cypress/e2e/chat.cy.ts
describe('Chat System', () => {
  beforeEach(() => {
    cy.login('client@test.com', 'password123')
  })

  it('should send and receive messages in real-time', () => {
    cy.visit('/chat')
    cy.contains('Start Chat').click()
    
    cy.get('input[name="message"]').type('Hello, are you available?')
    cy.get('button[type="submit"]').click()
    
    // Message should appear immediately
    cy.contains('Hello, are you available?').should('be.visible')
  })
})
```

## 5. Deployment Configuration

### 5.1 Vercel Configuration
```json
// vercel.json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

### 5.2 Environment Variables
```bash
# .env.example
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_URL_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_URL_SERVICE_ROLE_KEY=your-service-role-key
```

### 5.3 Database Migration Script
```typescript
// scripts/migrate.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function migrate() {
  console.log('Starting database migration...')
  
  // Run migrations in order
  const migrations = [
    '001_create_tables.sql',
    '002_create_triggers.sql',
    '003_create_policies.sql',
    '004_create_functions.sql',
  ]
  
  for (const migration of migrations) {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: readFileSync(`./migrations/${migration}`, 'utf8'),
    })
    
    if (error) {
      console.error(`Migration ${migration} failed:`, error)
      process.exit(1)
    }
    
    console.log(`Migration ${migration} completed`)
  }
  
  console.log('All migrations completed successfully')
}

migrate()
```

## 6. CI/CD Pipeline

### 6.1 GitHub Actions Workflow
```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run linting
        run: pnpm lint
      
      - name: Run type checking
        run: pnpm type-check
      
      - name: Run unit tests
        run: pnpm test:unit
      
      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 7. Implementation Checklist

- [ ] Set up Vitest configuration
- [ ] Create unit tests for all Zod schemas
- [ ] Create unit tests for utility functions
- [ ] Create unit tests for components
- [ ] Set up Cypress configuration
- [ ] Create E2E tests for auth flow
- [ ] Create E2E tests for gig management
- [ ] Create E2E tests for freelancer features
- [ ] Create E2E tests for chat system
- [ ] Create E2E tests for reviews
- [ ] Configure Vercel deployment
- [ ] Set up environment variables
- [ ] Create database migration scripts
- [ ] Configure GitHub Actions workflow
- [ ] Set up Codecov integration
- [ ] Achieve 80% test coverage

## 8. Testing Strategy

### 8.1 Critical Paths to Test
1. User registration and login
2. Gig creation and management
3. Freelancer application process
4. Chat messaging
5. Review system
6. Verification workflow

### 8.2 Test Data Management
- Use Supabase test database
- Reset database before each E2E test suite
- Use fixtures for common test data

## 9. Related Files
- **Auth Spec:** specs/F01_Auth_Spec.md
- **Gig Management Spec:** specs/F03_GigManagement_Spec.md
- **Freelancer Features Spec:** specs/F04_FreelancerFeatures_Spec.md
- **Chat Spec:** specs/F05_ChatCommunication_Spec.md
- **Reviews Spec:** specs/F06_ReviewsRatings_Spec.md
- **Tasks:** tasks.md (Phase 10)

## 10. Status
- **Created:** January 23, 2026
- **Last Updated:** January 23, 2026
- **Status:** Ready for Implementation
