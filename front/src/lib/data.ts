import { User, Order } from './types'

export const users: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'customer@example.com',
    role: 'customer',
    avatar: 'https://i.pravatar.cc/150?u=customer@example.com',
  },
  {
    id: '2',
    name: 'Admin User',
    email: 'admin@luxestore.com',
    role: 'admin',
    avatar: 'https://i.pravatar.cc/150?u=admin@luxestore.com',
  },
]

export const orders: Order[] = [
  {
    id: 'ORD-1234',
    userId: '1',
    status: 'shipped',
    createdAt: '2023-10-10T10:00:00Z',
    trackingNumber: 'TRK987654321',
    estimatedDelivery: '2023-10-15T10:00:00Z',
    shippingAddress: {
      label: 'Home',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    paymentMethod: 'Visa ending in 4242',
    items: [
      {
        product: {
          id: 'p1',
          name: 'Classic T-Shirt',
          price: 25,
          images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'],
          category: 'Clothing'
        },
        quantity: 2,
        priceAtPurchase: 25
      }
    ],
    subtotal: 50,
    shipping: 5,
    tax: 4.5,
    total: 59.5
  }
];

export function getOrderById(id: string): Order | undefined {
  return orders.find(o => o.id === id);
}
