# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HFS (Hyper-personalized Feedback System) is a Next.js application for creating and managing customer feedback surveys. Restaurants can create surveys, generate QR codes, collect customer responses, and view analytics dashboards.

## Commands

### Development
```bash
npm run dev --turbopack  # Start development server with Turbopack
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
```

### Supabase
**Note:** This project uses **Supabase Cloud** for production. Local Supabase setup is not part of the standard development workflow.

```bash
# Only if you need local Supabase for backup/restore:
supabase start          # Start local Supabase instance
supabase status         # Check Supabase status
supabase db reset       # Reset local database
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS with custom theme system
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Charts**: Chart.js with react-chartjs-2
- **Forms**: react-hook-form with Zod validation

### Project Structure

```
app/
├── page.tsx                    # Landing page with hero, how-it-works, benefits
├── login/                      # Authentication
├── onboarding/                 # Restaurant setup (first-time users)
├── dashboard/                  # Analytics dashboard (requires survey ID param)
├── survey-creation/            # Survey builder UI
├── my-surveys/                 # List of user's surveys
├── survey/                     # Public survey form (accessed via QR code)
└── qr/                        # QR code display and printing

components/
├── ui/                        # shadcn/ui components
├── MainNavigationBar.tsx     # Primary navigation
├── PrintQRCode.tsx           # QR code generation and printing
└── Charts/                   # Chart components

utils/
├── supabase/
│   ├── client.ts            # Client-side Supabase client
│   ├── server.ts            # Server-side Supabase client
│   └── middelware.ts        # Auth middleware (note: typo in filename)
├── restaurant-utils.ts       # Restaurant code generation, QR code creation
└── user-utils.ts            # User restaurant info fetching

theme.ts                      # Centralized design system with gradient colors
```

### Database Schema

Key tables:
- `restaurants` - Restaurant info, unique codes, QR URLs
- `survey` - Survey metadata (title, location, status, restaurant_id, user_id)
- `survey_questions` - Questions with options array (typically 2 options for binary choice)
- `survey_responses` - Customer responses with question_answers JSONB field

### Authentication Flow

1. User signs in via `/login`
2. First-time users redirected to `/onboarding` to create restaurant
3. Restaurant gets unique 6-char code and QR code generated
4. All authenticated routes check for valid user and restaurant_id

### Survey Flow

**Creation:**
1. User navigates to `/survey-creation`
2. Select from question bank or create custom questions
3. Survey saved with draft/active status
4. QR code links to `/survey?code={restaurant_code}`

**Response Collection:**
1. Customer scans QR code
2. `/survey` page loads questions for that restaurant's active survey
3. Swipe-based UI for binary choice questions
4. Responses stored in `survey_responses` table

**Analytics:**
1. Dashboard accessed at `/dashboard?id={survey_id}`
2. Fetches responses and aggregates by question
3. Displays charts (Pie, Doughnut, Bar, Line) using Chart.js
4. Shows conversion rate, response trends, question breakdowns

### Theme System

The `theme.ts` file exports a centralized design system. **Always import and use theme utilities:**

```typescript
import { theme, cn } from "@/theme"

// Use theme classes
<div className={cn(theme.colors.background.gradient, theme.typography.fontSize.xl)}>
```

Key theme features:
- Color gradients (indigo-600 to purple-600)
- Typography scales (Playfair Display for headings, Inter for body)
- Consistent spacing, shadows, and effects
- Pre-built button styles (primary, secondary, outline)

### Supabase Integration

**Client-side:**
```typescript
import { createClient } from '@/utils/supabase/client'
const supabase = createClient()
```

**Server-side (App Router):**
```typescript
import { createClient } from '@/utils/supabase/server'
const supabase = await createClient()
```

**Server components** should use the server client and check authentication:
```typescript
const { data: { session } } = await supabase.auth.getSession()
if (!session) redirect('/sign-in')
```

### Important Patterns

**1. Survey ID Access Control:**
Dashboard and analytics pages must verify:
- Survey exists
- Survey belongs to current user's restaurant
- Redirect to `/my-surveys` if unauthorized

**2. Restaurant Code Generation:**
Use `generateUniqueRestaurantCode()` from `restaurant-utils.ts` to ensure unique 6-character codes.

**3. QR Code Generation:**
QR codes link to `/survey?code={restaurant_code}` and are generated using the `qrcode` library. Stored as data URLs in database.

**4. Response Data Structure:**
Survey responses store answers as JSONB:
```json
{
  "question_text": "left" | "right",
  "another_question": "left" | "right"
}
```

**5. Chart Colors:**
Dashboard uses consistent chart colors defined at top of `dashboard/page.tsx`. When adding charts, use these color constants.

### Path Aliases

All imports use `@/*` which maps to the root directory:
```typescript
import { createClient } from '@/utils/supabase/client'
import MainNavigationBar from '@/components/MainNavigationBar'
```

### Known Issues

- `utils/supabase/middelware.ts` has typo in filename (should be middleware)
- Dashboard estimates "Potential Requests" with a 25% formula - not based on real traffic data
- Survey questions are limited to 2 options (binary choice) and 3 questions max

### Development Notes

- Next.js 15 requires `searchParams` as a Promise in page components
- Always wrap `useSearchParams()` usage in `<Suspense>` boundary
- Server actions should be in separate files, not inline in components
- Chart.js requires client-side rendering - use dynamic imports or client components
