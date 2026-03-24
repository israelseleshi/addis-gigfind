
"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { Search, Ban, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  is_banned: boolean;
  verification_status: string;
}

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading users:', error)
      } else {
        setUsers(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBan = async (userId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: true, ban_reason: 'Admin action' })
        .eq('id', userId)

      if (error) {
        toast.error('Failed to ban user')
      } else {
        toast.success('User banned')
        loadUsers()
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('An error occurred')
    }
  }

  const handleUnban = async (userId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: false, ban_reason: null })
        .eq('id', userId)

      if (error) {
        toast.error('Failed to unban user')
      } else {
        toast.success('User unbanned')
        loadUsers()
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('An error occurred')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'banned' && user.is_banned) ||
      (statusFilter === 'verified' && user.verification_status === 'verified') ||
      (statusFilter === 'unverified' && user.verification_status === 'unverified')
    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-500',
      client: 'bg-blue-500',
      freelancer: 'bg-green-500',
      regulator: 'bg-amber-500',
    }
    return <Badge className={colors[role] || 'bg-gray-500'}>{role}</Badge>
  }

  const getStatusBadge = (user: UserProfile) => {
    if (user.is_banned) {
      return <Badge className="bg-red-500">Banned</Badge>
    }
    if (user.verification_status === 'verified') {
      return <Badge className="bg-green-500">Verified</Badge>
    }
    return <Badge className="bg-gray-500">{user.verification_status}</Badge>
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">User Management</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-sm text-gray-500">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-500">
              {users.filter(u => u.role === 'client').length}
            </div>
            <p className="text-sm text-gray-500">Clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-500">
              {users.filter(u => u.role === 'freelancer').length}
            </div>
            <p className="text-sm text-gray-500">Freelancers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-500">
              {users.filter(u => u.is_banned).length}
            </div>
            <p className="text-sm text-gray-500">Banned</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="client">Client</SelectItem>
            <SelectItem value="freelancer">Freelancer</SelectItem>
            <SelectItem value="regulator">Regulator</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar_url || ''} />
                    <AvatarFallback>{user.full_name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{user.full_name}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getRoleBadge(user.role)}
                  {getStatusBadge(user)}
                  <div className="flex gap-2">
                    {user.is_banned ? (
                      <Button variant="outline" size="sm" onClick={() => handleUnban(user.id)}>
                        <CheckCircle className="h-4 w-4 mr-1" />Unban
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleBan(user.id)}>
                        <Ban className="h-4 w-4 mr-1" />Ban
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
