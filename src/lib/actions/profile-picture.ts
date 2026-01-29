"use server"

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadProfilePicture(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    const file = formData.get('file') as File
    if (!file) {
      return { error: 'No file selected' }
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return { error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.' }
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return { error: 'File size must be less than 5MB' }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('profile_pictures')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { error: 'Failed to upload image' }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile_pictures')
      .getPublicUrl(fileName)

    // Update user's profile with new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      // Try to delete the uploaded file if profile update fails
      await supabase.storage
        .from('profile_pictures')
        .remove([fileName])
      return { error: 'Failed to update profile' }
    }

    revalidatePath('/dashboard/settings')
    revalidatePath('/client/dashboard')
    revalidatePath('/freelancer/dashboard')
    
    return { success: true, avatarUrl: publicUrl }
  } catch (error) {
    console.error('Profile picture upload error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function removeProfilePicture() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    // Get current avatar URL
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single()

    if (!profile?.avatar_url) {
      return { error: 'No profile picture to remove' }
    }

    // Extract file path from URL
    const url = new URL(profile.avatar_url)
    const filePath = url.pathname.split('/profile_pictures/')[1]

    if (filePath) {
      // Delete file from storage
      const { error: deleteError } = await supabase.storage
        .from('profile_pictures')
        .remove([filePath])

      if (deleteError) {
        console.error('Delete error:', deleteError)
        return { error: 'Failed to delete profile picture' }
      }
    }

    // Update profile to remove avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return { error: 'Failed to update profile' }
    }

    revalidatePath('/dashboard/settings')
    revalidatePath('/client/dashboard')
    revalidatePath('/freelancer/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Profile picture removal error:', error)
    return { error: 'An unexpected error occurred' }
  }
}
