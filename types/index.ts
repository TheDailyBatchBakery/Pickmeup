export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  zipCode: string;
  items: CartItem[];
  total: number;
  pickupTime: string;
  status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
  notification_preference?: 'email' | 'sms' | 'both';
  createdAt: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  zipCode: string;
  notificationPreference?: 'email' | 'sms' | 'both';
}

export interface NotificationSettings {
  statusChangeEnabled: boolean;
  reminderEnabled: boolean;
  reminderMinutes: number;
  reminderMethod: 'simple' | 'polling' | 'manual';
}

export interface EmailSMSSettings {
  adminEmails: string[];
  adminPhones: string[];
  customerPreferenceTiming: 'pre-order' | 'post-order';
}

export interface Settings {
  notifications: NotificationSettings;
  email_sms: EmailSMSSettings;
}

