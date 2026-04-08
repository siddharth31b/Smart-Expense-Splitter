# Smart Expense Splitter

Assignment implementation for NeevAI SuperCloud Pvt. Ltd.

This project is a lightweight expense-splitting web app built with Next.js 14, TypeScript, and Tailwind CSS. It lets users create groups, add members, split expenses equally or with custom shares, view live balances, and track settlements. Optional AI helpers are included for expense categorization and spending insights, with local fallbacks when no API key is configured.

## Assignment Coverage

Implemented from the PDF:

- Create groups and add members
- Add shared expenses
- Split expenses equally or with custom amounts
- Calculate balances automatically
- Show who owes whom
- Provide a settlement summary
- Ready for deployment on Vercel or Netlify

Good-to-have AI features implemented:

- Smart expense categorization
- Spending insights and analytics
- Graceful non-AI fallback when no API key is present

Additional improvements:

- Add members after group creation
- Persist completed settlements
- Filter and sort expense history
- Recent settlement history on the group page
- Cross-tab localStorage syncing

## Tech Stack

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- Recharts
- Lucide React
- UUID
- localStorage for persistence
- Anthropic API for optional AI features

## Project Structure

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
    expenses/
    groups/
    settlements/
    ui/
  hooks/
    useGroups.ts
  lib/
    calculations.ts
    storage.ts
    utils.ts
  types/
    index.ts
```

## Architecture Notes

- Client state is stored in `localStorage` for a fast, zero-backend workflow.
- API routes are used as validation and orchestration layers for group creation, expenses, settlements, and AI operations.
- Core financial logic lives in `src/lib/calculations.ts`.
- `useGroups` centralizes group CRUD, expense updates, member additions, and settlement persistence.
- The app remains usable even without an AI key by falling back to local keyword-based categorization and generated insights.

## Main Features

### 1. Group Management

- Create a group with name, description, and at least two members
- Add more members later from the group details page
- Duplicate member names and emails are validated

### 2. Expense Management

- Add expense description, amount, date, payer, and category
- Equal split across all members
- Custom split with per-member amount entry
- Expense history with sorting and date filters

### 3. Balances and Settlements

- Automatic per-member balance calculation
- Suggested debt settlements using a greedy minimum-transaction approach
- Mark a suggested settlement as completed
- View recent completed settlements

### 4. Analytics

- Category-wise spend breakdown
- Daily spending chart for recent expenses
- AI insights panel for spending patterns

### 5. AI Features

- Expense category suggestion from description
- Spending insights based on expense history
- Local fallback logic when `ANTHROPIC_API_KEY` is not configured

## Local Setup

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Environment Variables

Create `.env.local` if you want live AI responses:

```env
ANTHROPIC_API_KEY=your_key_here
```

Without this key, the app still works and uses local fallback logic for AI features.

### Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Verification

Commands used after the updates:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

All three completed successfully.

## Deployment

### Vercel

```bash
npm run build
```

Then import the repository into Vercel and add `ANTHROPIC_API_KEY` if AI features should use Anthropic.

### Netlify

- Build command: `npm run build`
- Publish directory: `.next`

## Notes

- Data is persisted in browser `localStorage`, so it is device/browser local by design.
- Real multi-user sync is not implemented because the assignment did not require a full backend.
- Deployment still needs to be done from your GitHub/Vercel/Netlify account.

## Submission Checklist

- Public GitHub repository
- Updated README
- Demo video under 5 minutes
- Deployed app link
