# Environment Variables Setup Guide

## Why Two Places?

1. **Netlify** = Your live website (what customers see)
2. **Local `.env.local` file** = Your computer (for testing before deploying)

You need the same information in both places!

## Step-by-Step: Create Your Local .env.local File

### Step 1: Find the env.example file
- In your project folder (Pickmeup), look for a file named `env.example`
- This is a template file

### Step 2: Copy it to create .env.local
- Copy the `env.example` file
- Rename the copy to `.env.local` (with the dot at the beginning)
- Make sure it's in the same folder (Pickmeup)

### Step 3: Open .env.local in a text editor
- Right-click on `.env.local`
- Choose "Open with" → Notepad, VS Code, or any text editor

### Step 4: Fill in your Supabase information

You already have these from Netlify! Just copy them:

1. **NEXT_PUBLIC_SUPABASE_URL**
   - This is your Supabase project URL
   - Example: `https://abcdefghijklmnop.supabase.co`
   - Replace: `your_supabase_project_url` with your actual URL

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - This is your Supabase anon/public key
   - It's a long string of letters and numbers
   - Replace: `your_supabase_anon_key` with your actual key

3. **SUPABASE_SERVICE_ROLE_KEY**
   - This is your Supabase service role key (the secret one!)
   - Also a long string
   - Replace: `your_supabase_service_role_key` with your actual key

**Example of what it should look like:**
```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI4MCwiZXhwIjoxOTU0NTQzMjgwfQ.example
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjM4OTY3MjgwLCJleHhwIjoxOTU0NTQzMjgwfQ.example
```

### Step 5: Set up Email (Resend) - Optional but Recommended

1. Go to [resend.com](https://resend.com) and sign up (free account works)
2. Once logged in, go to "API Keys"
3. Click "Create API Key"
4. Give it a name (like "Pickmeup")
5. Copy the API key it gives you
6. In your `.env.local` file, replace `your_resend_api_key` with your actual key

**Also update these:**
- `FROM_EMAIL`: Use an email from a domain you own, or use Resend's test domain
- `FROM_NAME`: Your business name
- `REPLY_TO_EMAIL`: Where customers can reply to

**Example:**
```
RESEND_API_KEY=re_1234567890abcdefghijklmnop
ENABLE_EMAIL_NOTIFICATIONS=true
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Pickmeup Restaurant
REPLY_TO_EMAIL=support@yourdomain.com
```

### Step 6: Customize Business Information

Update these with your actual business details:

```
NEXT_PUBLIC_BUSINESS_NAME=Your Restaurant Name
NEXT_PUBLIC_BUSINESS_EMAIL=orders@yourdomain.com
NEXT_PUBLIC_BUSINESS_PHONE=(555) 123-4567
NEXT_PUBLIC_BUSINESS_ADDRESS=123 Main St, City, State 12345
```

### Step 7: Save the file

- Save `.env.local`
- Make sure it's saved in the Pickmeup folder (same folder as package.json)

## Important Notes:

1. **Never commit .env.local to GitHub!** It's already in .gitignore, so you're safe.

2. **The file should look like this when done:**
   - Each variable on its own line
   - No spaces around the `=` sign
   - No quotes around the values (unless the value itself has spaces)

3. **If you get errors:**
   - Make sure there are no extra spaces
   - Make sure each line has a variable name, equals sign, and value
   - Don't delete the comments (lines starting with #)

## Quick Checklist:

- [ ] Copied `env.example` to `.env.local`
- [ ] Added Supabase URL
- [ ] Added Supabase anon key
- [ ] Added Supabase service role key
- [ ] (Optional) Added Resend API key
- [ ] Updated business information
- [ ] Saved the file

## Testing:

After setting up, run:
```bash
npm run dev
```

Then visit `http://localhost:3000/admin/products` to test if everything works!

