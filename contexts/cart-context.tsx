"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Producto } from "@/lib/api"

export interface CartItem {
  producto: Producto
  cantidad: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (producto: Producto, cantidad?: number) => void
  removeFromCart: (productoId: number) => void
  updateQuantity: (productoId: number, cantidad: number) => void
  clearCart: () => void
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("palermo-cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("[v0] Error loading cart:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("palermo-cart", JSON.stringify(items))
  }, [items])

  const addToCart = (producto: Producto, cantidad = 1) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.producto.id === producto.id)

      if (existingItem) {
        // Update quantity if item already exists
        return currentItems.map((item) =>
          item.producto.id === producto.id ? { ...item, cantidad: item.cantidad + cantidad } : item,
        )
      } else {
        // Add new item
        return [...currentItems, { producto, cantidad }]
      }
    })
  }

  const removeFromCart = (productoId: number) => {
    setItems((currentItems) => currentItems.filter((item) => item.producto.id !== productoId))
  }

  const updateQuantity = (productoId: number, cantidad: number) => {
    if (cantidad <= 0) {
      removeFromCart(productoId)
      return
    }

    setItems((currentItems) =>
      currentItems.map((item) => (item.producto.id === productoId ? { ...item, cantidad } : item)),
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const total = items.reduce((sum, item) => {
    const precio = Number(item.producto.precio || 0)
    return sum + precio * item.cantidad
  }, 0)

  const itemCount = items.reduce((sum, item) => sum + item.cantidad, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
