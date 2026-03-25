'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { Settings, Mail, Phone, MapPin, Calendar, Shield, Building } from 'lucide-react'

interface Profile {
  id: string
  full_name: string
  avatar_url: string | null
  phone_number: string | null
  role: string
  verification_status: string
  created_at: string
}

interface ClientProfile {
  company_name: string | null
  industry: string | null
  website: string | null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return
      }

      // Get email from auth.users
      setUserEmail(user.email || 'Not set')

      // Get profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
      }

      // Get client-specific profile data
      const { data: clientData } = await supabase
        .from('client_profiles')
        .select('company_name, industry, website')
        .eq('id', user.id)
        .single()

      if (clientData) {
        setClientProfile(clientData)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500">Verified</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>
      default:
        return <Badge className="bg-gray-500">Unverified</Badge>
    }
  }

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-600'
      case 'pending':
        return 'text-yellow-600'
      case 'rejected':
        return 'text-red-600'
      default:
        return 'text-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-40 w-full bg-gray-200 rounded-lg"></div>
          <div className="h-32 w-full bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">My Profile</h1>
        <Button asChild>
          <Link href="/client/settings">
            <Settings className="h-4 w-4 mr-2" />
            Edit Profile
          </Link>
        </Button>
      </div>

      {/* Main Profile Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="text-2xl sm:text-3xl">
                {profile?.full_name ? getInitials(profile.full_name) : 'CL'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 mb-2">
                <h2 className="text-xl sm:text-2xl font-bold">
                  {profile?.full_name || 'Unknown User'}
                </h2>
                {profile?.verification_status && getVerificationBadge(profile.verification_status)}
              </div>
              
              {clientProfile?.company_name && (
                <p className="text-gray-600 flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <Building className="h-4 w-4" />
                  {clientProfile.company_name}
                </p>
              )}
              
              <p className="text-sm text-gray-500 flex items-center justify-center sm:justify-start gap-2">
                <Shield className="h-4 w-4" />
                <span className={getVerificationColor(profile?.verification_status || 'unverified')}>
                  {profile?.verification_status === 'verified' ? 'Verified Client' : 'Client Account'}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Mail className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{userEmail}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Phone className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="font-medium">{profile?.phone_number || 'Not set'}</p>
            </div>
          </div>
          
          {clientProfile?.industry && (
            <>
              <Separator />
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Building className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Industry</p>
                  <p className="font-medium">{clientProfile.industry}</p>
                </div>
              </div>
            </>
          )}
          
          {clientProfile?.website && (
            <>
              <Separator />
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Website</p>
                  <a 
                    href={clientProfile.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-orange-600 hover:underline"
                  >
                    {clientProfile.website}
                  </a>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="font-medium">
                {profile?.created_at 
                  ? new Date(profile.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : 'Unknown'}
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Shield className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Account Type</p>
              <p className="font-medium capitalize">{profile?.role || 'client'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
