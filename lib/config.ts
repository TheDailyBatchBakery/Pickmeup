// Configuration file for easy template customization
// This allows clients to easily customize their business settings

export const config = {
  // Business Information
  business: {
    name: process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Pickmeup',
    email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'orders@pickmeup.com',
    phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || '(555) 123-4567',
    address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || '123 Main St, City, State 12345',
  },

  // Business Hours
  hours: {
    open: parseInt(process.env.NEXT_PUBLIC_BUSINESS_OPEN_HOUR || '10'),
    close: parseInt(process.env.NEXT_PUBLIC_BUSINESS_CLOSE_HOUR || '20'),
    orderCutoffMinutes: parseInt(process.env.NEXT_PUBLIC_ORDER_CUTOFF_MINUTES || '30'),
    timeSlotInterval: parseInt(process.env.NEXT_PUBLIC_TIME_SLOT_INTERVAL || '15'),
  },

  // Features
  features: {
    emailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
    smsNotifications: process.env.ENABLE_SMS_NOTIFICATIONS === 'true',
    requireZipCode: process.env.REQUIRE_ZIP_CODE !== 'false', // Default true
  },

  // Email/SMS Settings
  notifications: {
    fromEmail: process.env.FROM_EMAIL || 'noreply@pickmeup.com',
    fromName: process.env.FROM_NAME || 'Pickmeup',
    replyTo: process.env.REPLY_TO_EMAIL || 'support@pickmeup.com',
  },
};

