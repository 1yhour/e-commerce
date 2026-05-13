const SESSION_KEY = 'guest_session_id'

/**
 * Returns a persistent guest session ID stored in localStorage.
 * Used as the X-Session-Id header for guest cart operations.
 * After login, the backend merges this cart into the user's cart.
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export function clearSessionId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY)
  }
}