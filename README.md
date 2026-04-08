# Smart Expense Splitter

Assignment implementation for NeevAI SuperCloud Pvt. Ltd.

Smart Expense Splitter is a lightweight group expense management web app built with Next.js 14, TypeScript, and Tailwind CSS. It helps users create groups, add members, record shared expenses, split costs equally or with custom amounts, track balances in real time, and view clear settlement suggestions. Optional AI enhancements are included for expense categorization and spending insights, with local fallbacks so the product remains usable without an external API key.

## Assignment Overview

The shared PDF asks for a web application that:

- enables users to create groups and add members
- allows adding and splitting expenses equally or with custom shares
- calculates and displays balances automatically
- provides a clear debt and settlement summary
- is deployed and accessible online through Vercel or Netlify

Good-to-have AI features in the PDF:

- smart expense categorization
- spending insights and analytics

Submission requirements mentioned in the PDF:

1. Create a public GitHub repository.
2. Push code and update the README with setup instructions, architecture details, and feature implementation.
3. Record a demo video under 5 minutes.
4. Deploy the app on Vercel or Netlify.

## Solution Summary

This repository implements the Smart Expense Splitter problem statement in a local-first architecture optimized for speed, simplicity, and smooth UX.

Implemented product outcomes:

- group creation with validation
- member management during creation and after creation
- equal split and custom split expenses
- automatic balance calculation
- debt summary and settlement suggestions
- settlement history tracking
- analytics dashboard with category and daily spending charts
- optional AI expense categorization
- optional AI-powered spending insights

Current submission status:

- application code: complete
- README and architecture documentation: complete
- deployment readiness: complete
- public GitHub repo: to be completed from your account
- demo video: to be completed by you
- final hosted link: to be completed from your account

## Feature Implementation

### 1. Group Management

- users can create a group with a name, optional description, and at least two members
- duplicate member names and duplicate emails are rejected
- users can add members later from the group details page
- groups are stored locally and restored on refresh

### 2. Expense Management

- users can add an expense with description, amount, category, date, payer, and split type
- equal split mode distributes the amount across all members
- custom split mode allows exact per-member allocations
- custom split values are validated against the total amount
- expense history supports sorting and filtering for easier review

### 3. Balances and Settlements

- balances are recalculated automatically after every expense or settlement
- the app shows who owes whom and how much
- a settlement suggestion algorithm minimizes the number of transactions
- completed settlements are persisted in group history

### 4. Analytics and AI

- spending charts show category distribution and recent daily spending
- AI categorization can infer categories from expense descriptions
- AI insights summarize spending behavior and unusual patterns
- if no API key is present, local fallback logic keeps AI-related UX functional

### 5. UX and UI

- responsive layout for desktop and mobile
- clear modal-based flows for creating groups, adding members, and adding expenses
- consistent reusable UI primitives
- readable balance and settlement presentation
- improved member display using full-name chips instead of ambiguous initials

## Evaluation Criteria Mapping

### Feature Completion

The core assignment requirements from the PDF are implemented, along with optional analytics and AI helpers.

### Code Quality and Scalability

The codebase is modular and separated by route, feature, shared business logic, and types. Reusable utilities and UI primitives are centralized to avoid duplication.

### UX and UI

The interface is designed to be lightweight, fast, and easy to understand during common group-expense workflows.

### Bonus Points

Additional improvements include settlement history persistence, reusable member chips, fallback AI mode, sorting and filtering support, and a cleaner assignment-ready documentation structure.

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Recharts
- Lucide React
- UUID

## Architecture

### Frontend

- App Router pages under `src/app`
- client-side interactive components for group, expense, and settlement workflows
- reusable UI layer for shared presentation patterns

### State and Persistence

- browser `localStorage` acts as the persistence layer
- `useGroups` is the main client hook for group state orchestration
- storage normalization keeps persisted data shape predictable

### Business Logic

