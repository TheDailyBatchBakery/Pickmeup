import { NextResponse } from 'next/server';
import { MenuItem } from '@/types';

// Sample menu data - in production, this would come from a database
const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Classic Burger',
    description: 'Juicy beef patty with lettuce, tomato, onion, and special sauce',
    price: 12.99,
    category: 'Burgers',
  },
  {
    id: '2',
    name: 'Cheeseburger',
    description: 'Classic burger with melted cheese',
    price: 13.99,
    category: 'Burgers',
  },
  {
    id: '3',
    name: 'Bacon Burger',
    description: 'Burger topped with crispy bacon and cheddar cheese',
    price: 15.99,
    category: 'Burgers',
  },
  {
    id: '4',
    name: 'Chicken Sandwich',
    description: 'Grilled chicken breast with mayo and pickles',
    price: 11.99,
    category: 'Sandwiches',
  },
  {
    id: '5',
    name: 'French Fries',
    description: 'Crispy golden fries, perfectly seasoned',
    price: 4.99,
    category: 'Sides',
  },
  {
    id: '6',
    name: 'Onion Rings',
    description: 'Beer-battered onion rings',
    price: 5.99,
    category: 'Sides',
  },
  {
    id: '7',
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with Caesar dressing and croutons',
    price: 9.99,
    category: 'Salads',
  },
  {
    id: '8',
    name: 'Soft Drink',
    description: 'Coca-Cola, Sprite, or Dr. Pepper',
    price: 2.99,
    category: 'Beverages',
  },
  {
    id: '9',
    name: 'Iced Tea',
    description: 'Freshly brewed iced tea',
    price: 2.99,
    category: 'Beverages',
  },
];

export async function GET() {
  return NextResponse.json(menuItems);
}

