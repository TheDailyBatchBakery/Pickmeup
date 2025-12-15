import { NextResponse } from 'next/server';
import { Order } from '@/types';

// In-memory storage for demo purposes
// In production, use a database
let orders: Order[] = [];

export async function GET() {
  return NextResponse.json(orders);
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

    // Calculate total
    const total = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    // Create order
    const order: Order = {
      id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      customerName: customerInfo.name,
      email: customerInfo.email,
      phone: customerInfo.phone,
      zipCode: customerInfo.zipCode,
      items,
      total,
      pickupTime,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    orders.push(order);

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
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

    const orderIndex = orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    orders[orderIndex].status = status;

    return NextResponse.json(orders[orderIndex]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

