import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { MenuItem } from '@/types';

export async function GET() {
  try {
    const supabase = createServerClient();
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_available', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching menu:', error);
      // Return empty array instead of error object to prevent frontend crashes
      return NextResponse.json([]);
    }

    // Handle case where data might be null
    if (!data || !Array.isArray(data)) {
      console.warn('Menu data is not an array:', data);
      return NextResponse.json([]);
    }

    console.log(`Menu API: Found ${data.length} available products`); // Debug log

    // Transform database records to MenuItem format
    const menuItems: MenuItem[] = data.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: parseFloat(product.price),
      category: product.category,
      image: product.image_url || undefined,
    }));

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Unexpected error:', error);
    // Return empty array instead of error object
    return NextResponse.json([]);
  }
}
