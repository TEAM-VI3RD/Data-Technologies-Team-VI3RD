export interface User {
  id: number
  email: string
  is_admin: boolean
  blocked: boolean
  created_at: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  active: boolean
  category_ids: number[]
  created_at: string
}

export interface CartItem {
  id: number
  cart_id: number
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
  added_at: string
}

export interface Address {
  id: number
  user_id: number
  full_name: string
  street: string
  house_number: string
  postal_code: string
  city: string
  country: string
  type: string
}

export interface OrderItem {
  id: number
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface Order {
  id: number
  user_id: number
  status: string
  order_date: string
  total_amount: number
  shipping_address_id: number
  billing_address_id: number
  created_at: string
  items: OrderItem[]
}

export interface Return {
  id: number
  order_id: number
  user_id: number
  reason: string
  status: string
  requested_at: string
  resolved_at: string
}
