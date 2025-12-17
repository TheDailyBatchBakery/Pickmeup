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
  
  const { open, orderCutoffMinutes, timeSlotInterval } = config.hours;
  
  // Start from current time + cutoff buffer, or opening time
  const earliestTime = addMinutes(now, orderCutoffMinutes);
  const openTime = setHours(today, open);
  
  let startTime = isAfter(earliestTime, openTime) ? earliestTime : openTime;
  
  // Round up to next interval
  const minutes = startTime.getMinutes();
  const roundedMinutes = Math.ceil(minutes / timeSlotInterval) * timeSlotInterval;
  startTime = setMinutes(startTime, roundedMinutes);
  
  // For testing: Generate time slots up to 11:59 PM (allows any hour)
  const endTime = setMinutes(setHours(today, 23), 59);
  
  let currentTime = startTime;
  while (isBefore(currentTime, endTime) || currentTime.getTime() === endTime.getTime()) {
    times.push(format(currentTime, 'h:mm a'));
    currentTime = addMinutes(currentTime, timeSlotInterval);
    
    // Prevent infinite loop
    if (times.length > 200) break;
    
    // Stop at 11:59 PM
    if (currentTime.getHours() >= 23 && currentTime.getMinutes() >= 59) break;
  }
  
  return times;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

