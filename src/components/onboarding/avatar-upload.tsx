'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { uploadAvatar } from '@/lib/actions/profile'

interface AvatarUploadProps {
  onUploadComplete: (url: string) => void
  initialUrl?: string
}

export function AvatarUpload({ onUploadComplete, initialUrl }: AvatarUploadProps) {
  const [preview, setPreview] = React.useState<string | null>(initialUrl || null)
  const [isUploading, setIsUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File size must be less than 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const result = await uploadAvatar(formData)
      if (result.error) {
        toast.error(result.error)
        setPreview(initialUrl || null) // Revert on error
      } else if (result.url) {
        toast.success('Avatar uploaded successfully.')
        onUploadComplete(result.url)
      }
    } catch {
      toast.error('An unexpected error occurred.')
      setPreview(initialUrl || null)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src={preview || ''} alt="User avatar" />
        <AvatarFallback>AV</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-2">
        <Button 
          type="button" 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Avatar'}
        </Button>
        <Input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/png, image/jpeg, image/jpg"
          onChange={handleFileChange}
        />
        <p className="text-xs text-zinc-500">PNG, JPG up to 5MB.</p>
      </div>
    </div>
  )
}
