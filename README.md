# Smart Expense Splitter

Assignment implementation for NeevAI SuperCloud Pvt. Ltd.

Smart Expense Splitter is a lightweight group expense management web app built with Next.js 14, TypeScript, and Tailwind CSS. It helps users create groups, add members, record shared expenses, split costs equally or with custom amounts, track balances in real time, and view clear settlement suggestions. The app also includes optional AI support for expense categorization and spending insights, with local fallbacks so the product remains usable even without a live API key.

## Assignment Overview

The PDF asks for a web application that:

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
2. Push the code and update the README with setup instructions, architecture details, and feature implementation.
3. Record a demo video under 5 minutes.
4. Deploy the app on Vercel or Netlify.

## Project Status

- core Smart Expense Splitter features: implemented
- responsive UI for mobile, tablet, and laptop: implemented
- AI categorization and spending insights: implemented
- Vercel deployment target: configured
- public GitHub repo, final live URL, and demo video: to be completed from your accounts

## Feature Implementation

### Group Management

- create groups with name, optional description, and at least two members
- validate duplicate member names and duplicate emails
- add members after group creation
- persist groups locally and restore them on refresh

### Expense Management

- add expenses with description, amount, category, date, payer, and split type
- split expenses equally across all members
- split expenses with custom per-member amounts
- validate custom split totals against the full amount
- sort and filter expense history

### Balances and Settlements

- calculate balances automatically after every expense or settlement
- show who owes whom and how much
- suggest settlements to reduce the number of transactions
- persist completed settlement history

### Analytics and AI

- category distribution chart
- daily spending chart
- AI expense categorization
- AI-generated spending insights
- local fallback logic when the API key is not configured

### UX and UI

- responsive layout across mobile, tablet, and laptop breakpoints
- modal-based flows for creating groups, adding members, and adding expenses
- clearer group header and member presentation
- full-name member chips instead of initials-only badges

## Evaluation Criteria Mapping

### Feature Completion

The core assignment requirements from the PDF are implemented, along with optional analytics and AI helpers.

### Code Quality and Scalability

The codebase is modular and separated by route, feature, shared business logic, and types. Reusable utilities and UI primitives reduce duplication and keep the project easier to extend.

### Real-Time Performance

The app uses a local-first flow with instant UI updates and `localStorage` persistence. Cross-tab synchronization is supported through the browser `storage` event.

### AI Accuracy

AI is applied to the Smart Expense Splitter workflow from the PDF: expense categorization and spending insights. If a live API key is unavailable, the app falls back to deterministic local logic instead of breaking the experience.

### UX and UI

The interface is designed to be clean, fast, and easy to use for common group-expense workflows.

### Bonus Points

Additional improvements include settlement history persistence, reusable member chips, AI fallback mode, responsive layout polish, and professional project documentation.

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
- client-side interactive components for group, expense, settlement, and analytics flows
- reusable UI layer for shared presentation patterns

### State and Persistence

- browser `localStorage` acts as the persistence layer
- `useGroups` is the primary client hook for group state orchestration
- storage normalization keeps persisted data predictable

### Business Logic

- `src/lib/calculations.ts` handles balances and settlement calculations
- `src/lib/utils.ts` contains formatting and shared helpers
- domain types are centralized in `src/types/index.ts`

### API Layer

The app exposes lightweight API routes for validation and AI request handling:

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
├─ .env.example
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

Use `.env.example` as the template for required environment variables.

Create `.env.local` in the project root and add your real values:

```env
OPENAI_API_KEY=your_real_openai_api_key
OPENAI_MODEL=gpt-4.1-mini
```

Environment file roles:

- `.env.local`: real local secrets, never commit this file
- `.env.example`: safe sample file for setup reference and deployment guidance

If `OPENAI_API_KEY` is not set, the app still works using local fallback logic for categorization and insights.

### 3. Start the Development Server

```bash
npm run dev
```

Open `http://localhost:3000`.

## AI Setup

The app can use OpenAI for two AI-assisted flows:

- expense categorization from the expense description
- spending insights on the analytics tab

To enable live AI:

1. Create an OpenAI API key in your OpenAI dashboard.
2. Put the key in `.env.local` as `OPENAI_API_KEY`.
3. Optionally set `OPENAI_MODEL` if you want to override the default model.
4. Restart the dev server after changing env values.

If no key is provided, the app uses local fallback logic so the product remains functional.

## Usage Flow

1. Create a group with at least two members.
2. Open the group details page.
3. Add shared expenses and choose equal or custom split mode.
4. Review live balances, debt summary, and settlement suggestions.
5. Mark settlements as completed when members settle up.
6. Use the analytics tab for spending insights.

## Verification

The project has been verified with:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Deployment

This project is intended to be deployed on Vercel.

### Deploy on Vercel

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Add these environment variables in Vercel:
   `OPENAI_API_KEY`
   `OPENAI_MODEL` (optional)
4. Deploy the project.

After deployment, update this README with:

- your public GitHub repository link
- your live Vercel URL
- your demo video link

### Production Notes

- the app is local-first, so expense data is stored in the browser
- different browsers/devices will not automatically share the same local data
- OpenAI-powered features require environment variables in Vercel if you want live AI in production

## Submission Checklist

Before final submission, complete the remaining PDF submission steps:

- create a public GitHub repository
- push the latest code
- keep this README updated
- record a demo video under 5 minutes
- deploy on Vercel
- share the repository link and live deployment link

## Assumptions and Scope Notes

- this implementation is local-first and stores data in the browser
- a full backend and multi-user server sync were not required by the PDF
- AI is applied to expense workflows because that matches the Smart Expense Splitter problem statement
- the final public GitHub repository, deployed Vercel URL, and demo video depend on your own accounts

## Author Note

This codebase was organized and documented to match the assignment intent: a lightweight, user-friendly, quickly deployable Smart Expense Splitter with clean structure, scalable code organization, and polished UX.
