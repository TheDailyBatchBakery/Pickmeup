# Setup Guide for Pickmeup Template

This guide will help you set up the Pickmeup template for your business.

## Prerequisites

- A Supabase account (free tier works)
- A Resend account for email notifications (optional but recommended)
- A Twilio account for SMS notifications (optional)

## Step 1: Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and API keys

2. **Run the Database Schema**
   - In your Supabase dashboard, go to SQL Editor
   - Copy and paste the contents of `supabase/schema.sql`
   - Run the SQL script to create all necessary tables

3. **Set up Storage Bucket**
   - Go to Storage in your Supabase dashboard
   - Create a new bucket named `product-images`
   - Set it to Public (so images can be accessed)
   - Add the following policy:
   ```sql
   CREATE POLICY "Public Access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'product-images');
   
   CREATE POLICY "Authenticated users can upload"
   ON storage.objects FOR INSERT
   WITH CHECK (bucket_id = 'product-images');
   ```

## Step 2: Environment Variables

1. **Copy the example file**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your Supabase credentials**
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (keep this secret!)

3. **Configure Email (Resend)**
   - Sign up at [resend.com](https://resend.com)
   - Get your API key
   - Set `RESEND_API_KEY` in your `.env.local`
   - Configure your domain in Resend
   - Set `FROM_EMAIL` to an email from your verified domain
   - Set `ENABLE_EMAIL_NOTIFICATIONS=true`

4. **Configure SMS (Twilio) - Optional**
   - Sign up at [twilio.com](https://twilio.com)
   - Get your Account SID and Auth Token
   - Get a phone number
   - Set the Twilio variables in `.env.local`
   - Set `ENABLE_SMS_NOTIFICATIONS=true` if you want SMS

5. **Customize Business Information**
   - Update all `NEXT_PUBLIC_BUSINESS_*` variables
   - Adjust business hours if needed
   - Customize order cutoff time

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your site.

## Step 5: Add Initial Products

1. Go to `/admin/products`
2. Click "Add New Product"
3. Fill in product details and upload images
4. Repeat for all your menu items

## Step 6: Deploy to Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Add all environment variables in Netlify's dashboard (Settings > Environment Variables)
4. Deploy!

## Customization Tips

### Changing Colors
Edit `tailwind.config.js` to change the primary color scheme.

### Changing Business Hours
Update the environment variables:
- `NEXT_PUBLIC_BUSINESS_OPEN_HOUR`
- `NEXT_PUBLIC_BUSINESS_CLOSE_HOUR`
- `NEXT_PUBLIC_ORDER_CUTOFF_MINUTES`

### Disabling Features
- Set `ENABLE_EMAIL_NOTIFICATIONS=false` to disable emails
- Set `ENABLE_SMS_NOTIFICATIONS=false` to disable SMS
- Set `REQUIRE_ZIP_CODE=false` to make ZIP code optional

## Troubleshooting

### Images not uploading
- Make sure the `product-images` bucket exists in Supabase
- Check that the bucket is set to Public
- Verify your Supabase keys are correct

### Emails not sending
- Verify your Resend API key is correct
- Make sure your domain is verified in Resend
- Check that `FROM_EMAIL` uses your verified domain

### Orders not saving
- Check your Supabase connection
- Verify the database schema was run correctly
- Check browser console for errors

## Support

For template customization or support, refer to the main README.md file.

