import type {
  AuthResponse,
  Product,
  CartItem,
  Address,
  Order,
  Return,
  User,
} from './types'

const BASE = '/api'

function getToken(): string | null {
  return localStorage.getItem('token')
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (res.status === 204) return undefined as T

  const text = await res.text()

  if (!text) {
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return undefined as T
  }

  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return undefined as T
  }

  if (!res.ok) {
    const d = data as Record<string, string>
    throw new Error(d?.error || d?.message || `HTTP ${res.status}`)
  }

  return data as T
}

// Auth
export const login = (email: string, password: string) =>
  request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

export const register = (email: string, password: string) =>
  request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

// Products
export const getProducts = (params?: Record<string, string>) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : ''
  return request<Product[]>(`/products${qs}`)
}

export const getProduct = (id: number) =>
  request<Product>(`/products/${id}`)

export const createProduct = (data: Omit<Product, 'id' | 'created_at'>) =>
  request<Product>('/products', { method: 'POST', body: JSON.stringify(data) })

export const updateProduct = (id: number, data: Partial<Product>) =>
  request<Product>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

export const deleteProduct = (id: number) =>
  request<void>(`/products/${id}`, { method: 'DELETE' })

// Cart
export const getCart = () => request<CartItem[]>('/cart')

export const addToCart = (product_id: number, quantity: number) =>
  request<void>('/cart', {
    method: 'POST',
    body: JSON.stringify({ product_id, quantity }),
  })

export const updateCartItem = (product_id: number, quantity: number) =>
  request<void>(`/cart/${product_id}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  })

export const removeFromCart = (product_id: number) =>
  request<void>(`/cart/${product_id}`, { method: 'DELETE' })

// Addresses
export const getAddresses = () => request<Address[]>('/addresses')

export const createAddress = (data: Omit<Address, 'id' | 'user_id'>) =>
  request<Address>('/addresses', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const deleteAddress = (id: number) =>
  request<void>(`/addresses/${id}`, { method: 'DELETE' })

// Orders
export const placeOrder = (shipping_address_id: number, billing_address_id: number) =>
  request<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify({ shipping_address_id, billing_address_id }),
  })

export const getOrders = () => request<Order[]>('/orders')

export const getOrder = (id: number) => request<Order>(`/orders/${id}`)

// Returns
export const getReturns = () => request<Return[]>('/returns')

export const createReturn = (order_id: number, reason: string) =>
  request<Return>('/returns', {
    method: 'POST',
    body: JSON.stringify({ order_id, reason }),
  })

// Admin – users
export const adminGetUsers = () => request<User[]>('/admin/users')

export const adminBlockUser = (id: number) =>
  request<User>(`/admin/users/${id}/block`, { method: 'PUT' })

export const adminUnblockUser = (id: number) =>
  request<User>(`/admin/users/${id}/unblock`, { method: 'PUT' })

export const adminDeleteUser = (id: number) =>
  request<void>(`/admin/users/${id}`, { method: 'DELETE' })

// Admin – orders
export const adminGetOrders = () => request<Order[]>('/admin/orders')

export const adminGetOrder = (id: number) => request<Order>(`/admin/orders/${id}`)

export const adminUpdateOrderStatus = (id: number, status: string) =>
  request<void>(`/admin/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })

// Admin – returns
export const adminGetReturns = () => request<Return[]>('/admin/returns')

export const adminUpdateReturnStatus = (id: number, status: string) =>
  request<void>(`/admin/returns/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
