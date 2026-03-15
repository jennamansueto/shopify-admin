# Meridian Commerce Admin

A modern commerce admin dashboard for managing orders, viewing analytics, and monitoring store performance. Built with Next.js, TypeScript, Prisma, and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: SQLite via Prisma ORM
- **Styling**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Setup

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Create database and apply schema
pnpm db:push

# Seed the database with realistic data
pnpm db:seed

# Start the development server
pnpm dev
```

Or run everything at once:

```bash
pnpm setup
pnpm dev
```

The application will be available at `http://localhost:3000`.

### Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - SQLite database path (default: `file:./dev.db`)

## Application Structure

### Pages

| Route | Status | Description |
|-------|--------|-------------|
| `/` | Implemented | Home dashboard with KPIs, activity feed, and alerts |
| `/orders` | Implemented | Order management with filtering, sorting, search, and pagination |
| `/orders/[id]` | Implemented | Order detail view with fulfillment and cancellation actions |
| `/analytics` | Implemented | Analytics dashboard with charts, KPIs, and report generation |
| `/products` | Placeholder | Product catalog management |
| `/customers` | Placeholder | Customer directory |
| `/reports` | Placeholder | Business report generation |
| `/settings` | Placeholder | Store configuration |

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/home` | GET | Home dashboard data (KPIs, activity, alerts) |
| `/api/orders` | GET | Paginated orders with filtering and sorting |
| `/api/orders/[id]` | GET | Single order detail |
| `/api/orders/[id]/fulfill` | POST | Mark order as fulfilled |
| `/api/orders/[id]/cancel` | POST | Cancel an order |
| `/api/analytics` | GET | Analytics KPIs, breakdowns, and top products |
| `/api/analytics/timeseries` | GET | Time series chart data |
| `/api/reports` | GET/POST | List reports or generate a new report |
| `/api/reports/[id]` | GET | Report job status |

### Data Model

- **Customer** - Customer profiles with contact info and lifetime metrics
- **Product** - Product catalog with pricing, inventory, and vendor info
- **Order** - Orders with status tracking, payment, and fulfillment states
- **OrderLineItem** - Individual items within an order
- **ActivityEvent** - Audit trail of store events
- **ReportJob** - Background report generation jobs
- **AnalyticsAggregate** - Pre-computed daily analytics metrics

### Seed Data

The seed script generates:
- 24 customers with realistic profiles
- 30 products across multiple categories and vendors
- 85 orders spanning 90 days with varied statuses
- 30 activity events
- 90 daily analytics aggregates

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:seed` | Seed database |
| `pnpm db:reset` | Reset and re-seed database |
| `pnpm setup` | Full setup (install + db) |

## Project Structure

```
src/
  app/
    api/            # API route handlers
    analytics/      # Analytics page
    customers/      # Customers placeholder
    orders/         # Orders list and detail pages
    products/       # Products placeholder
    reports/        # Reports placeholder
    settings/       # Settings placeholder
    globals.css     # Global styles and theme
    layout.tsx      # Root layout with sidebar
    page.tsx        # Home dashboard
  components/
    analytics/      # Chart and analytics components
    home/           # Home page components
    layout/         # Sidebar and header
    orders/         # Order table and filters
    ui/             # Reusable UI primitives
  lib/
    prisma.ts       # Prisma client singleton
    logger.ts       # Structured logging
    request-id.ts   # Request ID generation
    types.ts        # TypeScript interfaces
    utils.ts        # Formatting and utility functions
prisma/
  schema.prisma     # Database schema
  seed.ts           # Data seeding script
```
