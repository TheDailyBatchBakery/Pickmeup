'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import PickupTimeSelector from '@/components/customer/PickupTimeSelector';
import { isValidZipCode } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { Settings } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const customerInfo = useCartStore((state) => state.customerInfo);
  const pickupTime = useCartStore((state) => state.pickupTime);
  const notificationPreference = useCartStore((state) => state.notificationPreference);
  const setCustomerInfo = useCartStore((state) => state.setCustomerInfo);
  const setPickupTime = useCartStore((state) => state.setPickupTime);
  const setNotificationPreference = useCartStore((state) => state.setNotificationPreference);
  const getTotal = useCartStore((state) => state.getTotal);
  const clearCart = useCartStore((state) => state.clearCart);

  const [formData, setFormData] = useState({
    name: customerInfo?.name || '',
    email: customerInfo?.email || '',
    phone: customerInfo?.phone || '',
    zipCode: customerInfo?.zipCode || '',
  });

  // Update form when customerInfo changes
  useEffect(() => {
    if (customerInfo) {
      setFormData({
        name: customerInfo.name || '',
        email: customerInfo.email || '',
        phone: customerInfo.phone || '',
        zipCode: customerInfo.zipCode || '',
      });
    }
  }, [customerInfo]);

  const [settings, setSettings] = useState<Settings | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if user needs to verify (no email or phone)
    if (!customerInfo?.email && !customerInfo?.phone) {
      router.push('/verify');
      return;
    }

    // Pre-fill form with verified info
    if (customerInfo) {
      setFormData({
        name: customerInfo.name || '',
        email: customerInfo.email || '',
        phone: customerInfo.phone || '',
        zipCode: customerInfo.zipCode || '',
      });
    }

    // Fetch settings to check customer preference timing
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(console.error);
  }, [customerInfo, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone must be 10 digits';
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!isValidZipCode(formData.zipCode)) {
      newErrors.zipCode = 'ZIP code must be 5 digits';
    }

    if (!pickupTime) {
      newErrors.pickupTime = 'Please select a pickup time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Format phone number
      const formattedPhone = formData.phone.replace(/\D/g, '');

      const customerInfo = {
        name: formData.name,
        email: formData.email,
        phone: formattedPhone,
        zipCode: formData.zipCode,
      };

      setCustomerInfo(customerInfo);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerInfo,
          items,
          pickupTime,
          notificationPreference,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      const order = await response.json();
      clearCart();
      router.push(`/confirmation?id=${order.id}`);
    } catch (error) {
      console.error('Order submission error:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">
            Add some items to your cart before checkout.
          </p>
          <Button onClick={() => router.push('/menu')}>Browse Menu</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {(customerInfo?.email || customerInfo?.phone) && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>✓ Verified:</strong> {customerInfo?.email ? `Email: ${customerInfo.email}` : customerInfo?.phone ? `Phone: ${customerInfo.phone}` : ''}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Please review and complete your information below.
              </p>
            </div>
          )}
          <h2 className="text-2xl font-semibold mb-6">Customer Information</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              error={errors.name}
              required
            />

            <div>
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                error={errors.email}
                required
                disabled={!!customerInfo?.email}
                className={customerInfo?.email ? 'bg-gray-50' : ''}
              />
              {customerInfo?.email && (
                <p className="text-xs text-gray-500 mt-1">✓ Email verified - cannot be changed</p>
              )}
            </div>

            <div>
              <Input
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                error={errors.phone}
                placeholder="(555) 123-4567"
                required
                disabled={!!customerInfo?.phone && !customerInfo?.email}
                className={customerInfo?.phone && !customerInfo?.email ? 'bg-gray-50' : ''}
              />
              {customerInfo?.phone && !customerInfo?.email && (
                <p className="text-xs text-gray-500 mt-1">✓ Phone verified - cannot be changed</p>
              )}
            </div>

            <Input
              label="ZIP Code"
              type="text"
              value={formData.zipCode}
              onChange={(e) =>
                setFormData({ ...formData, zipCode: e.target.value })
              }
              error={errors.zipCode}
              placeholder="12345"
              maxLength={5}
              required
            />

            <PickupTimeSelector />
            {errors.pickupTime && (
              <p className="text-sm text-red-600">{errors.pickupTime}</p>
            )}

            {/* Notification Preference - Show based on admin setting */}
            {(!settings || settings.email_sms.customerPreferenceTiming === 'pre-order') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How would you like to receive order updates?
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="notificationPreference"
                      value="email"
                      checked={notificationPreference === 'email'}
                      onChange={(e) => setNotificationPreference(e.target.value as 'email' | 'sms' | 'both')}
                      className="mr-2"
                    />
                    Email
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="notificationPreference"
                      value="sms"
                      checked={notificationPreference === 'sms'}
                      onChange={(e) => setNotificationPreference(e.target.value as 'email' | 'sms' | 'both')}
                      className="mr-2"
                    />
                    SMS
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="notificationPreference"
                      value="both"
                      checked={notificationPreference === 'both'}
                      onChange={(e) => setNotificationPreference(e.target.value as 'email' | 'sms' | 'both')}
                      className="mr-2"
                    />
                    Both
                  </label>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </Button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center border-b pb-4"
              >
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
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold">Total:</span>
              <span className="text-xl font-bold text-primary-600">
                {formatCurrency(getTotal())}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

