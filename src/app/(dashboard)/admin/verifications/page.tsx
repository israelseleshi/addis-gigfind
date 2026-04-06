"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Check, X, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { adminApproveVerification, adminRejectVerification, getPendingVerifications, getAllVerifications } from '@/lib/actions/verification'

interface VerificationDocument {
  id: string;
  user_id: string;
  document_type: string;
  id_number: string;
  front_image_url: string;
  back_image_url?: string;
  description?: string;
  status: string;
  admin_notes?: string;
  submitted_at: string;
  approved_at?: string;
  rejected_at?: string;
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export default function AdminVerificationsPage() {
  const [loading, setLoading] = useState(true)
  const [pendingVerifications, setPendingVerifications] = useState<VerificationDocument[]>([])
  const [allVerifications, setAllVerifications] = useState<VerificationDocument[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  useEffect(() => {
    loadVerifications()
  }, [])

  const loadVerifications = async () => {
    try {
      const pendingResult = await getPendingVerifications()
      const allResult = await getAllVerifications()

      setPendingVerifications(pendingResult.documents || [])
      setAllVerifications(allResult.documents || [])
    } catch (error) {
      console.error('Error loading verifications:', error)
      toast.error('Failed to load verifications')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (documentId: string) => {
    try {
      const result = await adminApproveVerification(documentId)
      if (result.error) {
        toast.error(String(result.error))
      } else {
        toast.success('Verification approved!')
        loadVerifications()
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('An error occurred')
    }
  }

  const handleReject = async (documentId: string, reason: string) => {
    try {
      const result = await adminRejectVerification(documentId, reason)
      if (result.error) {
        toast.error(String(result.error))
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

  const renderThumbnail = (url?: string) => {
    if (!url) return <span className="text-xs text-gray-400">—</span>
    return (
      <Image
        src={url}
        alt="Document"
        width={64}
        height={40}
        unoptimized
        className="h-10 w-16 cursor-pointer rounded border object-cover"
        onClick={() => window.open(url, '_blank')}
      />
    )
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Verification Management</h1>
      </div>

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
              {allVerifications.filter(v => v.status === 'verified').length}
            </div>
            <p className="text-sm text-gray-500">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-500">
              {allVerifications.filter(v => v.status === 'rejected').length}
            </div>
            <p className="text-sm text-gray-500">Rejected</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'table')}>
          <TabsList>
            <TabsTrigger value="grid">Grid</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingVerifications.length})</TabsTrigger>
          <TabsTrigger value="all">All Records</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {pendingVerifications.length === 0 ? (
            <Card className="max-w-lg mx-auto">
              <CardContent className="pt-6 text-center">
                <Check className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">All Caught Up!</h3>
                <p className="text-gray-500">No pending verifications</p>
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {pendingVerifications.map((doc) => (
                <Card key={doc.id} className="h-full">
                  <CardContent className="flex h-full flex-col pt-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={doc.profiles.avatar_url || ''} />
                          <AvatarFallback>{doc.profiles.full_name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="ml-4 flex-1">
                          {getStatusBadge(doc.status)}
                          <h3 className="mt-2 font-medium">{doc.profiles.full_name}</h3>
                          <p className="text-sm text-gray-500">ID: {doc.id_number}</p>
                          <p className="text-sm text-gray-500">Type: {doc.document_type.replace('_', ' ').toUpperCase()}</p>
                        </div>
                      </div>
                    </div>

                    {doc.description && (
                      <div className="mt-4 rounded-lg bg-gray-50 p-3">
                        <p className="text-sm text-gray-600">{doc.description}</p>
                      </div>
                    )}

                    {/* Document Images */}
                    <div
                      className={`mt-4 grid gap-4 ${doc.back_image_url ? 'grid-cols-2' : 'grid-cols-1'}`}
                    >
                      <div>
                        <p className="text-sm font-medium mb-2">Front Image</p>
                        <Image
                          src={doc.front_image_url}
                          alt="Front ID"
                          width={600}
                          height={200}
                          unoptimized
                          className="h-32 w-full cursor-pointer rounded border object-cover"
                          onClick={() => window.open(doc.front_image_url, '_blank')}
                        />
                      </div>
                      {doc.back_image_url && (
                        <div>
                          <p className="text-sm font-medium mb-2">Back Image</p>
                          <Image
                            src={doc.back_image_url}
                            alt="Back ID"
                            width={600}
                            height={200}
                            unoptimized
                            className="h-32 w-full cursor-pointer rounded border object-cover"
                            onClick={() => window.open(doc.back_image_url, '_blank')}
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => handleApprove(doc.id)}>
                        <Check className="mr-1 h-4 w-4" />Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleReject(doc.id, 'Documents not clear')}
                      >
                        <X className="mr-1 h-4 w-4" />Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>ID Type</TableHead>
                      <TableHead>ID Number</TableHead>
                      <TableHead>Front</TableHead>
                      <TableHead>Back</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingVerifications.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={doc.profiles.avatar_url || ''} />
                              <AvatarFallback>{doc.profiles.full_name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="truncate font-medium">{doc.profiles.full_name}</div>
                              
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{doc.document_type.replace('_', ' ').toUpperCase()}</TableCell>
                        <TableCell>{doc.id_number}</TableCell>
                        <TableCell>{renderThumbnail(doc.front_image_url)}</TableCell>
                        <TableCell>{renderThumbnail(doc.back_image_url)}</TableCell>
                        <TableCell>{new Date(doc.submitted_at).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600"
                              onClick={() => handleApprove(doc.id)}
                            >
                              <Check className="mr-1 h-4 w-4" />Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => handleReject(doc.id, 'Documents not clear')}
                            >
                              <X className="mr-1 h-4 w-4" />Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          {allVerifications.length === 0 ? (
            <Card className="max-w-lg mx-auto">
              <CardContent className="pt-6 text-center">
                <Eye className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No verification history</h3>
                <p className="text-gray-500">Records will appear here once users submit verification documents.</p>
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {allVerifications.map((doc) => (
                <Card key={doc.id} className="h-full">
                  <CardContent className="flex h-full flex-col justify-between pt-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={doc.profiles.avatar_url || ''} />
                          <AvatarFallback>{doc.profiles.full_name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="ml-4 flex-1">
                          {getStatusBadge(doc.status)}
                          <h3 className="mt-2 font-medium">{doc.profiles.full_name}</h3>
                          <p className="text-sm text-gray-500">Submitted: {new Date(doc.submitted_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    {doc.document_type && (
                      <p className="mt-4 text-sm text-gray-500">ID Type: {doc.document_type.replace('_', ' ').toUpperCase()}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>ID Type</TableHead>
                      <TableHead>ID Number</TableHead>
                      <TableHead>Front</TableHead>
                      <TableHead>Back</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allVerifications.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={doc.profiles.avatar_url || ''} />
                              <AvatarFallback>{doc.profiles.full_name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="truncate font-medium">{doc.profiles.full_name}</div>
                              
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{doc.document_type.replace('_', ' ').toUpperCase()}</TableCell>
                        <TableCell>{doc.id_number}</TableCell>
                        <TableCell>{renderThumbnail(doc.front_image_url)}</TableCell>
                        <TableCell>{renderThumbnail(doc.back_image_url)}</TableCell>
                        <TableCell>{new Date(doc.submitted_at).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
