import { addMinutes, format, isAfter, isBefore, setHours, setMinutes } from 'date-fns';

// ZIP code validation (5 digits)
export function isValidZipCode(zipCode: string): boolean {
  const zipRegex = /^\d{5}$/;
  return zipRegex.test(zipCode);
}

// Business hours: 10 AM - 8 PM
const BUSINESS_OPEN_HOUR = 10;
const BUSINESS_CLOSE_HOUR = 20;
const ORDER_CUTOFF_MINUTES = 30; // Orders must be placed 30 minutes before pickup

export function getAvailablePickupTimes(): string[] {
  const times: string[] = [];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Start from current time + cutoff buffer, or opening time
  const earliestTime = addMinutes(now, ORDER_CUTOFF_MINUTES);
  const openTime = setHours(today, BUSINESS_OPEN_HOUR);
  const closeTime = setHours(today, BUSINESS_CLOSE_HOUR);
  
  let startTime = isAfter(earliestTime, openTime) ? earliestTime : openTime;
  
  // Round up to next 15-minute interval
  const minutes = startTime.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 15) * 15;
  startTime = setMinutes(startTime, roundedMinutes);
  
  // Generate time slots every 15 minutes until closing time
  let currentTime = startTime;
  while (isBefore(currentTime, closeTime) || currentTime.getTime() === closeTime.getTime()) {
    times.push(format(currentTime, 'h:mm a'));
    currentTime = addMinutes(currentTime, 15);
    
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

