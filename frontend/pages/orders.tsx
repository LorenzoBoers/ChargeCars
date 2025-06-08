import React from 'react'
import { NextUIProvider } from '@nextui-org/react'
import OrderManagement from '../components/OrderManagement'

export default function OrdersPage() {
  return (
    <NextUIProvider>
      <div className="min-h-screen bg-gray-50">
        <OrderManagement />
      </div>
    </NextUIProvider>
  )
} 