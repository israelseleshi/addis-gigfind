
"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Users, Briefcase, Shield, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGigs: 0,
    totalApplications: 0,
    pendingVerifications: 0,
    openGigs: 0,
    completedGigs: 0,
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const supabase = createClient()
      
      const [users, gigs, applications, verifications] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('gigs').select('id', { count: 'exact' }),
        supabase.from('applications').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('verification_status', 'pending'),
      ])

      const { data: gigData } = await supabase
        .from('gigs')
        .select('status')

      const statusCounts = gigData?.reduce((acc: Record<string, number>, g: any) => {
        acc[g.status] = (acc[g.status] || 0) + 1
        return acc
      }, {}) || {}

      setStats({
        totalUsers: users.count || 0,
        totalGigs: gigs.count || 0,
        totalApplications: applications.count || 0,
        pendingVerifications: verifications.count || 0,
        openGigs: statusCounts['open'] || 0,
        completedGigs: statusCounts['completed'] || 0,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Gigs</CardTitle>
            <Briefcase className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalGigs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending Verifications</CardTitle>
            <Shield className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingVerifications}</div>
            {stats.pendingVerifications > 0 && (
              <Link href="/admin/verifications" className="text-sm text-amber-600 hover:underline">
                Review now →
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Open Gigs</CardTitle>
            <CheckCircle className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.openGigs}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link href="/admin/verifications">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-full">
                  <Shield className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-medium">Verification Requests</h3>
                  <p className="text-sm text-gray-500">
                    {stats.pendingVerifications} pending reviews
                  </p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link href="/admin/users">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Manage Users</h3>
                  <p className="text-sm text-gray-500">
                    View and manage all users
                  </p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link href="/admin/gigs">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Briefcase className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Manage Gigs</h3>
                  <p className="text-sm text-gray-500">
                    Moderate all gigs
                  </p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  )
}
