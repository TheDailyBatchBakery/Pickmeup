import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { sendReminderEmail, sendReminderSMS } from '@/lib/notifications';
import { Order } from '@/types';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const supabase = createServerClient();

    // Fetch order
    const { data: orderData, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_name,
          product_price,
          quantity,
          subtotal
        )
      `)
      .eq('id', orderId)
      .single();

    if (error || !orderData) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Transform to Order format
    const order: Order = {
      id: orderData.id,
      customerName: orderData.customer_name,
      email: orderData.email,
      phone: orderData.phone,
      zipCode: orderData.zip_code,
      items: orderData.order_items.map((item: any) => ({
        id: item.product_id,
        name: item.product_name,
        description: '',
        price: parseFloat(item.product_price),
        category: '',
        quantity: item.quantity,
      })),
      total: parseFloat(orderData.total),
      pickupTime: orderData.pickup_time,
      status: orderData.status,
      notification_preference: orderData.notification_preference || 'email',
      createdAt: orderData.created_at,
    };

    // Send reminders based on preference
    const pref = order.notification_preference || 'email';
    
    if (pref === 'email' || pref === 'both') {
      if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
        await sendReminderEmail(order);
      }
    }
    
    if (pref === 'sms' || pref === 'both') {
      if (process.env.ENABLE_SMS_NOTIFICATIONS === 'true') {
        await sendReminderSMS(order);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending reminder:', error);
    return NextResponse.json(
      { error: 'Failed to send reminder' },
      { status: 500 }
    );
  }
}

