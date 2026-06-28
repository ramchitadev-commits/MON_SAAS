export type OrderStatus = 'en_attente' | 'payee' | 'a_envoyer' | 'en_route' | 'livre' | 'annulee';
export type PaymentProvider = 'wave' | 'orange_money';
export type CourierChannel = 'sms' | 'whatsapp';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
  stock: number | null; // null = stock illimité
  createdAt: string;
}

export interface Courier {
  id: string;
  name: string;
  phone: string;
  channel: CourierChannel;
  isDefault: boolean;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId?: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryZone: string;
  deliveryAddress: string;
  deliveryNote?: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentProvider: PaymentProvider;
  paymentRef?: string;
  trackingToken: string;
  courierId?: string | null;
  dispatchedAt?: string | null;
  paidAt?: string | null;
  createdAt: string;
  items: OrderItem[];
}
