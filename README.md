# Marginly — Agency Profitability Dashboard

> Stop discovering you lost money on clients last month.

Marginly is a real-time profitability dashboard for small digital agencies (1–10 people). Track client retainers, team costs, and time — and know your margin **before** month-end.

## Features

- 🎯 **Per-client profitability cards** — Revenue, Spent, Margin ($), Margin (%)
- 🔥 **Burn-rate projections** — Know if you're on track before month-end
- ⚠️ **At-risk warnings** — Alerts when projected margin drops below 30%
- 👥 **Team cost tracking** — Blended hourly rates per team member
- ⏱️ **Time logging** — Simple, fast time entry (client + member + hours)
- 📊 **Monthly summary table** — Sortable by margin %
- 🚀 **No backend required** — Uses localStorage for persistence

## Tech Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** + custom design system
- **Recharts** for data visualization
- **date-fns** for date calculations
- **localStorage** for data persistence (no DB needed)

## Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to see the landing page.

### Demo Account

Click "Try Demo Account" on the login page — it auto-creates a demo user with sample data.

Or register with any email/password (min 6 chars) to start fresh.

## Project Structure

```
marginly/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── login/page.tsx              # Auth: login
│   ├── register/page.tsx           # Auth: register
│   └── dashboard/
│       ├── layout.tsx              # Sidebar nav layout
│       ├── page.tsx                # Main dashboard
│       ├── clients/page.tsx        # Clients CRUD
│       ├── team/page.tsx           # Team members CRUD
│       └── time-entries/page.tsx   # Time entry logging
├── lib/
│   ├── types.ts                    # TypeScript interfaces
│   ├── storage.ts                  # localStorage CRUD helpers
│   ├── auth.ts                     # Simple auth (localStorage)
│   └── calculations.ts             # Profitability math
```

## Pricing

| Plan | Price | Users | Clients |
|------|-------|-------|---------|
| Solo | $29/mo | 1 | Up to 10 |
| Team | $59/mo | Up to 5 | Unlimited |
| Studio | $99/mo | Unlimited | Unlimited |

All plans include a 14-day free trial. No credit card required.

---

Built with ❤️ for agency owners who want to know their margins before it's too late.
