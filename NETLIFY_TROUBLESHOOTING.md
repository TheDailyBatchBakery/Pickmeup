# Netlify Build Troubleshooting Guide

## How to Get Full Error Logs from Netlify

### Step 1: Access Your Build Logs
1. Go to your Netlify dashboard
2. Click on your site
3. Click on **"Deploys"** tab (top menu)
4. Find the failed deploy (it will have a red X or error icon)
5. Click on the deploy to see details

### Step 2: View the Full Log
1. In the deploy details, click **"View build log"** or **"Full log"**
2. Scroll down to find the actual error (usually near the bottom)
3. Look for lines that say:
   - `Error:`
   - `Failed to`
   - `Cannot find`
   - `Module not found`
   - Red text with error messages

### Step 3: Common Error Patterns to Look For

**Missing Environment Variables:**
```
Error: Missing Supabase environment variables
```
**Solution:** Make sure all Supabase env vars are set in Netlify

**Module Not Found:**
```
Module not found: Can't resolve '@supabase/supabase-js'
```
**Solution:** Dependencies might not be installed

**TypeScript Errors:**
```
Type error: ...
```
**Solution:** There's a code issue that needs fixing

**Build Timeout:**
```
Build exceeded maximum time
```
**Solution:** Build is taking too long, might need optimization

## Fixes Applied

I've fixed several potential build issues:

1. **Supabase Client Initialization** - Now handles missing env vars gracefully during build
2. **Resend Email Client** - Won't break if API key is missing
3. **Twilio SMS** - Uses dynamic import to prevent build errors
4. **Type Safety** - Better error handling throughout

## Common Issues & Solutions

### Issue: "Missing Supabase environment variables"
**Solution:**
1. Go to Netlify → Site Settings → Environment Variables
2. Make sure these are set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Issue: "Module not found"
**Solution:**
1. Make sure `package.json` has all dependencies
2. Netlify should auto-install, but you can trigger a rebuild

### Issue: Build succeeds but site doesn't work
**Solution:**
1. Check that all environment variables are set in Netlify
2. Make sure variable names match exactly (case-sensitive)
3. Redeploy after adding variables

## Next Steps

1. **Get the actual error message** from Netlify logs
2. **Share it with me** and I can help fix it specifically
3. **Check environment variables** are all set in Netlify

## Quick Checklist Before Deploying

- [ ] All Supabase env vars set in Netlify
- [ ] Resend API key set (if using emails)
- [ ] Business info configured (or using placeholders)
- [ ] Code committed and pushed to GitHub
- [ ] Netlify connected to GitHub repo

