export interface CartItem {
  book_id: number;
  book_title?: string;
  book_author?: string;
  book_price?: number;
  book_image?: string;
  quantity: number;
}

export interface Cart {
  user_id: number;
  items: CartItem[];
  total_price: number;
  updated_at: string;
}

export interface Order {
  order_id: number;
  user_id?: number;
  order_number?: string;
  order_status?: 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled';
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method?: 'cod' | 'bank_transfer' | 'credit_card';
  payment_status: 'pending' | 'paid' | 'failed';
  total_amount: number;
  shipping_address: string | any;
  shipping_fee?: number;
  notes?: string;
  items: OrderItem[];
  created_at: string;
  updated_at?: string;
}

export interface OrderItem {
  order_item_id?: number;
  order_id?: number;
  book_id: number;
  title?: string;
  book_title?: string;
  book_author?: string;
  quantity: number;
  price: number;
  subtotal?: number;
}

export interface CheckoutRequest {
  items: CartItem[];
  shipping_address_id: number;
  payment_method: 'cod' | 'bank_transfer' | 'credit_card';
  notes?: string;
}

// Bank info for VietQR payment
export interface BankInfo {
  account_no: string;
  account_name: string;
  bank_name: string;
}

// Payment data returned from checkout
export interface PaymentData {
  qr_data_url: string;
  transfer_content: string;
  bank_info: BankInfo;
  expires_at: string;
  expires_in_seconds: number;
}

// Checkout response with QR data
// Requirements: 3.4
export interface CheckoutResponse {
  order_id: number;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  payment: PaymentData;
  message: string;
}

// QR response for getOrderQR
export interface QRResponse {
  order_id: number;
  qr_data_url: string;
  transfer_content: string;
  bank_info: BankInfo;
  expires_at: string;
  expires_in_seconds: number;
  is_regenerated?: boolean;
}
