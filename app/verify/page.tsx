'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function VerifyPage() {
  const router = useRouter();
  const setCustomerInfo = useCartStore((state) => state.setCustomerInfo);
  const items = useCartStore((state) => state.items);
  const customerInfo = useCartStore((state) => state.customerInfo);

  const [formData, setFormData] = useState({
    email: customerInfo?.email || '',
    phone: customerInfo?.phone || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'phone'>(
    customerInfo?.email ? 'email' : 'phone'
  );

  useEffect(() => {
    // Redirect if cart is empty
    if (items.length === 0) {
      router.push('/menu');
      return;
    }

    // Pre-fill if user already has verified info
    if (customerInfo?.email) {
      setFormData(prev => ({ ...prev, email: customerInfo.email || '' }));
      setVerificationMethod('email');
    } else if (customerInfo?.phone) {
      setFormData(prev => ({ ...prev, phone: customerInfo.phone || '' }));
      setVerificationMethod('phone');
    }
  }, [items, customerInfo, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (verificationMethod === 'email') {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
    } else {
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        newErrors.phone = 'Phone must be 10 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsVerifying(true);

    try {
      // Format phone number if using phone verification
      const formattedPhone = verificationMethod === 'phone' 
        ? formData.phone.replace(/\D/g, '')
        : '';

      // For now, we'll just store the verified info and proceed
      // In a production app, you might want to:
      // 1. Check if user exists in database
      // 2. Send verification code via email/SMS
      // 3. Verify the code before proceeding
      
      // Store verified contact info (we'll get full info in checkout)
      const verifiedInfo = {
        name: '', // Will be filled in checkout
        email: formData.email.trim(),
        phone: formattedPhone || formData.phone.trim(),
        zipCode: '', // Will be filled in checkout
        notificationPreference: 'email' as 'email' | 'sms' | 'both',
      };

      // Set partial customer info (email/phone verified)
      setCustomerInfo(verifiedInfo);

      // Redirect to checkout
      router.push('/checkout');
    } catch (error) {
      console.error('Verification error:', error);
      alert('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Information</h1>
          <p className="text-gray-600 mb-6">
            Please provide your contact information to proceed to checkout.
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Verify using:
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="verificationMethod"
                  value="email"
                  checked={verificationMethod === 'email'}
                  onChange={(e) => {
                    setVerificationMethod(e.target.value as 'email' | 'phone');
                    setErrors({});
                  }}
                  className="mr-2"
                />
                Email
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="verificationMethod"
                  value="phone"
                  checked={verificationMethod === 'phone'}
                  onChange={(e) => {
                    setVerificationMethod(e.target.value as 'email' | 'phone');
                    setErrors({});
                  }}
                  className="mr-2"
                />
                Phone Number
              </label>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {verificationMethod === 'email' ? (
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                error={errors.email}
                placeholder="your@email.com"
                required
                autoFocus
              />
            ) : (
              <Input
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (errors.phone) setErrors({ ...errors, phone: '' });
                }}
                error={errors.phone}
                placeholder="(555) 123-4567"
                required
                autoFocus
              />
            )}

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isVerifying}
              >
                {isVerifying ? 'Verifying...' : 'Continue to Checkout'}
              </Button>
            </div>
          </form>

          <p className="text-sm text-gray-500 mt-4 text-center">
            Your information will be used to send order confirmations and updates.
          </p>
        </div>
      </div>
    </div>
  );
}

