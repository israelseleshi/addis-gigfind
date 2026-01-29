'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const verificationSchema = z.object({
  documentType: z.enum(['kebele', 'passport', 'driver_license']),
  idNumber: z.string().min(1, 'ID number is required'),
  frontImage: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024, // 5MB limit
    'File size must be less than 5MB'
  ),
  backImage: z.instanceof(File).optional().refine(
    (file) => !file || file.size <= 5 * 1024 * 1024, // 5MB limit
    'File size must be less than 5MB'
  ),
  description: z.string().optional(),
})

export async function uploadVerificationDocument(values: z.infer<typeof verificationSchema>) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    console.error('Auth error:', authError)
    return { error: "Not authenticated. Please log in again." }
  }
  
  console.log('User authenticated:', user.id)
  
  // Validate the input
  const validated = verificationSchema.parse(values)
  
  // Check if already has pending verification
  const { data: existing } = await supabase
    .from('verification_documents')
    .select('id, status')
    .eq('user_id', user.id)
    .in('status', ['pending', 'verified'])
    .single()
  
  if (existing?.status === 'pending') {
    return { error: "You already have a pending verification" }
  }
  
  if (existing?.status === 'verified') {
    return { error: "You are already verified" }
  }
  
  try {
    // Upload front image
    const frontFileName = `${user.id}/verification/front-${Date.now()}`
    const { error: uploadError } = await supabase.storage
      .from('verification-docs')
      .upload(frontFileName, validated.frontImage)
    
    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { error: "Failed to upload front image: " + uploadError.message }
    }
    
    let backFileUrl: string | null = null
    if (validated.backImage) {
      const backFileName = `${user.id}/verification/back-${Date.now()}`
      const { error: backUploadError } = await supabase.storage
        .from('verification-docs')
        .upload(backFileName, validated.backImage)
      
      if (!backUploadError) {
        // Generate signed URL for back image (valid for 1 hour)
        const { data: backSignedUrl } = await supabase.storage
          .from('verification-docs')
          .createSignedUrl(backFileName, 3600)
        backFileUrl = backSignedUrl?.signedUrl || null
      }
    }
    
    // Generate signed URL for front image (valid for 1 hour)
    const { data: frontSignedUrl } = await supabase.storage
      .from('verification-docs')
      .createSignedUrl(frontFileName, 3600)
    
    // Create verification record
    const { error: insertError } = await supabase
      .from('verification_documents')
      .insert({
        user_id: user.id,
        document_type: validated.documentType,
        id_number: validated.idNumber,
        front_image_url: frontSignedUrl?.signedUrl || '',
        back_image_url: backFileUrl,
        description: validated.description,
        status: 'pending',
      })
    
    if (insertError) {
      console.error('Insert error:', insertError)
      return { error: "Failed to save verification record: " + insertError.message }
    }
    
    // Update profile status
    await supabase
      .from('profiles')
      .update({ verification_status: 'pending' })
      .eq('id', user.id)
    
    revalidatePath('/freelancer/kyc')
    revalidatePath('/profile')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function getVerificationStatus(userId: string) {
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('verification_status')
    .eq('id', userId)
    .single()
  
  const { data: document } = await supabase
    .from('verification_documents')
    .select('*')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .single()
  
  // Generate fresh signed URLs for images if document exists
  let updatedDocument = document
  if (document) {
    // Extract filename from the URL path
    const frontPath = document.front_image_url?.split('/storage/v1/object/public/verification-docs/')[1]
    const backPath = document.back_image_url?.split('/storage/v1/object/public/verification-docs/')[1]
    
    if (frontPath) {
      const { data: frontSignedUrl } = await supabase.storage
        .from('verification-docs')
        .createSignedUrl(frontPath, 3600)
      if (frontSignedUrl) {
        updatedDocument = { ...updatedDocument, front_image_url: frontSignedUrl.signedUrl }
      }
    }
    
    if (backPath) {
      const { data: backSignedUrl } = await supabase.storage
        .from('verification-docs')
        .createSignedUrl(backPath, 3600)
      if (backSignedUrl) {
        updatedDocument = { ...updatedDocument, back_image_url: backSignedUrl.signedUrl }
      }
    }
  }
  
  return {
    status: profile?.verification_status || 'unverified',
    document: updatedDocument || null,
  }
}

