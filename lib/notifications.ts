import { Resend } from 'resend';
import { Order } from '@/types';
import { config } from './config';
import { formatCurrency } from './utils';

// Initialize Resend only if API key is available (prevents build errors)
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendOrderConfirmationEmail(order: Order) {
  console.log('sendOrderConfirmationEmail called for order:', order.id);
  console.log('Resend client exists:', !!resend);
  console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
  
  if (!resend || !process.env.RESEND_API_KEY) {
    console.warn('❌ RESEND_API_KEY not set, skipping email notification');
    console.warn('To enable emails, set RESEND_API_KEY and ENABLE_EMAIL_NOTIFICATIONS=true in your environment variables');
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  try {
    // Validate and format the 'from' field properly
    const fromField = formatFromEmail(config.notifications.fromEmail, config.notifications.fromName);
    const fromEmail = config.notifications.fromEmail || process.env.FROM_EMAIL;

    const emailData = {
      from: fromField,
      to: order.email,
      reply_to: config.notifications.replyTo || process.env.REPLY_TO_EMAIL || fromEmail,
      subject: `Order Confirmation - ${order.id.slice(0, 8)}`,
      html: generateOrderEmailHTML(order),
    };

    console.log('Attempting to send email to:', order.email);
    console.log('From field:', emailData.from);
    console.log('From email:', fromEmail);
    console.log('From name:', config.notifications.fromName || process.env.FROM_NAME);

    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error('Resend API error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return { success: false, error: error.message || 'Unknown Resend error' };
    }

    console.log('Order confirmation email sent successfully:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('Failed to send email:', error);
    console.error('Error stack:', error?.stack);
    return { success: false, error: error?.message || 'Unknown error' };
  }
}

function generateOrderEmailHTML(order: Order): string {
  const itemsList = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">
        ${item.quantity}x ${item.name}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
        ${formatCurrency(item.price * item.quantity)}
      </td>
    </tr>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0ea5e9; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Order Confirmed!</h1>
        </div>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px;">
          <p>Thank you for your order, ${order.customerName}!</p>
          <p>We've received your order and will have it ready for pickup at <strong>${order.pickupTime}</strong>.</p>
          
          <div style="background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h2 style="margin-top: 0; color: #0ea5e9;">Order Details</h2>
            <p><strong>Order Number:</strong> ${order.id}</p>
            <p><strong>Pickup Time:</strong> ${order.pickupTime}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            
            <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                  <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
              <tfoot>
                <tr>
                  <td style="padding: 8px; font-weight: bold; border-top: 2px solid #ddd;">Total:</td>
                  <td style="padding: 8px; font-weight: bold; text-align: right; border-top: 2px solid #ddd;">
                    ${formatCurrency(order.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <p>We'll send you another notification when your order is ready for pickup.</p>
          <p>If you have any questions, please contact us at ${config.business.phone} or ${config.business.email}.</p>
          
          <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
            ${config.business.name}<br>
            ${config.business.address}
          </p>
        </div>
      </body>
    </html>
  `;
}

// Helper function to format items list for SMS
function formatItemsForSMS(items: Order['items']): string {
  if (items.length === 0) return '';
  
  const itemsText = items
    .map((item) => `${item.quantity}x ${item.name}`)
    .join(', ');
  
  // SMS has 160 character limit, so truncate if needed
  if (itemsText.length > 100) {
    return items.slice(0, 2).map((item) => `${item.quantity}x ${item.name}`).join(', ') + ` +${items.length - 2} more`;
  }
  return itemsText;
}

// SMS notification function (using Twilio)
export async function sendOrderConfirmationSMS(order: Order) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.warn('Twilio credentials not set, skipping SMS notification');
    return;
  }

  try {
    // Dynamic import to avoid build-time errors if Twilio isn't configured
    const twilio = await import('twilio');
    const client = twilio.default(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const itemsText = formatItemsForSMS(order.items);
    const pickupLocation = config.business.address;
    
    const messageBody = `Order ${order.id.slice(0, 8)} confirmed!\n\nItems: ${itemsText}\nPickup: ${order.pickupTime}\nLocation: ${pickupLocation}\nTotal: ${formatCurrency(order.total)}\n\n${config.business.name}`;

    const message = await client.messages.create({
      body: messageBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: order.phone,
    });

    console.log('SMS sent successfully:', message.sid);
  } catch (error) {
    console.error('Failed to send SMS:', error);
  }
}

// Helper function to format the 'from' field properly
function formatFromEmail(fromEmail?: string, fromName?: string): string {
  // Try to get email from various sources
  const email = fromEmail || process.env.FROM_EMAIL;
  const name = fromName || process.env.FROM_NAME;
  
  // Validate email
  if (!email || typeof email !== 'string' || !email.trim()) {
    console.error('❌ FROM_EMAIL is missing or empty');
    console.error('FROM_EMAIL from config:', fromEmail);
    console.error('FROM_EMAIL from env:', process.env.FROM_EMAIL);
    throw new Error('FROM_EMAIL environment variable is required and must be a valid email address. Please set FROM_EMAIL in Netlify environment variables.');
  }
  
  const trimmedEmail = email.trim();
  
  // Basic email validation
  if (!trimmedEmail.includes('@') || trimmedEmail.length < 5) {
    console.error('❌ FROM_EMAIL is invalid:', trimmedEmail);
    throw new Error(`Invalid FROM_EMAIL format: "${trimmedEmail}". Must be a valid email address like "noreply@yourdomain.com"`);
  }
  
  // Format: "Name <email@domain.com>" or just "email@domain.com"
  if (name && name.trim()) {
    return `${name.trim()} <${trimmedEmail}>`;
  }
  
  return trimmedEmail;
}

// Status change notification (email)
export async function sendStatusChangeEmail(order: Order, oldStatus: string, newStatus: string) {
  if (!resend || !process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping status change email');
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  const statusMessages: Record<string, { subject: string; message: string }> = {
    ready: {
      subject: `Your Order is Ready for Pickup - ${order.id.slice(0, 8)}`,
      message: `Great news! Your order is ready for pickup at ${order.pickupTime}. Please come by ${config.business.address} to collect your order.`,
    },
    completed: {
      subject: `Order Completed - ${order.id.slice(0, 8)}`,
      message: `Thank you for your order! We hope you enjoyed your meal. We'd love to see you again soon!`,
    },
    cancelled: {
      subject: `Order Cancelled - ${order.id.slice(0, 8)}`,
      message: `Your order has been cancelled. If you have any questions, please contact us at ${config.business.phone} or ${config.business.email}.`,
    },
  };

  const statusInfo = statusMessages[newStatus];
  if (!statusInfo) return { success: false, error: 'Invalid status' };

  try {
    const fromField = formatFromEmail(config.notifications.fromEmail, config.notifications.fromName);
    const { data, error } = await resend.emails.send({
      from: fromField,
      to: order.email,
      reply_to: config.notifications.replyTo || process.env.REPLY_TO_EMAIL || fromField,
      subject: statusInfo.subject,
      html: generateStatusChangeEmailHTML(order, newStatus, statusInfo.message),
    });

    if (error) {
      console.error('Error sending status change email:', error);
      return { success: false, error: error.message || 'Unknown Resend error' };
    }

    console.log('Status change email sent:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('Failed to send status change email:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
}

// Status change notification (SMS)
export async function sendStatusChangeSMS(order: Order, newStatus: string) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.warn('Twilio credentials not set, skipping status change SMS');
    return;
  }

  const statusMessages: Record<string, string> = {
    ready: `Your order ${order.id.slice(0, 8)} is ready! Pickup at ${order.pickupTime}. ${config.business.address}`,
    completed: `Thank you for your order ${order.id.slice(0, 8)}! We hope you enjoyed it.`,
    cancelled: `Order ${order.id.slice(0, 8)} has been cancelled. Contact us: ${config.business.phone}`,
  };

  const messageText = statusMessages[newStatus];
  if (!messageText) return;

  try {
    const twilio = await import('twilio');
    const client = twilio.default(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const message = await client.messages.create({
      body: messageText,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: order.phone,
    });

    console.log('Status change SMS sent:', message.sid);
  } catch (error) {
    console.error('Failed to send status change SMS:', error);
  }
}

// Admin notification (email)
export async function sendAdminOrderEmail(order: Order, adminEmails: string[]) {
  if (!resend || !process.env.RESEND_API_KEY || adminEmails.length === 0) {
    if (!resend || !process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not set, skipping admin email notification');
    }
    return { success: false, error: 'RESEND_API_KEY not configured or no admin emails' };
  }

  try {
    const fromField = formatFromEmail(config.notifications.fromEmail, config.notifications.fromName);
    const { data, error } = await resend.emails.send({
      from: fromField,
      to: adminEmails,
      reply_to: order.email,
      subject: `New Order Received - ${order.id.slice(0, 8)}`,
      html: generateAdminOrderEmailHTML(order),
    });

    if (error) {
      console.error('Error sending admin email:', error);
      return { success: false, error: error.message || 'Unknown Resend error' };
    }

    console.log('Admin email sent:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('Failed to send admin email:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
}

// Admin notification (SMS)
export async function sendAdminOrderSMS(order: Order, adminPhones: string[]) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER || adminPhones.length === 0) {
    return;
  }

  const itemsText = formatItemsForSMS(order.items);
  const messageBody = `New Order ${order.id.slice(0, 8)}\n${order.customerName}\n${itemsText}\nPickup: ${order.pickupTime}\nTotal: ${formatCurrency(order.total)}`;

  try {
    const twilio = await import('twilio');
    const client = twilio.default(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Send to all admin phones
    const promises = adminPhones.map((phone) =>
      client.messages.create({
        body: messageBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      })
    );

    const results = await Promise.all(promises);
    console.log('Admin SMS sent to', results.length, 'recipients');
  } catch (error) {
    console.error('Failed to send admin SMS:', error);
  }
}

// Reminder notification (email)
export async function sendReminderEmail(order: Order) {
  if (!resend || !process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping reminder email');
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  try {
    const fromField = formatFromEmail(config.notifications.fromEmail, config.notifications.fromName);
    const { data, error } = await resend.emails.send({
      from: fromField,
      to: order.email,
      reply_to: config.notifications.replyTo || process.env.REPLY_TO_EMAIL || fromField,
      subject: `Reminder: Order Ready Soon - ${order.id.slice(0, 8)}`,
      html: generateReminderEmailHTML(order),
    });

    if (error) {
      console.error('Error sending reminder email:', error);
      return { success: false, error: error.message || 'Unknown Resend error' };
    }

    console.log('Reminder email sent:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('Failed to send reminder email:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
}

// Reminder notification (SMS)
export async function sendReminderSMS(order: Order) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    return;
  }

  try {
    const twilio = await import('twilio');
    const client = twilio.default(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const message = await client.messages.create({
      body: `Reminder: Your order ${order.id.slice(0, 8)} pickup is at ${order.pickupTime}. ${config.business.address}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: order.phone,
    });

    console.log('Reminder SMS sent:', message.sid);
  } catch (error) {
    console.error('Failed to send reminder SMS:', error);
  }
}

// Helper functions for email HTML generation
function generateStatusChangeEmailHTML(order: Order, status: string, message: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0ea5e9; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Order Update</h1>
        </div>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px;">
          <p>Hello ${order.customerName},</p>
          <p>${message}</p>
          <div style="background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <p><strong>Order Number:</strong> ${order.id}</p>
            <p><strong>Status:</strong> ${status}</p>
            <p><strong>Pickup Time:</strong> ${order.pickupTime}</p>
            <p><strong>Total:</strong> ${formatCurrency(order.total)}</p>
          </div>
          <p>If you have any questions, please contact us at ${config.business.phone} or ${config.business.email}.</p>
        </div>
      </body>
    </html>
  `;
}

function generateAdminOrderEmailHTML(order: Order): string {
  const itemsList = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">
        ${item.quantity}x ${item.name}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
        ${formatCurrency(item.price * item.quantity)}
      </td>
    </tr>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">New Order Received!</h1>
        </div>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px;">
          <div style="background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h2 style="margin-top: 0; color: #dc2626;">Order Details</h2>
            <p><strong>Order Number:</strong> ${order.id}</p>
            <p><strong>Customer:</strong> ${order.customerName}</p>
            <p><strong>Email:</strong> ${order.email}</p>
            <p><strong>Phone:</strong> ${order.phone}</p>
            <p><strong>ZIP Code:</strong> ${order.zipCode}</p>
            <p><strong>Pickup Time:</strong> ${order.pickupTime}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            
            <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                  <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
              <tfoot>
                <tr>
                  <td style="padding: 8px; font-weight: bold; border-top: 2px solid #ddd;">Total:</td>
                  <td style="padding: 8px; font-weight: bold; text-align: right; border-top: 2px solid #ddd;">
                    ${formatCurrency(order.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateReminderEmailHTML(order: Order): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0ea5e9; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Pickup Reminder</h1>
        </div>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px;">
          <p>Hello ${order.customerName},</p>
          <p>This is a reminder that your order will be ready for pickup at <strong>${order.pickupTime}</strong>.</p>
          <div style="background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <p><strong>Order Number:</strong> ${order.id}</p>
            <p><strong>Pickup Location:</strong> ${config.business.address}</p>
            <p><strong>Total:</strong> ${formatCurrency(order.total)}</p>
          </div>
          <p>We look forward to seeing you soon!</p>
          <p>If you have any questions, please contact us at ${config.business.phone}.</p>
        </div>
      </body>
    </html>
  `;
}

