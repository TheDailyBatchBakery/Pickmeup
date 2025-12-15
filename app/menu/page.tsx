'use client';

import { useEffect, useState } from 'react';
import { MenuItem } from '@/types';
import MenuItemComponent from '@/components/customer/MenuItem';
import Cart from '@/components/customer/Cart';

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu');
      const data = await response.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setMenuItems(data);
        const uniqueCategories = ['All', ...new Set(data.map((item: MenuItem) => item.category))];
        setCategories(uniqueCategories as string[]);
      } else {
        console.error('Menu API returned non-array data:', data);
        setMenuItems([]);
        setCategories(['All']);
      }
    } catch (error) {
      console.error('Failed to fetch menu:', error);
      setMenuItems([]);
      setCategories(['All']);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems =
    selectedCategory === 'All'
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Loading menu...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Our Menu</h1>

      <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="grid md:grid-cols-2 gap-6">
            {filteredItems.map((item) => (
              <MenuItemComponent key={item.id} item={item} />
            ))}
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <Cart />
          </div>
        </div>
      </div>
    </div>
  );
}

