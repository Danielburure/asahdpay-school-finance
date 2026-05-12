
# AsahdPay School Fee Management System — Frontend Build Plan

A complete frontend-only SaaS UI for Kenyan schools. No backend, no real auth. Mock data everywhere. A "Demo Login" button routes straight to `/dashboard`.

## Design System

Tokens added to `src/styles.css` (oklch):
- `--primary`: cyan ~ `oklch(0.78 0.16 220)` (#00C2FF feel)
- `--primary-foreground`: near-black
- `--background`: white, `--muted`: soft gray
- `--foreground`: near-black for sidebars/text
- `--success`: green (paid), `--warning`: amber, `--destructive`: red (overdue)
- `--gradient-primary`, `--shadow-elegant`, `--shadow-card`
- Rounded-2xl cards, soft shadows, Inter font

Reusable components: `StatCard`, `SectionHeading`, `DataTable`, `StatusBadge`, `EmptyState`, `ChartCard`, `PageHeader`.

Mock data lives in `src/lib/mock/` (students, payments, receipts, sms, staff, audit, schools) with realistic Kenyan names, classes (Form 1–4 / Grade), KES amounts, Safaricom numbers.

## Routing (TanStack Start file-based)

Public site:
- `/` Homepage (navbar, hero, features, how it works, dashboard preview, benefits, testimonials, pricing preview, contact, footer)
- `/features`, `/pricing`, `/contact`

Dashboard (under layout `_dashboard.tsx` with sidebar + topbar, no auth gate):
- `/dashboard` — analytics overview
- `/dashboard/students` — table
- `/dashboard/students/$id` — profile
- `/dashboard/payments` — list
- `/dashboard/payments/record` — form
- `/dashboard/payments/manual-receipt` — manual receipt workflow
- `/dashboard/payments/unmatched` — unmatched M-Pesa
- `/dashboard/receipts` — receipts management + printable view
- `/dashboard/sms` — SMS center
- `/dashboard/reports` — reports + charts
- `/dashboard/staff` — staff mgmt
- `/dashboard/audit` — audit logs
- `/dashboard/settings` — school/paybill/SMS/term/notifications
- `/dashboard/billing` — subscription
- `/dashboard/support` — help center

Super admin (under `_admin.tsx` layout):
- `/admin` — SaaS overview + schools table

Demo Login: button on home → navigates to `/dashboard`.

## Layouts

`_dashboard.tsx`: shadcn `SidebarProvider` + `AppSidebar` (collapsible icon mode) + top navbar (school name select, search, notifications, profile, theme toggle) + `<Outlet />`.

`_admin.tsx`: similar shell with admin-flavored sidebar.

## Page Content (all mocked)

- **Dashboard**: 6 stat cards (Expected, Collected, Outstanding, Students w/ Balance, Today's Collections, Unmatched), recharts area + bar charts, recent payments table, overdue list, activity feed.
- **Students**: searchable/filterable table, class + balance filters, pagination, Add/Import/Export buttons (UI only).
- **Student profile**: details, parent info, balance summary, payment history, receipts, SMS history, action buttons.
- **Payments**: full table with filters and badges.
- **Record Payment**: form auto-fills student info on admission # entry (lookup mock list), Save / Save & SMS buttons.
- **Manual Receipt**: dedicated form, duplicate-receipt warning UI.
- **Unmatched Payments**: table with Assign/Review/Note actions (dialogs).
- **Receipts**: list + printable receipt modal styled like official document.
- **SMS Reminders**: composer, templates, target groups, preview, history, failed.
- **Reports**: cards + charts + date range + export buttons (UI only).
- **Staff**: table with roles, invite dialog.
- **Audit Logs**: timeline/table with old→new value diff display.
- **Settings**: tabbed interface for each section.
- **Billing**: current plan card, history table, invoice list with status badges.
- **Support**: contact form, WhatsApp CTA, FAQ accordion, status indicators.
- **Super Admin**: SaaS metrics + schools table.

## Technical Notes

- Tailwind v4 + shadcn (Card, Button, Table, Dialog, Tabs, Input, Select, Badge, Sidebar, Sonner, Accordion, Dropdown).
- Charts via `recharts` (already typical in shadcn).
- `head()` metadata per public route for SEO; dashboard routes get basic titles.
- No createServerFn, no Supabase, no auth — pure client UI.
- All forms are non-submitting (toast on action) to keep frontend-only.

## Out of Scope (deferred)

- Real M-Pesa integration, real SMS gateway, real auth, real DB — all to be wired later via Lovable Cloud.

Once approved I'll scaffold tokens + layouts + mock data, then build pages in batches (public → dashboard core → dashboard secondary → admin).
