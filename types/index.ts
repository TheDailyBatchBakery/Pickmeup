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
  createdAt: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  zipCode: string;
}

