import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET: Look up customer by email or phone
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email or phone parameter is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Query orders to find most recent customer info
    let query = supabase
      .from('orders')
      .select('customer_name, email, phone, zip_code')
      .order('created_at', { ascending: false })
      .limit(1);

    if (email) {
      query = query.eq('email', email);
    } else if (phone) {
      // Normalize phone (remove non-digits for comparison)
      const normalizedPhone = phone.replace(/\D/g, '');
      // We'll need to compare normalized phones, but Supabase doesn't support regex easily
      // So we'll get all recent orders and filter client-side
      query = query.limit(100); // Get more to find matching phone
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Error fetching customer info:', error);
      return NextResponse.json({ customer: null });
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ customer: null });
    }

    // If searching by phone, filter client-side (since phone format may vary)
    let customer = null;
    if (phone) {
      const normalizedPhone = phone.replace(/\D/g, '');
      customer = orders.find((order: any) => {
        const orderPhone = order.phone.replace(/\D/g, '');
        return orderPhone === normalizedPhone;
      });
    } else {
      customer = orders[0];
    }

    if (!customer) {
      return NextResponse.json({ customer: null });
    }

    return NextResponse.json({
      customer: {
        name: customer.customer_name,
        email: customer.email,
        phone: customer.phone,
        zipCode: customer.zip_code,
      },
    });
  } catch (error) {
    console.error('Error looking up customer:', error);
    return NextResponse.json({ customer: null });
  }
}

