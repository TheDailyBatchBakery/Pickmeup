import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServerClient();
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching products:', error);
      // Return empty array instead of error object
      return NextResponse.json([]);
    }

    // Handle case where data might be null
    if (!data || !Array.isArray(data)) {
      console.warn('Products data is not an array:', data);
      return NextResponse.json([]);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    // Return empty array instead of error object
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, category, image_url, is_available } = body;

    if (!name || !price || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, price, category' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('products')
      .insert({
        name,
        description: description || null,
        price: parseFloat(price).toFixed(2),
        category,
        image_url: image_url || null,
        is_available: is_available !== false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

