import { create } from 'zustand'
import { cartApi, type Cart, type CartItem } from '@/lib/api/cart'

// ── Empty cart shape ──────────────────────────────────────────────────────────

const EMPTY_CART: Cart = { id: null, total_items: 0, subtotal: 0, items: [] }

// ── Store interface ───────────────────────────────────────────────────────────

interface CartStore {
  cart: Cart
  isLoading: boolean
  isDropdownOpen: boolean
  hasFetched: boolean

  // Actions
  fetchCart: () => Promise<void>
  addItem: (productId: string, quantity?: number) => Promise<void>
  updateItem: (cartItemId: string, quantity: number) => Promise<void>
  removeItem: (cartItemId: string) => Promise<void>
  clearCart: () => Promise<void>
  openDropdown: () => void
  closeDropdown: () => void
  toggleDropdown: () => void
  syncCart: (cart: Cart) => void
}

// ── Store implementation ──────────────────────────────────────────────────────

export const useCartStore = create<CartStore>((set, get) => ({
  cart: EMPTY_CART,
  isLoading: false,
  isDropdownOpen: false,
  hasFetched: false,

  syncCart: (cart) => set({ cart }),

  fetchCart: async () => {
    if (get().hasFetched) return
    set({ isLoading: true })
    try {
      const cart = await cartApi.get()
      set({ cart: cart ?? EMPTY_CART, hasFetched: true })
    } catch {
      set({ cart: EMPTY_CART })
    } finally {
      set({ isLoading: false })
    }
  },

  addItem: async (productId, quantity = 1) => {
    set({ isLoading: true })
    try {
      const cart = await cartApi.addItem(productId, quantity)
      set({ cart, isDropdownOpen: true }) // open dropdown on add
    } finally {
      set({ isLoading: false })
    }
  },

  updateItem: async (cartItemId, quantity) => {
    // Optimistic update
    const prev = get().cart
    const optimistic: Cart = {
      ...prev,
      items: prev.items.map((i) =>
        i.id === cartItemId
          ? { ...i, quantity, line_total: i.product.price * quantity }
          : i,
      ),
      subtotal: 0, // recalc below
      total_items: 0,
    }
    optimistic.subtotal = optimistic.items.reduce((s, i) => s + i.line_total, 0)
    optimistic.total_items = optimistic.items.reduce((s, i) => s + i.quantity, 0)
    set({ cart: optimistic })

    try {
      const cart = await cartApi.updateItem(cartItemId, quantity)
      set({ cart })
    } catch {
      set({ cart: prev }) // rollback
    }
  },

  removeItem: async (cartItemId) => {
    // Optimistic update
    const prev = get().cart
    const filtered = prev.items.filter((i) => i.id !== cartItemId)
    set({
      cart: {
        ...prev,
        items: filtered,
        total_items: filtered.reduce((s, i) => s + i.quantity, 0),
        subtotal: filtered.reduce((s, i) => s + i.line_total, 0),
      },
    })

    try {
      const cart = await cartApi.removeItem(cartItemId)
      set({ cart })
    } catch {
      set({ cart: prev }) // rollback
    }
  },

  clearCart: async () => {
    await cartApi.clear()
    set({ cart: EMPTY_CART })
  },

  openDropdown: () => set({ isDropdownOpen: true }),
  closeDropdown: () => set({ isDropdownOpen: false }),
  toggleDropdown: () => set((s) => ({ isDropdownOpen: !s.isDropdownOpen })),
}))