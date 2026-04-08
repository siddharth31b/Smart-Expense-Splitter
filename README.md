# Smart Expense Splitter

Professional assignment implementation for NeevAI SuperCloud Pvt. Ltd.

This project is a lightweight expense-splitting web application built with Next.js 14, TypeScript, and Tailwind CSS. It helps users create groups, add members, record shared expenses, split them equally or with custom shares, calculate live balances, and settle debts with a clean local-first UX. Optional AI helpers are included for expense categorization and spending insights, with graceful local fallbacks when an API key is not configured.

## Problem Statement Coverage

The shared PDF asked for a Smart Expense Splitter that should:

- create groups and add members
- add and split shared expenses equally or custom
- calculate balances automatically
- clearly show who owes whom
- provide a debt and settlement summary
- be deployable on Vercel or Netlify

This codebase implements all of the product requirements inside the PDF. The only step that still depends on your own accounts is final public deployment and GitHub submission.

## Evaluation Criteria Mapping

### 1. Feature Completion

Implemented:

- group creation with validation
- member creation during group setup
- member addition after group creation
- equal split expenses
- custom split expenses
- automatic balance calculation
- suggested settlements
- settlement history persistence
- expense analytics dashboard
- AI categorization
- AI spending insights

### 2. Code Quality and Scalability

Implemented:

- modular separation across `app`, `components`, `hooks`, `lib`, and `types`
- reusable UI primitives such as `Modal`, `Badge`, and `MemberChip`
- central business logic in `src/lib/calculations.ts`
- centralized group state management in `src/hooks/useGroups.ts`
- API route validation for groups, expenses, settlements, and AI requests
- updated README with architecture and setup notes

### 3. Real-Time Performance

Implemented:

- instant UI updates through local state plus `localStorage`
- cross-tab synchronization using the browser `storage` event
- local-first persistence with no backend roundtrip needed for main flows
- lightweight client-side balance and settlement calculations

### 4. AI Accuracy

For this project, the PDF product scope is expense categorization and spending insights. One evaluation line in the PDF mentions email categorization and suggested replies, which appears to be unrelated to this assignment. This implementation aligns AI with the actual Smart Expense Splitter problem statement.

Implemented:

- AI-based expense categorization endpoint
- AI-based spending insight endpoint
- keyword-based fallback categorization when no API key is present
- fallback insight generation when external AI is unavailable

### 5. UX and UI

Implemented:

- responsive dashboard
- clear group overview cards
- filterable and sortable expense history
- clean balances and settlement views
- accessible modal-based flows for creating groups, adding members, and adding expenses
- improved member name display using reusable chips instead of ambiguous initials

### 6. Bonus Features and Optimizations

Implemented:

- settlement completion tracking
- settlement history
- post-creation member management
- AI fallback mode
- reusable `MemberChip` component to reduce repeated markup

## Current Folder Structure

```text
src/
  app/
    api/
      ai/route.ts
      expenses/route.ts
      groups/route.ts
      settlements/route.ts
    groups/[id]/page.tsx
    globals.css
    layout.tsx
    page.tsx
  components/
    dashboard/
      AIInsightsPanel.tsx
      SpendingChart.tsx
    expenses/
      AddExpenseModal.tsx
      ExpenseList.tsx
    groups/
      AddMemberModal.tsx
      CreateGroupModal.tsx
      GroupCard.tsx
    settlements/
      BalanceCard.tsx
      SettlementList.tsx
    ui/
      Badge.tsx
      MemberChip.tsx
      Modal.tsx
  hooks/
    useGroups.ts
  lib/
    calculations.ts
    storage.ts
    utils.ts
  types/
    index.ts
```

This structure is intentionally organized by responsibility:

- `app/` handles routes and pages
- `components/` contains UI and feature-specific React components
- `hooks/` contains reusable client logic
- `lib/` contains shared business logic and helpers
- `types/` contains domain models

## Architecture Overview

### Frontend

- Next.js 14 App Router
- React 18 client components for interactive flows
- Tailwind CSS for styling
- Recharts for analytics visualizations

### Data Layer

- browser `localStorage` as the persistence layer
- `useGroups` as the primary client-side data orchestration hook
- normalization in `storage.ts` to keep persisted data shape stable

### Business Logic

- `calculations.ts` computes balances, settlements, and summaries
- settlement history is applied on top of expenses so balances remain accurate after settle-up actions

### API Layer

- `POST /api/groups` validates and shapes group data
- `POST /api/expenses` validates expense and split data
- `POST /api/settlements` returns balances and suggested settlements
- `POST /api/ai` handles categorization and insight generation

## Main Features

### Group Management

- create groups with name and optional description
- require at least two unique members at creation time
- add more members later from the group details page

### Expense Management

- add expense description, amount, date, category, and payer
- split equally across all members
- split with custom per-member values
- validate that custom split totals match the expense total
- filter expenses by date
- sort expenses by newest, oldest, highest, and lowest

### Balances and Settlements

- real-time per-member balances
- greedy settlement suggestion algorithm to minimize transactions
- mark settlements as completed
- persist completed settlement history

### Analytics and AI

- category distribution chart
- daily spending chart
- AI insight panel
- AI categorization on description blur
- local fallback insights when external AI is unavailable

## Setup

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Environment Variables

Create `.env.local` to enable live AI calls:

```env
ANTHROPIC_API_KEY=your_key_here
```

Without this key, the app still works. It automatically falls back to local categorization and locally generated insights.

### Run Locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Verification

The project was verified with:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Deployment

The PDF requires deployment on Vercel or Netlify. The project is deployment-ready, but the final deployment itself must be done from your own account.

### Vercel

- import the project into Vercel
- set `ANTHROPIC_API_KEY` if you want live AI responses
- deploy

### Netlify

- build command: `npm run build`
- publish directory: `.next`

## Submission Checklist

- public GitHub repository
- updated README
- demo video under 5 minutes
- deployed app link

## Notes

- data is browser-local by design because the assignment did not require a full backend
- multi-user cloud sync is not implemented
- the core assignment requirements from the PDF are implemented in this repository
