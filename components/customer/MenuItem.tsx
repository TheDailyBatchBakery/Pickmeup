'use client';

import { MenuItem as MenuItemType } from '@/types';
import { useCartStore } from '@/lib/store';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

interface MenuItemProps {
  item: MenuItemType;
}

export default function MenuItem({ item }: MenuItemProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({ ...item, quantity: 1 });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {item.image && (
        <div className="h-48 bg-gray-200 overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
          <span className="text-lg font-bold text-primary-600">
            {formatCurrency(item.price)}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-4">{item.description}</p>
        <Button onClick={handleAddToCart} className="w-full" size="sm">
          Add to Cart
        </Button>
      </div>
    </div>
  );
}

