import { Resend } from 'resend';
import { Order } from '@/types';
import { config } from './config';
import { formatCurrency } from './utils';

// Initialize Resend only if API key is available (prevents build errors)
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendOrderConfirmationEmail(order: Order) {
  if (!resend || !process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email notification');
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${config.notifications.fromName} <${config.notifications.fromEmail}>`,
      to: order.email,
      reply_to: config.notifications.replyTo,
      subject: `Order Confirmation - ${order.id.slice(0, 8)}`,
      html: generateOrderEmailHTML(order),
    });

    if (error) {
      console.error('Error sending email:', error);
      return;
    }

    console.log('Order confirmation email sent:', data);
  } catch (error) {
    console.error('Failed to send email:', error);
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

    const message = await client.messages.create({
      body: `Your order ${order.id.slice(0, 8)} from ${config.business.name} is confirmed! Pickup at ${order.pickupTime}. Total: ${formatCurrency(order.total)}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: order.phone,
    });

    console.log('SMS sent successfully:', message.sid);
  } catch (error) {
    console.error('Failed to send SMS:', error);
  }
}

