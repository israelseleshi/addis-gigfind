"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TelegramLinkPanel } from '@/components/telegram/telegram-link-panel';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { uploadProfilePicture, removeProfilePicture } from '@/lib/actions/profile-picture';
import { Camera, Trash2 } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  phone: string;
  avatar_url: string;
  role: string;
  created_at: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-gray-500">Manage your account settings and set e-mail preferences.</p>
      </div>
      <Separator />
      <div className="flex flex-col md:flex-row gap-6">
        <nav className="flex flex-col w-full md:w-1/5">
          <Button variant={activeTab === 'profile' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('profile')} className="justify-start">Profile</Button>
          <Button variant={activeTab === 'notifications' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('notifications')} className="justify-start">Notifications</Button>
          <Button variant={activeTab === 'telegram' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('telegram')} className="justify-start">Telegram</Button>
        </nav>
        <div className="flex-1">
          {activeTab === 'profile' && <ProfileForm />}
          {activeTab === 'notifications' && <NotificationsForm />}
          {activeTab === 'telegram' && <TelegramLinkPanel />}
        </div>
      </div>
    </div>
  );
}

function ProfileForm() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Get email from auth.users (correct way)
        setUserEmail(user.email || 'Not set');

        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          setProfile(data);
          setFormData({
            full_name: data.full_name || '',
            phone: data.phone_number || '',
          });
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            phone_number: formData.phone,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (error) throw error;
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const result = await uploadProfilePicture(formData);
      
      if (result.error) {
        toast.error(result.error);
        setPreviewUrl(null);
      } else {
        toast.success('Profile picture updated successfully!');
        setPreviewUrl(null);
        // Reload profile to get new avatar URL
        await loadProfile();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload profile picture');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCancelPreview = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePicture = async () => {
    setUploading(true);
    try {
      const result = await removeProfilePicture();
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Profile picture removed successfully!');
        // Reload profile to update UI
        await loadProfile();
      }
    } catch (error) {
      console.error('Remove error:', error);
      toast.error('Failed to remove profile picture');
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name</Label>
        <Input 
          id="full_name" 
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          placeholder="Enter your full name"
        />
        <p className="text-xs text-gray-500">This is your public display name.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input 
          id="phone" 
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+251..."
        />
        <p className="text-xs text-gray-500">Your phone number for contact purposes.</p>
      </div>
      <div className="space-y-2">
        <Label>Profile Picture</Label>
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={previewUrl || profile?.avatar_url || undefined} />
            <AvatarFallback className="text-lg">{profile?.full_name ? getInitials(profile.full_name) : 'CU'}</AvatarFallback>
          </Avatar>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileUpload}
              className="hidden"
            />
            {previewUrl ? (
              <>
                <Button 
                  variant="default" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="cursor-pointer bg-green-500 hover:bg-green-600"
                >
                  {uploading ? 'Uploading...' : 'Confirm Upload'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancelPreview}
                  disabled={uploading}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="cursor-pointer"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
                {profile?.avatar_url && (
                  <Button 
                    variant="outline" 
                    onClick={handleRemovePicture}
                    disabled={uploading}
                    className="cursor-pointer text-red-600 hover:text-red-700 border-red-200"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Upload a JPEG, PNG, or WebP image. Max size: 5MB</p>
        {previewUrl && (
          <p className="text-xs text-amber-600 mt-1">Preview: Click &quot;Confirm Upload&quot; to save this image</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Account Info</Label>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <p className="text-sm"><span className="font-medium">Email:</span> {userEmail}</p>
          <p className="text-sm"><span className="font-medium">Role:</span> {profile?.role || 'client'}</p>
          <p className="text-sm"><span className="font-medium">Member since:</span> {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}</p>
        </div>
      </div>
      <Button onClick={handleSave} disabled={saving} className="cursor-pointer">
        {saving ? 'Saving...' : 'Update Profile'}
      </Button>
    </div>
  );
}

function NotificationsForm() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notifications</h3>
        <p className="text-sm text-gray-500">Configure how you receive notifications.</p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <p className="text-xs text-gray-500">Receive notifications via email.</p>
          </div>
          <Switch id="email-notifications" defaultChecked />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <Label htmlFor="push-notifications">Push Notifications</Label>
            <p className="text-xs text-gray-500">Receive push notifications on your devices.</p>
          </div>
          <Switch id="push-notifications" />
        </div>
      </div>
      <Button onClick={() => toast.success('Notification settings updated!')} className="cursor-pointer">Update Notifications</Button>
    </div>
  );
}