- `src/lib/calculations.ts` handles balance and settlement calculations
- `src/lib/utils.ts` contains shared UI and formatting helpers
- domain types are centralized in `src/types/index.ts`

### API Layer

The app exposes lightweight API routes for validation and request shaping:

- `POST /api/groups`
- `POST /api/expenses`
- `POST /api/settlements`
- `POST /api/ai`

## Folder Structure

```text
smart-expense-splitter/
├─ src/
│  ├─ app/
│  │  ├─ api/
│  │  │  ├─ ai/route.ts
│  │  │  ├─ expenses/route.ts
│  │  │  ├─ groups/route.ts
│  │  │  └─ settlements/route.ts
│  │  ├─ groups/[id]/page.tsx
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  ├─ components/
│  │  ├─ dashboard/
│  │  │  ├─ AIInsightsPanel.tsx
│  │  │  └─ SpendingChart.tsx
│  │  ├─ expenses/
│  │  │  ├─ AddExpenseModal.tsx
│  │  │  └─ ExpenseList.tsx
│  │  ├─ groups/
│  │  │  ├─ AddMemberModal.tsx
│  │  │  ├─ CreateGroupModal.tsx
│  │  │  └─ GroupCard.tsx
│  │  ├─ settlements/
│  │  │  ├─ BalanceCard.tsx
│  │  │  └─ SettlementList.tsx
│  │  └─ ui/
│  │     ├─ Badge.tsx
│  │     ├─ MemberChip.tsx
│  │     └─ Modal.tsx
│  ├─ hooks/
│  │  └─ useGroups.ts
│  ├─ lib/
│  │  ├─ calculations.ts
│  │  ├─ storage.ts
│  │  └─ utils.ts
│  └─ types/
│     └─ index.ts
├─ package.json
├─ tailwind.config.js
├─ tsconfig.json
└─ README.md
```

Folder responsibilities:

- `src/app`: routes, pages, layout, and API endpoints
- `src/components`: feature-level and shared UI components
- `src/hooks`: reusable client-side state logic
- `src/lib`: business logic, persistence helpers, and utilities
- `src/types`: domain models and shared TypeScript types

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root.

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4.1-mini
```

If `OPENAI_API_KEY` is not set, the app still works using local fallback logic for categorization and insights.

### 3. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage Flow

1. Create a group with at least two members.
2. Open the group details page.
3. Add shared expenses and choose equal or custom split mode.
4. Review live balances, debt summary, and settlement suggestions.
5. Mark settlements as completed when members settle up.
6. Use the analytics and AI sections for spending insights.

## Verification

The project has been verified with:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Deployment

The PDF requires the app to be accessible online using Vercel or Netlify.

### Deploy on Vercel

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Add `OPENAI_API_KEY` in Vercel environment variables if live AI is required.
4. Optionally add `OPENAI_MODEL` if you want to override the default model.
5. Deploy the project.

### Deploy on Netlify

1. Push the repository to GitHub.
2. Import the repository into Netlify.
3. Configure the Next.js build settings as needed.
4. Add `OPENAI_API_KEY` if live AI is required.
5. Optionally add `OPENAI_MODEL` if you want to override the default model.
6. Deploy the project.

## Submission Checklist

Before final submission, complete the remaining PDF submission steps:

- create a public GitHub repository
- push the latest code
- keep this README updated
- record a demo video under 5 minutes
- deploy on Vercel or Netlify
- share the repository link and live deployment link

## Assumptions and Scope Notes

- this implementation is local-first and stores data in the browser
- a full backend and multi-user server sync were not required by the PDF
- AI is applied to expense workflows because that matches the Smart Expense Splitter problem statement
- the final deployment, public repository creation, and demo video depend on your own accounts and submission process

## Author Note

This codebase was organized and documented to match the assignment intent: a lightweight, user-friendly, quickly deployable Smart Expense Splitter with clean structure, scalable code organization, and polished UX.