export async function adminApproveVerification(documentId: string) {
  const supabase = await createClient()
  
  // Verify admin role
  const { data: { user } } = await supabase.auth.getUser()
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()
  
  if (adminProfile?.role !== 'admin') {
    return { error: "Not authorized" }
  }
  
  // Get document to find user
  const { data: document, error: docError } = await supabase
    .from('verification_documents')
    .select('user_id')
    .eq('id', documentId)
    .single()
  
  if (docError || !document) {
    console.error('Error finding verification document:', docError)
    return { error: `Verification document not found: ${docError?.message ?? 'Unknown error'}` }
  }
  
  // Update document status
  const { error: updateError } = await supabase
    .from('verification_documents')
    .update({
      status: 'verified',
    })
    .eq('id', documentId)
  
  if (updateError) {
    console.error('Error updating verification document:', updateError)
    return { error: `Failed to update verification status: ${updateError.message}` }
  }
  
  // Update user profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ verification_status: 'verified' })
    .eq('id', document?.user_id)
  
  if (profileError) {
    console.error('Error updating user profile:', profileError)
    return { error: `Failed to update user verification status: ${profileError.message}` }
  }
  
  revalidatePath('/admin/verifications')
  return { success: true }
}

export async function adminRejectVerification(documentId: string, reason: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()
  
  if (adminProfile?.role !== 'admin') {
    return { error: "Not authorized" }
  }
  
  const { data: document, error: docError } = await supabase
    .from('verification_documents')
    .select('user_id')
    .eq('id', documentId)
    .single()
  
  if (docError || !document) {
    console.error('Error finding verification document:', docError)
    return { error: `Verification document not found: ${docError?.message ?? 'Unknown error'}` }
  }
  
  // Update document status
  const { error: updateError } = await supabase
    .from('verification_documents')
    .update({
      status: 'rejected',
      admin_notes: reason,
    })
    .eq('id', documentId)
  
  if (updateError) {
    console.error('Error updating verification document:', updateError)
    return { error: `Failed to update verification status: ${updateError.message}` }
  }
  
  // Update user profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ verification_status: 'rejected' })
    .eq('id', document?.user_id)
  
  if (profileError) {
    console.error('Error updating user profile:', profileError)
    return { error: `Failed to update user verification status: ${profileError.message}` }
  }
  
  revalidatePath('/admin/verifications')
  return { success: true }
}

export async function getPendingVerifications() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('verification_documents')
    .select(`
      *,
      profiles (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('status', 'pending')
    .order('submitted_at', { ascending: false })
  
  if (error) {
    return { error: error.message }
  }
  
  // Generate fresh signed URLs for images
  const documentsWithUrls = await Promise.all(
    (data || []).map(async (doc) => {
      const frontFileName = doc.front_image_url?.split('/').pop()?.split('?')[0]
      const backFileName = doc.back_image_url?.split('/').pop()?.split('?')[0]
      
      let frontImageUrl = doc.front_image_url
      let backImageUrl = doc.back_image_url
      
      if (frontFileName) {
        const { data: frontSignedUrl } = await supabase.storage
          .from('verification-docs')
          .createSignedUrl(frontFileName, 3600)
        if (frontSignedUrl) {
          frontImageUrl = frontSignedUrl.signedUrl
        }
      }
      
      if (backFileName) {
        const { data: backSignedUrl } = await supabase.storage
          .from('verification-docs')
          .createSignedUrl(backFileName, 3600)
        if (backSignedUrl) {
          backImageUrl = backSignedUrl.signedUrl
        }
      }
      
      return {
        ...doc,
        front_image_url: frontImageUrl,
        back_image_url: backImageUrl,
      }
    })
  )
  
  return { documents: documentsWithUrls }
}

export async function getAllVerifications() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('verification_documents')
    .select(`
      *,
      profiles (
        id,
        full_name,
        avatar_url
      )
    `)
    .in('status', ['pending', 'verified', 'rejected'])
    .order('submitted_at', { ascending: false })
    .limit(50)
  
  if (error) {
    return { error: error.message }
  }
  
  // Generate fresh signed URLs for images
  const documentsWithUrls = await Promise.all(
    (data || []).map(async (doc) => {
      const frontFileName = doc.front_image_url?.split('/').pop()?.split('?')[0]
      const backFileName = doc.back_image_url?.split('/').pop()?.split('?')[0]
      
      let frontImageUrl = doc.front_image_url
      let backImageUrl = doc.back_image_url
      
      if (frontFileName) {
        const { data: frontSignedUrl } = await supabase.storage
          .from('verification-docs')
          .createSignedUrl(frontFileName, 3600)
        if (frontSignedUrl) {
          frontImageUrl = frontSignedUrl.signedUrl
        }
      }
      
      if (backFileName) {
        const { data: backSignedUrl } = await supabase.storage
          .from('verification-docs')
          .createSignedUrl(backFileName, 3600)
        if (backSignedUrl) {
          backImageUrl = backSignedUrl.signedUrl
        }
      }
      
      return {
        ...doc,
        front_image_url: frontImageUrl,
        back_image_url: backImageUrl,
      }
    })
  )
  
  return { documents: documentsWithUrls }
}
