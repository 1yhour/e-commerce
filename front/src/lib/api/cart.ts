import api from '@/lib/axios'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CartProduct {
  id: string
  name: string
  price: number
  image: string | null
}

export interface CartItem {
  id: string
  quantity: number
  line_total: number
  product: CartProduct
}

export interface Cart {
  id: string | null
  total_items: number
  subtotal: number
  items: CartItem[]
}

export interface Address {
  id: string
  label: string
  street: string
  city: string
  full_address: string
}

export interface KhqrData {
  id: string
  qr_string: string
  md5: string
  amount: number
  currency: string
  expires_at: string
}

export interface CheckoutResponse {
  message: string
  data: {
    order_id: string
    total: number
    payment: { id: string; method: string; status: string }
    khqr: KhqrData
  }
}

export interface PaymentStatus {
  order_id: string
  order_status: string
  payment_status: string
  khqr_status: 'generated' | 'scanned' | 'paid' | 'expired' | 'failed'
  paid_at: string | null
  expires_at: string
  is_expired: boolean
}

// ── Cart API ──────────────────────────────────────────────────────────────────

export const cartApi = {
  get: () =>
    api.get<{ data: Cart }>('/cart').then((r) => r.data.data),

  addItem: (productId: string, quantity = 1) =>
    api
      .post<{ data: Cart }>('/cart/items', { product_id: productId, quantity })
      .then((r) => r.data.data),

  updateItem: (cartItemId: string, quantity: number) =>
    api
      .put<{ data: Cart }>(`/cart/items/${cartItemId}`, { quantity })
      .then((r) => r.data.data),

  removeItem: (cartItemId: string) =>
    api
      .delete<{ data: Cart }>(`/cart/items/${cartItemId}`)
      .then((r) => r.data.data),

  clear: () => api.delete('/cart'),
}

// ── Checkout API ──────────────────────────────────────────────────────────────

export const checkoutApi = {
  placeOrder: (payload: {
    address_id: string
    note?: string
    payment_method: 'khqr'
  }) =>
    api.post<CheckoutResponse>('/checkout', payload).then((r) => r.data),

  pollStatus: (orderId: string) =>
    api
      .get<{ data: PaymentStatus }>(`/orders/${orderId}/payment/status`)
      .then((r) => r.data.data),

  refreshQr: (orderId: string) =>
    api
      .post<{ data: KhqrData }>(`/orders/${orderId}/khqr/refresh`)
      .then((r) => r.data.data),

  getAddresses: () =>
    api.get<{ data: Address[] }>('/addresses').then((r) => r.data.data),
}