# Email Notification Troubleshooting Guide

## Quick Checklist

1. **Environment Variables in Netlify**
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Verify these are set:
     - `RESEND_API_KEY` - Your Resend API key
     - `ENABLE_EMAIL_NOTIFICATIONS=true` - Must be exactly "true" (not "True" or "1")
     - `FROM_EMAIL` - Your verified email domain (e.g., `noreply@yourdomain.com`)
     - `FROM_NAME` - Your business name
     - `REPLY_TO_EMAIL` - Where replies should go

2. **Resend Configuration**
   - Sign up at [resend.com](https://resend.com) if you haven't
   - Get your API key from Resend dashboard
   - Verify your domain in Resend (required for sending emails)
   - Make sure `FROM_EMAIL` uses your verified domain

3. **Check Logs**
   - In Netlify, go to Functions → Logs
   - Look for these messages:
     - "RESEND_API_KEY not set" - API key missing
     - "Email notifications disabled" - ENABLE_EMAIL_NOTIFICATIONS not set to "true"
     - "Resend API error" - Check the error details
     - "Order confirmation email sent successfully" - Success!

## Common Issues

### Issue: "RESEND_API_KEY not set"
**Solution:** Add `RESEND_API_KEY` to your Netlify environment variables

### Issue: "Email notifications disabled"
**Solution:** Set `ENABLE_EMAIL_NOTIFICATIONS=true` in Netlify (must be lowercase "true")

### Issue: "The gmail.com domain is not verified" or similar
**Solution:** 
- **You cannot use Gmail, Yahoo, or other public email addresses as FROM_EMAIL**
- Resend only allows sending from:
  1. **Your own verified domain** (e.g., `noreply@yourdomain.com`)
  2. **Resend's test domain** (e.g., `onboarding@resend.dev` - for testing only)
- To fix:
  - Option A: Use your verified domain: Set `FROM_EMAIL=noreply@yourdomain.com` (your verified domain)
  - Option B: Use Resend test domain: Set `FROM_EMAIL=onboarding@resend.dev` (check Resend dashboard for exact test email)

### Issue: "Resend API error" with domain verification error
**Solution:** 
- Verify your domain in Resend dashboard
- Make sure `FROM_EMAIL` uses your verified domain
- Wait a few minutes after domain verification

### Issue: Emails not sending but no errors
**Solution:**
- Check Resend dashboard for delivery status
- Verify the recipient email address is valid
- Check spam folder
- Make sure Resend account is not in test mode (if applicable)

## Testing

After placing an order, check:
1. Netlify function logs for email sending attempts
2. Resend dashboard for email delivery status
3. Customer's inbox (and spam folder)

## Debug Mode

The code now logs:
- When email sending is attempted
- The recipient email address
- The "from" email address
- Success or error messages
- Detailed error information if sending fails

Check your Netlify function logs to see what's happening.

