'use client';

import { Order } from '@/types';
import OrderCard from './OrderCard';

interface OrderListProps {
  orders: Order[];
  onStatusUpdate: (orderId: string, status: Order['status']) => void;
}

export default function OrderList({ orders, onStatusUpdate }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No orders yet</p>
      </div>
    );
  }

  // Sort orders by creation date (newest first)
  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedOrders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onStatusUpdate={onStatusUpdate}
        />
      ))}
    </div>
  );
}

