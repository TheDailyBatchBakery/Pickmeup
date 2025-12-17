import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import {
  sendOrderConfirmationEmail,
  sendOrderConfirmationSMS,
  sendStatusChangeEmail,
  sendStatusChangeSMS,
  sendAdminOrderEmail,
  sendAdminOrderSMS,
  sendReminderEmail,
  sendReminderSMS,
} from '@/lib/notifications';
import { Order, Settings } from '@/types';

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export async function GET() {
  try {
    const supabase = createServerClient();
    
    const { data: orders, error } = await supabase
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
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      // Return empty array instead of error object
      return NextResponse.json([]);
    }

    // Handle case where orders might be null
    if (!orders || !Array.isArray(orders)) {
      console.warn('Orders data is not an array:', orders);
      return NextResponse.json([]);
    }

    // Transform to Order format
    const transformedOrders: Order[] = orders.map((order: any) => ({
      id: order.id,
      customerName: order.customer_name,
      email: order.email,
      phone: order.phone,
      zipCode: order.zip_code,
      items: order.order_items.map((item: any) => ({
        id: item.product_id,
        name: item.product_name,
        description: '',
        price: parseFloat(item.product_price),
        category: '',
        quantity: item.quantity,
      })),
      total: parseFloat(order.total),
      pickupTime: order.pickup_time,
      status: order.status,
      notification_preference: order.notification_preference || 'email',
      createdAt: order.created_at,
    }));

    // Check for reminder notifications if enabled (simple method)
    if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true' || process.env.ENABLE_SMS_NOTIFICATIONS === 'true') {
      const settings = await getSettings(createServerClient());
      if (settings?.notifications?.reminderEnabled && settings.notifications.reminderMethod === 'simple') {
        checkAndSendReminders(transformedOrders, settings.notifications.reminderMinutes).catch(console.error);
      }
    }

    return NextResponse.json(transformedOrders);
  } catch (error) {
    console.error('Unexpected error:', error);
    // Return empty array instead of error object
    return NextResponse.json([]);
  }
}

// Helper function to get settings
async function getSettings(supabase: ReturnType<typeof createServerClient>): Promise<Settings | null> {
  try {
    const { data: notificationsData, error: notificationsError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'notifications')
      .single();

    const { data: emailSmsData, error: emailSmsError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'email_sms')
      .single();

    // If table doesn't exist or settings not found, return null (will use defaults)
    if (notificationsError || emailSmsError || !notificationsData || !emailSmsData) {
      return null;
    }

    return {
      notifications: notificationsData.value as any,
      email_sms: emailSmsData.value as any,
    };
  } catch (error: any) {
    // Handle case where settings table doesn't exist
    if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
      console.warn('Settings table does not exist yet');
      return null;
    }
    console.error('Error fetching settings:', error);
    return null;
  }
}

