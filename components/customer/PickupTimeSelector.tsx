'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store';
import { getAvailablePickupTimes } from '@/lib/utils';
import Input from '@/components/ui/Input';

export default function PickupTimeSelector() {
  const pickupTime = useCartStore((state) => state.pickupTime);
  const setPickupTime = useCartStore((state) => state.setPickupTime);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  useEffect(() => {
    setAvailableTimes(getAvailablePickupTimes());
  }, []);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Pickup Time
      </label>
      <select
        value={pickupTime || ''}
        onChange={(e) => setPickupTime(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        required
      >
        <option value="">Choose a time...</option>
        {availableTimes.map((time) => (
          <option key={time} value={time}>
            {time}
          </option>
        ))}
      </select>
      {availableTimes.length === 0 && (
        <p className="mt-2 text-sm text-gray-500">
          No pickup times available today. Please check back tomorrow.
        </p>
      )}
    </div>
  );
}

