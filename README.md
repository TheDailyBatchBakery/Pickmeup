# Pickmeup - Pickup-Only Order System

A modern Next.js 14 application for managing pickup-only food orders.

## Features

- 🍔 Browse menu with category filtering
- 🛒 Shopping cart with persistent state (Zustand)
- ⏰ Pickup time selector with order cutoff logic (configurable)
- 📍 ZIP code validation
- 💳 Checkout with customer information
- 📧 Order confirmation page with email notifications (Resend)
- 📱 SMS notifications (optional, Twilio)
- 🔔 Status change notifications (ready, completed, cancelled)
- ⏰ Reminder notifications before pickup time
- ⚙️ Admin-configurable notification settings
- 👨‍💼 Admin dashboard for order management
- 🛍️ Admin product management (add, edit, delete products)
- 🖼️ Image upload for products (Supabase Storage)
- 🎨 Clean, minimal design with Tailwind CSS
- ⚙️ Fully configurable via environment variables

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Zustand** (State management)
- **Supabase** (Database & Storage)
- **Resend** (Email notifications)
- **Twilio** (SMS notifications - optional)
- **date-fns** (Date/time utilities)

## Getting Started

See [SETUP.md](./SETUP.md) for detailed setup instructions.

Quick start:

1. **Set up Supabase**
   - Create a Supabase project
   - Run the SQL schema from `supabase/schema.sql`
   - Create a storage bucket named `product-images`

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase credentials
   - Add Resend API key for email notifications
   - Customize business information

3. **Install dependencies:**
```bash
npm install
```

4. **Run the development server:**
```bash
npm run dev
```

5. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

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

## Configuration

This template is fully configurable via environment variables. See `.env.example` for all available options:

- Business information (name, email, phone, address)
- Business hours and order cutoff times
- Email/SMS notification settings
- Feature toggles

## Admin Features

- **Product Management**: Add, edit, delete products with images
- **Order Management**: View and update order statuses
- **Real-time Updates**: Orders refresh automatically

## Template Customization

This template is designed to be easily customizable for different businesses:

1. Update environment variables for business-specific settings
2. Modify `tailwind.config.js` for branding colors
3. Customize email templates in `lib/notifications.ts`
4. Adjust business hours and time slots via environment variables

## Support & Documentation

- See [SETUP.md](./SETUP.md) for detailed setup instructions
- Check `.env.example` for all configuration options