// Helper function to check and send reminders
async function checkAndSendReminders(orders: Order[], reminderMinutes: number) {
  const now = new Date();

  for (const order of orders) {
    if (order.status !== 'pending' && order.status !== 'confirmed') continue;

    try {
      // Parse pickup time (format: "h:mm a")
      const [timePart, period] = order.pickupTime.split(' ');
      const [hours, minutes] = timePart.split(':').map(Number);
      let pickupHour = hours;
      if (period === 'PM' && hours !== 12) pickupHour += 12;
      if (period === 'AM' && hours === 12) pickupHour = 0;

      const pickupDate = new Date();
      pickupDate.setHours(pickupHour, minutes, 0, 0);

      // Check if pickup time is within reminder window
      const timeDiff = pickupDate.getTime() - now.getTime();
      const minutesUntilPickup = timeDiff / 60000;

      if (minutesUntilPickup > 0 && minutesUntilPickup <= reminderMinutes + 5) {
        // Check if we haven't sent reminder yet (in a real app, track this in DB)
        const pref = order.notification_preference || 'email';
        
        if (pref === 'email' || pref === 'both') {
          if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
            sendReminderEmail(order).catch(console.error);
          }
        }
        
        if (pref === 'sms' || pref === 'both') {
          if (process.env.ENABLE_SMS_NOTIFICATIONS === 'true') {
            sendReminderSMS(order).catch(console.error);
          }
        }
      }
    } catch (error) {
      console.error('Error checking reminder for order', order.id, error);
    }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerInfo, items, pickupTime, notificationPreference } = body;

    // Validate required fields
    if (!customerInfo || !items || !pickupTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const settings = await getSettings(supabase);

    // Calculate total
    const total = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    const orderNumber = generateOrderNumber();

    // Create order - try with notification_preference first, fallback without it if column doesn't exist
    let orderInsert: any = {
      order_number: orderNumber,
      customer_name: customerInfo.name,
      email: customerInfo.email,
      phone: customerInfo.phone,
      zip_code: customerInfo.zipCode,
      total: total.toFixed(2),
      pickup_time: pickupTime,
      status: 'pending',
    };

    // Try to add notification_preference if provided
    if (notificationPreference) {
      orderInsert.notification_preference = notificationPreference;
    }

    let { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderInsert)
      .select()
      .single();

    // If error is due to missing column, retry without notification_preference
    if (orderError && (orderError.code === '42703' || orderError.message?.includes('column') || orderError.message?.includes('does not exist'))) {
      console.warn('notification_preference column does not exist, creating order without it');
      const { notification_preference, ...orderWithoutPref } = orderInsert;
      const retryResult = await supabase
        .from('orders')
        .insert(orderWithoutPref)
        .select()
        .single();
      order = retryResult.data;
      orderError = retryResult.error;
    }

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order', details: orderError.message },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      product_price: item.price.toFixed(2),
      quantity: item.quantity,
      subtotal: (item.price * item.quantity).toFixed(2),
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Try to delete the order if items failed
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json(
        { error: 'Failed to create order items' },
        { status: 500 }
      );
    }

    // Fetch complete order with items
    const { data: completeOrder, error: fetchError } = await supabase
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
      .eq('id', order.id)
      .single();

    if (fetchError) {
      console.error('Error fetching complete order:', fetchError);
    }

    // Transform to Order format
    const transformedOrder: Order = {
      id: order.id,
      customerName: order.customer_name,
      email: order.email,
      phone: order.phone,
      zipCode: order.zip_code,
      items: completeOrder?.order_items.map((item: any) => ({
        id: item.product_id,
        name: item.product_name,
        description: '',
        price: parseFloat(item.product_price),
        category: '',
        quantity: item.quantity,
      })) || items,
      total: parseFloat(order.total),
      pickupTime: order.pickup_time,
      status: order.status,
      notification_preference: order.notification_preference || 'email',
      createdAt: order.created_at,
    };

    // Send customer notifications based on preference (async, don't wait for them)
    const pref = transformedOrder.notification_preference || 'email';
    if (pref === 'email' || pref === 'both') {
      if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
        sendOrderConfirmationEmail(transformedOrder)
          .then((result) => {
            if (result && !result.success) {
              console.error('Email notification failed:', result.error);
            }
          })
          .catch((error) => {
            console.error('Email notification error:', error);
          });
      } else {
        console.warn('Email notifications disabled. Set ENABLE_EMAIL_NOTIFICATIONS=true to enable.');
      }
    }
    
    if (pref === 'sms' || pref === 'both') {
      if (process.env.ENABLE_SMS_NOTIFICATIONS === 'true') {
        sendOrderConfirmationSMS(transformedOrder).catch(console.error);
      }
    }

    // Send admin notifications (async, don't wait for them)
    if (settings?.email_sms) {
      const adminEmails = settings.email_sms.adminEmails || [];
      const adminPhones = settings.email_sms.adminPhones || [];
      
      if (adminEmails.length > 0 && process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
        sendAdminOrderEmail(transformedOrder, adminEmails)
          .then((result) => {
            if (result && !result.success) {
              console.error('Admin email notification failed:', result.error);
            }
          })
          .catch((error) => {
            console.error('Admin email notification error:', error);
          });
      }
      
      if (adminPhones.length > 0 && process.env.ENABLE_SMS_NOTIFICATIONS === 'true') {
        sendAdminOrderSMS(transformedOrder, adminPhones).catch(console.error);
      }
    }

    return NextResponse.json(transformedOrder, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Missing orderId or status' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const settings = await getSettings(supabase);

    // Get current order to check status change
    const { data: currentOrder } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single();

    const oldStatus = currentOrder?.status;

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
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
      .single();

    if (error) {
      console.error('Error updating order:', error);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Transform to Order format
    const transformedOrder: Order = {
      id: data.id,
      customerName: data.customer_name,
      email: data.email,
      phone: data.phone,
      zipCode: data.zip_code,
      items: data.order_items.map((item: any) => ({
        id: item.product_id,
        name: item.product_name,
        description: '',
        price: parseFloat(item.product_price),
        category: '',
        quantity: item.quantity,
      })),
      total: parseFloat(data.total),
      pickupTime: data.pickup_time,
      status: data.status,
      notification_preference: data.notification_preference || 'email',
      createdAt: data.created_at,
    };

    // Send status change notifications if status changed and enabled
    if (oldStatus && oldStatus !== status && settings?.notifications?.statusChangeEnabled) {
      const pref = transformedOrder.notification_preference || 'email';
      
      if (pref === 'email' || pref === 'both') {
        if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
          sendStatusChangeEmail(transformedOrder, oldStatus, status).catch(console.error);
        }
      }
      
      if (pref === 'sms' || pref === 'both') {
        if (process.env.ENABLE_SMS_NOTIFICATIONS === 'true') {
          sendStatusChangeSMS(transformedOrder, status).catch(console.error);
        }
      }
    }

    return NextResponse.json(transformedOrder);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
