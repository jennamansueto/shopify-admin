'use client'

import { Users } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'

export default function CustomersPage() {
  return (
    <div className="min-h-screen bg-gray-50/30">
      <Header title="Customers" description="View and manage customer accounts" />
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
              <Users className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Customer Directory</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md text-center">
              View customer profiles, order history, and lifetime value. Segment customers for targeted campaigns and personalized experiences.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
