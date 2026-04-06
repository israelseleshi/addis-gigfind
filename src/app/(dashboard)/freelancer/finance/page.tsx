"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DollarSign, Coins, Briefcase, TrendingUp, Download, Loader2, Wallet } from 'lucide-react'
import { toast } from 'sonner'

interface Payment {
  id: string
  amount: number
  status: string
  currency: string
  transaction_id: string
  invoice_number: string | null
  notes: string | null
  payment_method: string
  created_at: string
  paid_at: string | null
  gig: { title: string } | null
  client: { full_name: string; avatar_url: string } | null
}

interface Summary {
  totalEarned: number
  pendingPayments: number
  completedJobs: number
  walletBalance: number
  coinsSpent: number
  coinBalance: number
}

export default function FreelancerFinancePage() {
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<Payment[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)

  useEffect(() => {
    fetchFinanceData()
  }, [])

  const fetchFinanceData = async () => {
    try {
      const response = await fetch('/api/finance/freelancer')
      const data = await response.json()
      
      if (data.success) {
        setPayments(data.data.payments)
        setSummary(data.data.summary)
      } else {
        toast.error(data.error || 'Failed to load finance data')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load finance data')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-amber-100 text-amber-700'
      case 'failed': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Finance</h1>
        <p className="text-gray-500">Track your earnings and payments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-green-100">Total Earned</p>
                <p className="text-xl font-bold">{summary?.totalEarned.toLocaleString() || 0} ETB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Wallet className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Wallet Balance</p>
                <p className="text-xl font-bold">{summary?.walletBalance.toLocaleString() || 0} ETB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-xl font-bold">{summary?.pendingPayments.toLocaleString() || 0} ETB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Jobs Completed</p>
                <p className="text-xl font-bold">{summary?.completedJobs || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coin Balance */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Coins className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Coin Balance</p>
                <p className="text-xl font-bold">{summary?.coinBalance || 0} coins</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              <span className="font-medium">{summary?.coinsSpent || 0}</span> coins spent on applications
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No payments yet. Complete jobs to receive payments.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Invoice</th>
                    <th className="text-left py-3 px-2">Gig</th>
                    <th className="text-left py-3 px-2">Client</th>
                    <th className="text-left py-3 px-2">Amount</th>
                    <th className="text-left py-3 px-2">Status</th>
                    <th className="text-left py-3 px-2">Date</th>
                    <th className="text-left py-3 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <span className="font-mono text-sm">
                          {payment.invoice_number || payment.transaction_id?.slice(0, 12) || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-2">{payment.gig?.title || '-'}</td>
                      <td className="py-3 px-2">
                        {payment.client?.full_name || 'Unknown'}
                      </td>
                      <td className="py-3 px-2 font-medium">
                        {Number(payment.amount).toLocaleString()} ETB
                      </td>
                      <td className="py-3 px-2">
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-gray-500">
                        {payment.paid_at ? formatDate(payment.paid_at) : formatDate(payment.created_at)}
                      </td>
                      <td className="py-3 px-2">
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}