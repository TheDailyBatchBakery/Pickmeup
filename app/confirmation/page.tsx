'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Order } from '@/types';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch('/api/orders');
      const orders = await response.json();
      const foundOrder = orders.find((o: Order) => o.id === orderId);
      setOrder(foundOrder || null);
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn't find your order. Please contact support.
          </p>
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-600">
            Thank you for your order. We'll have it ready for pickup.
          </p>
        </div>

        <div className="border-t border-b py-6 mb-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Order Number</p>
              <p className="font-semibold text-lg">{order.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pickup Time</p>
              <p className="font-semibold text-lg">{order.pickupTime}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-semibold text-lg capitalize">{order.status}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="font-semibold mb-4">Order Details</h2>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="font-semibold mb-4">Customer Information</h2>
          <div className="space-y-1 text-gray-600">
            <p>{order.customerName}</p>
            <p>{order.email}</p>
            <p>{order.phone}</p>
            <p>ZIP: {order.zipCode}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full">
              Return Home
            </Button>
          </Link>
          <Link href="/menu" className="flex-1">
            <Button className="w-full">Order Again</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

