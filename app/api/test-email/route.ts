import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/notifications';
import { Order } from '@/types';

// Test endpoint to verify email configuration
export async function GET() {
  const diagnostics = {
    resendApiKey: !!process.env.RESEND_API_KEY,
    enableEmailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS,
    fromEmail: process.env.FROM_EMAIL,
    fromName: process.env.FROM_NAME,
    replyTo: process.env.REPLY_TO_EMAIL,
  };

  // Try to send a test email if all config is present
  if (process.env.RESEND_API_KEY && process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true' && process.env.FROM_EMAIL) {
    const testOrder: Order = {
      id: 'test-order-123',
      customerName: 'Test Customer',
      email: process.env.FROM_EMAIL, // Send to yourself for testing
      phone: '5551234567',
      zipCode: '12345',
      items: [
        {
          id: 'test-item',
          name: 'Test Item',
          description: 'This is a test',
          price: 10.00,
          category: 'test',
          quantity: 1,
        },
      ],
      total: 10.00,
      pickupTime: '12:00 PM',
      status: 'pending',
      notification_preference: 'email',
      createdAt: new Date().toISOString(),
    };

    try {
      const result = await sendOrderConfirmationEmail(testOrder);
      return NextResponse.json({
        diagnostics,
        testEmail: {
          attempted: true,
          result,
        },
      });
    } catch (error: any) {
      return NextResponse.json({
        diagnostics,
        testEmail: {
          attempted: true,
          error: error.message,
        },
      });
    }
  }

  return NextResponse.json({
    diagnostics,
    testEmail: {
      attempted: false,
      message: 'Email configuration incomplete - cannot send test email',
    },
  });
}

