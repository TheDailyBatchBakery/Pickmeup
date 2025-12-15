import { addMinutes, format, isAfter, isBefore, setHours, setMinutes } from 'date-fns';
import { config } from './config';

// ZIP code validation (5 digits)
export function isValidZipCode(zipCode: string): boolean {
  const zipRegex = /^\d{5}$/;
  return zipRegex.test(zipCode);
}

export function getAvailablePickupTimes(): string[] {
  const times: string[] = [];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const { open, close, orderCutoffMinutes, timeSlotInterval } = config.hours;
  
  // Start from current time + cutoff buffer, or opening time
  const earliestTime = addMinutes(now, orderCutoffMinutes);
  const openTime = setHours(today, open);
  const closeTime = setHours(today, close);
  
  let startTime = isAfter(earliestTime, openTime) ? earliestTime : openTime;
  
  // Round up to next interval
  const minutes = startTime.getMinutes();
  const roundedMinutes = Math.ceil(minutes / timeSlotInterval) * timeSlotInterval;
  startTime = setMinutes(startTime, roundedMinutes);
  
  // Generate time slots until closing time
  let currentTime = startTime;
  while (isBefore(currentTime, closeTime) || currentTime.getTime() === closeTime.getTime()) {
    times.push(format(currentTime, 'h:mm a'));
    currentTime = addMinutes(currentTime, timeSlotInterval);
    
    // Prevent infinite loop
    if (times.length > 100) break;
  }
  
  return times;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

