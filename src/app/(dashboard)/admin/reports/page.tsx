
"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports Management</h1>

      <Card>
        <CardContent className="pt-6 text-center">
          <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Reports Yet</h3>
          <p className="text-gray-500">
            When users report content, it will appear here for review.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-gray-400">0</div>
            <p className="text-sm text-gray-500">Pending Reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-500">0</div>
            <p className="text-sm text-gray-500">Resolved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-500">0</div>
            <p className="text-sm text-gray-500">Dismissed</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
