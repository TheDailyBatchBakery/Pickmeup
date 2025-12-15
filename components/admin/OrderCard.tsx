'use client';

import { Order } from '@/types';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface OrderCardProps {
  order: Order;
  onStatusUpdate: (orderId: string, status: Order['status']) => void;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  ready: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function OrderCard({ order, onStatusUpdate }: OrderCardProps) {
  const statusOptions: Order['status'][] = ['pending', 'confirmed', 'ready', 'completed', 'cancelled'];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-500">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">Order #{order.id.slice(0, 8)}</h3>
          <p className="text-sm text-gray-600">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
          {order.status}
        </span>
      </div>

      <div className="mb-4">
        <p className="font-medium">{order.customerName}</p>
        <p className="text-sm text-gray-600">{order.email}</p>
        <p className="text-sm text-gray-600">{order.phone}</p>
        <p className="text-sm text-gray-600">ZIP: {order.zipCode}</p>
      </div>

      <div className="mb-4">
        <p className="font-medium mb-2">Pickup Time: {order.pickupTime}</p>
        <div className="space-y-1">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.quantity}x {item.name}
              </span>
              <span>{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t">
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {statusOptions.map((status) => (
          <Button
            key={status}
            onClick={() => onStatusUpdate(order.id, status)}
            variant={order.status === status ? 'primary' : 'outline'}
            size="sm"
            disabled={order.status === status}
          >
            {status}
          </Button>
        ))}
      </div>
    </div>
  );
}

