
"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { Check, X } from 'lucide-react'
import { toast } from 'sonner'

interface VerificationProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  verification_status: string;
  verification_data?: {
    national_id?: string;
    description?: string;
  };
}

export default function AdminVerificationsPage() {
  const [loading, setLoading] = useState(true)
  const [pendingVerifications, setPendingVerifications] = useState<VerificationProfile[]>([])
  const [allVerifications, setAllVerifications] = useState<VerificationProfile[]>([])

  useEffect(() => {
    loadVerifications()
  }, [])

  const loadVerifications = async () => {
    try {
      const supabase = createClient()

      const { data: pending } = await supabase
        .from('profiles')
        .select('*, verification_data')
        .eq('verification_status', 'pending')
        .order('created_at', { ascending: false })

      const { data: all } = await supabase
        .from('profiles')
        .select('*, verification_data')
        .in('verification_status', ['pending', 'verified', 'rejected'])
        .order('created_at', { ascending: false })
        .limit(50)

      setPendingVerifications(pending || [])
      setAllVerifications(all || [])
    } catch (error) {
      console.error('Error loading verifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (userId: string) => {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          verification_status: 'verified',
          verification_data: {
            ...allVerifications.find(v => v.id === userId)?.verification_data,
            approved_at: new Date().toISOString(),
          }
        })
        .eq('id', userId)

      if (error) {
        toast.error('Failed to approve verification')
      } else {
        toast.success('Verification approved!')
        loadVerifications()
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('An error occurred')
    }
  }

  const handleReject = async (userId: string, reason: string) => {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          verification_status: 'rejected',
          verification_data: {
            ...allVerifications.find(v => v.id === userId)?.verification_data,
            rejected_at: new Date().toISOString(),
            rejection_reason: reason,
          }
        })
        .eq('id', userId)

      if (error) {
        toast.error('Failed to reject verification')
      } else {
        toast.success('Verification rejected')
        loadVerifications()
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('An error occurred')
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-500',
      verified: 'bg-green-500',
      rejected: 'bg-red-500',
    }
    return <Badge className={colors[status] || 'bg-gray-500'}>{status}</Badge>
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Verification Management</h1>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-500">{pendingVerifications.length}</div>
            <p className="text-sm text-gray-500">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-500">
              {allVerifications.filter(v => v.verification_status === 'verified').length}
            </div>
            <p className="text-sm text-gray-500">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-500">
              {allVerifications.filter(v => v.verification_status === 'rejected').length}
            </div>
            <p className="text-sm text-gray-500">Rejected</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingVerifications.length})</TabsTrigger>
          <TabsTrigger value="all">All Records</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-4">
          {pendingVerifications.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Check className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">All Caught Up!</h3>
                <p className="text-gray-500">No pending verifications</p>
              </CardContent>
            </Card>
          ) : (
            pendingVerifications.map((user) => (
              <Card key={user.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar_url || ''} />
                        <AvatarFallback>{user.full_name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{user.full_name}</h3>
                        <p className="text-sm text-gray-500">{user.id}</p>
                        {user.verification_data?.national_id && (
                          <p className="text-sm text-gray-500">ID: {user.verification_data.national_id}</p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(user.verification_status)}
                  </div>

                  {user.verification_data?.description && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">{user.verification_data.description}</p>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => handleApprove(user.id)}>
                      <Check className="h-4 w-4 mr-1" />Approve
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleReject(user.id, 'Documents not clear')}>
                      <X className="h-4 w-4 mr-1" />Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4 mt-4">
          {allVerifications.map((user) => (
            <Card key={user.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url || ''} />
                      <AvatarFallback>{user.full_name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{user.full_name}</h3>
                      <p className="text-xs text-gray-500">{user.id}</p>
                    </div>
                  </div>
                  {getStatusBadge(user.verification_status)}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
