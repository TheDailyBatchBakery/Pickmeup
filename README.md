# Pickmeup - Pickup-Only Order System

A modern Next.js 14 application for managing pickup-only food orders.

## Features

- 🍔 Browse menu with category filtering
- 🛒 Shopping cart with persistent state (Zustand)
- ⏰ Pickup time selector with order cutoff logic (30 minutes advance notice)
- 📍 ZIP code validation
- 💳 Checkout with customer information
- 📧 Order confirmation page
- 👨‍💼 Admin dashboard for order management
- 🎨 Clean, minimal design with Tailwind CSS

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Zustand** (State management)
- **date-fns** (Date/time utilities)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
Pickmeup/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── checkout/          # Checkout page
│   ├── confirmation/      # Order confirmation
│   ├── menu/              # Menu page
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── admin/            # Admin components
│   ├── customer/         # Customer-facing components
│   └── ui/               # Reusable UI components
├── lib/                   # Utilities and store
└── types/                 # TypeScript type definitions
```

## Deployment to Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Netlify will automatically detect Next.js and use the `netlify.toml` configuration
4. Deploy!

The `netlify.toml` file is already configured for Next.js deployment.

## Business Hours & Order Cutoff

- **Business Hours**: 10 AM - 8 PM
- **Order Cutoff**: 30 minutes before pickup time
- **Time Slots**: Available in 15-minute intervals

## Notes

- Orders are stored in-memory (for demo purposes). In production, connect to a database.
- Menu items are hardcoded in the API route. Replace with a database in production.

