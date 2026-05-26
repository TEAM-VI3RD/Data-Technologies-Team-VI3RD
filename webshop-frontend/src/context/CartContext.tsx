import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { getCart } from '../api'
import { useAuth } from './AuthContext'

interface CartContextType {
  cartCount: number
  refreshCart: () => void
}

const CartContext = createContext<CartContextType>({ cartCount: 0, refreshCart: () => {} })

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [cartCount, setCartCount] = useState(0)

  const refreshCart = useCallback(() => {
    if (!user) { setCartCount(0); return }
    getCart()
      .then((items) => setCartCount(items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0))
      .catch(() => {})
  }, [user])

  useEffect(() => { refreshCart() }, [refreshCart])

  return (
    <CartContext.Provider value={{ cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCartContext() {
  return useContext(CartContext)
}
