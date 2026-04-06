"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DollarSign, Coins, CreditCard, TrendingUp, Download, Loader2 } from 'lucide-react'
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
  freelancer: { full_name: string; avatar_url: string } | null
}

interface CoinPurchase {
  id: string
  coins_purchased: number
  amount_paid_etb: number
  status: string
  package_id: string
  payment_tx_ref: string
  created_at: string
}

interface Summary {
  totalSpent: number
  pendingPayments: number
  totalCoinsBought: number
  totalCoinsSpent: number
}

export default function ClientFinancePage() {
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<Payment[]>([])
  const [coinPurchases, setCoinPurchases] = useState<CoinPurchase[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [activeTab, setActiveTab] = useState<'payments' | 'coins'>('payments')

  useEffect(() => {
    fetchFinanceData()
  }, [])

  const fetchFinanceData = async () => {
    try {
      const response = await fetch('/api/finance/client')
      const data = await response.json()
      
      if (data.success) {
        setPayments(data.data.payments)
        setCoinPurchases(data.data.coinPurchases)
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
        <p className="text-gray-500">Manage your payments and coin purchases</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Spent</p>
                <p className="text-xl font-bold">{summary?.totalSpent.toLocaleString() || 0} ETB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-amber-600" />
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
                <Coins className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Coins Bought</p>
                <p className="text-xl font-bold">{summary?.totalCoinsBought || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Coins Spent</p>
                <p className="text-xl font-bold">{summary?.totalCoinsSpent || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={activeTab === 'payments' ? 'default' : 'outline'}
          onClick={() => setActiveTab('payments')}
          className={activeTab === 'payments' ? 'bg-amber-500 hover:bg-amber-600' : ''}
        >
          <DollarSign className="h-4 w-4 mr-2" />
          Payments
        </Button>
        <Button
          variant={activeTab === 'coins' ? 'default' : 'outline'}
          onClick={() => setActiveTab('coins')}
          className={activeTab === 'coins' ? 'bg-amber-500 hover:bg-amber-600' : ''}
        >
          <Coins className="h-4 w-4 mr-2" />
          Coin Purchases
        </Button>
      </div>

      {/* Payments Table */}
      {activeTab === 'payments' && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No payments yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Invoice</th>
                      <th className="text-left py-3 px-2">Gig</th>
                      <th className="text-left py-3 px-2">Freelancer</th>
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
                          {payment.freelancer?.full_name || 'Unknown'}
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
                          {formatDate(payment.created_at)}
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
      )}

      {/* Coin Purchases Table */}
      {activeTab === 'coins' && (
        <Card>
          <CardHeader>
            <CardTitle>Coin Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            {coinPurchases.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No coin purchases yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Package</th>
                      <th className="text-left py-3 px-2">Coins</th>
                      <th className="text-left py-3 px-2">Amount</th>
                      <th className="text-left py-3 px-2">Status</th>
                      <th className="text-left py-3 px-2">Date</th>
                      <th className="text-left py-3 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coinPurchases.map((purchase) => (
                      <tr key={purchase.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2 capitalize">{purchase.package_id}</td>
                        <td className="py-3 px-2 font-medium">+{purchase.coins_purchased}</td>
                        <td className="py-3 px-2">{purchase.amount_paid_etb} ETB</td>
                        <td className="py-3 px-2">
                          <Badge className={getStatusColor(purchase.status)}>
                            {purchase.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-gray-500">
                          {formatDate(purchase.created_at)}
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
      )}
    </div>
  )
}