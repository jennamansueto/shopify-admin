'use client'

import { FileText } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-gray-50/30">
      <Header title="Reports" description="Generate and view business reports" />
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
              <FileText className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Business Reports</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md text-center">
              Generate detailed reports on sales performance, customer acquisition, product trends, and financial summaries. Schedule recurring reports or create custom exports.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
