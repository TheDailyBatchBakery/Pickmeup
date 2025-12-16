'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Order, Settings } from '@/types';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [newStatus, setNewStatus] = useState<Order['status'] | ''>('');

  useEffect(() => {
    fetchOrder();
    fetchSettings();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const foundOrder = data.find((o: Order) => o.id === orderId);
        setOrder(foundOrder || null);
        if (foundOrder) {
          setNewStatus(foundOrder.status);
        }
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || !order) return;

    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: order.id, status: newStatus }),
      });

      if (response.ok) {
        fetchOrder();
        alert('Order status updated successfully!');
      } else {
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status');
    }
  };

  const handleSendReminder = async () => {
    if (!order) return;

    setSendingReminder(true);
    try {
      const response = await fetch(`/api/orders/${order.id}/reminder`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Reminder sent successfully!');
      } else {
        alert('Failed to send reminder');
      }
    } catch (error) {
      console.error('Failed to send reminder:', error);
      alert('Failed to send reminder');
    } finally {
      setSendingReminder(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Order not found</h1>
          <Button onClick={() => router.push('/admin')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push('/admin')}>
          ← Back to Dashboard
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold mb-6">Order Details</h1>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            <div className="space-y-2">
              <p><strong>Name:</strong> {order.customerName}</p>
              <p><strong>Email:</strong> {order.email}</p>
              <p><strong>Phone:</strong> {order.phone}</p>
              <p><strong>ZIP Code:</strong> {order.zipCode}</p>
              <p><strong>Notification Preference:</strong> {order.notification_preference || 'email'}</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Order Information</h2>
            <div className="space-y-2">
              <p><strong>Order ID:</strong> {order.id}</p>
              <p><strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status}
                </span>
              </p>
              <p><strong>Pickup Time:</strong> {order.pickupTime}</p>
              <p><strong>Total:</strong> {formatCurrency(order.total)}</p>
              <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Items</h2>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    {item.quantity} × {formatCurrency(item.price)}
                  </p>
                </div>
                <p className="font-semibold">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Status Update */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Update Status</h2>
          <div className="flex gap-4 items-center">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as Order['status'])}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="ready">Ready</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button
              onClick={handleStatusUpdate}
              disabled={newStatus === order.status}
            >
              Update Status
            </Button>
          </div>
        </div>

        {/* Manual Reminder (if manual method enabled) */}
        {settings?.notifications?.reminderEnabled && 
         settings.notifications.reminderMethod === 'manual' && 
         (order.status === 'pending' || order.status === 'confirmed') && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Send Reminder</h2>
            <p className="text-sm text-gray-600 mb-4">
              Send a reminder notification to the customer about their upcoming pickup.
            </p>
            <Button
              onClick={handleSendReminder}
              disabled={sendingReminder}
            >
              {sendingReminder ? 'Sending...' : 'Send Reminder'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

