# HFS - Hyper-personalized Feedback System

A modern, interactive survey platform designed for restaurants to collect customer feedback through QR codes. Built with Next.js and Supabase.

## Features

- **QR Code Survey Distribution** - Generate unique QR codes for each restaurant that customers can scan
- **Interactive Survey Experience** - Swipe-based mobile-first UI for binary choice questions
- **Real-time Analytics Dashboard** - View response trends, conversion rates, and question breakdowns with Chart.js visualizations
- **Survey Builder** - Create custom surveys or select from a question bank
- **Multi-restaurant Support** - Each restaurant gets a unique code and can manage multiple surveys
- **Authentication** - Secure user authentication via Supabase Auth

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database & Auth**: [Supabase](https://supabase.com/) (Cloud)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom theme system
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)
- **Charts**: [Chart.js](https://www.chartjs.org/) with react-chartjs-2
- **Forms**: react-hook-form with Zod validation
- **QR Codes**: qrcode library

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account (for cloud database)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd HFS
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your [Supabase Dashboard](https://app.supabase.com) → Project Settings → API

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

This project uses Supabase Cloud. You'll need to create the following tables in your Supabase project:

### Tables

- **restaurants** - Restaurant information with unique codes and QR URLs
- **survey** - Survey metadata (title, location, status, restaurant_id, user_id)
- **survey_questions** - Questions with options array
- **survey_responses** - Customer responses with question_answers JSONB field

See `CLAUDE.md` for detailed schema information.

## Project Structure

```
app/
├── page.tsx                 # Landing page
├── login/                   # Authentication
├── onboarding/              # Restaurant setup
├── dashboard/               # Analytics dashboard
├── survey-creation/         # Survey builder
├── my-surveys/              # Survey management
├── survey/                  # Public survey form (QR code destination)
└── qr/                      # QR code display

components/
├── ui/                      # shadcn/ui components
├── MainNavigationBar.tsx    # Main navigation
└── PrintQRCode.tsx          # QR code generation

utils/
├── supabase/                # Supabase client utilities
├── restaurant-utils.ts      # Restaurant & QR code utilities
└── user-utils.ts            # User data utilities

theme.ts                     # Centralized design system
```

## Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## Key Workflows

### Restaurant Onboarding
1. User signs up/logs in
2. Creates restaurant profile
3. Generates unique 6-character restaurant code
4. QR code automatically generated linking to survey form

### Survey Creation
1. Navigate to `/survey-creation`
2. Name your survey and location
3. Select questions from bank or create custom ones
4. Save and activate survey
5. Print/display QR code for customers

### Customer Response
1. Customer scans QR code
2. Redirected to `/survey?code={restaurant_code}`
3. Swipe-based interface for answering questions
4. Responses saved to database

### Analytics
1. View dashboard at `/dashboard?id={survey_id}`
2. See response trends, conversion rates
3. Analyze question-by-question breakdowns
4. Export data (coming soon)

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Make sure to add your environment variables in the Vercel project settings.

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

Private project - All rights reserved.
