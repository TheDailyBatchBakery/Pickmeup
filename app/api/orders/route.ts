import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { sendOrderConfirmationEmail, sendOrderConfirmationSMS } from '@/lib/notifications';
import { Order } from '@/types';

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
      createdAt: order.created_at,
    }));

    return NextResponse.json(transformedOrders);
  } catch (error) {
    console.error('Unexpected error:', error);
    // Return empty array instead of error object
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerInfo, items, pickupTime } = body;

    // Validate required fields
    if (!customerInfo || !items || !pickupTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Calculate total
    const total = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    const orderNumber = generateOrderNumber();

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        zip_code: customerInfo.zipCode,
        total: total.toFixed(2),
        pickup_time: pickupTime,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
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
      createdAt: order.created_at,
    };

    // Send notifications (async, don't wait for them)
    if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
      sendOrderConfirmationEmail(transformedOrder).catch(console.error);
    }
    
    if (process.env.ENABLE_SMS_NOTIFICATIONS === 'true') {
      sendOrderConfirmationSMS(transformedOrder).catch(console.error);
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
      createdAt: data.created_at,
    };

    return NextResponse.json(transformedOrder);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
