"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TelegramLinkPanel } from '@/components/telegram/telegram-link-panel';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { uploadProfilePicture, removeProfilePicture } from '@/lib/actions/profile-picture';
import { Camera, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-zinc-500 text-sm">Manage your account settings and set e-mail preferences.</p>
      </div>
      <Separator />
      <div className="flex flex-col md:flex-row gap-6">
        <nav className="flex flex-row md:flex-col w-full md:w-1/5 gap-2 overflow-x-auto">
          <Button variant={activeTab === 'profile' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('profile')} className="justify-start flex-1 md:flex-none">Profile</Button>
          <Button variant={activeTab === 'notifications' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('notifications')} className="justify-start flex-1 md:flex-none">Notifications</Button>
          <Button variant={activeTab === 'telegram' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('telegram')} className="justify-start flex-1 md:flex-none">Telegram</Button>
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

interface Profile {
  full_name?: string;
  bio?: string;
  avatar_url?: string;
}

function ProfileForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userEmail, setUserEmail] = useState('');
  const supabase = createClient();

  const loadProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in first');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile');
      } else {
        setProfile(data);
        setUserEmail(user.email || '');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

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


  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in first');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile?.full_name,
          bio: profile?.bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        toast.error('Failed to update profile');
        console.error('Update error:', error);
      } else {
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          value={profile?.full_name || ''}
          onChange={(e) => setProfile(prev => ({ ...(prev as Profile), full_name: e.target.value }))}
          placeholder="Enter your full name"
        />
        <p className="text-xs text-zinc-500">This is your public display name. It can be your real name or a pseudonym.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={userEmail} disabled />
        <p className="text-xs text-zinc-500">You can manage verified email addresses in your email settings.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={profile?.bio || ''}
          onChange={(e) => setProfile(prev => ({ ...(prev as Profile), bio: e.target.value }))}
          placeholder="Tell us about yourself..."
          rows={4}
        />
        <p className="text-xs text-zinc-500">You can @mention other users and organizations to link to them.</p>
      </div>
      <div className="space-y-2">
        <Label>Profile Picture</Label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={previewUrl || profile?.avatar_url || ''} />
            <AvatarFallback className="text-lg">{profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
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
        <p className="text-xs text-zinc-500 mt-2">Upload a JPEG, PNG, or WebP image. Max size: 5MB</p>
        {previewUrl && (
          <p className="text-xs text-amber-600 mt-1">Preview: Click &quot;Confirm Upload&quot; to save this image</p>
        )}
      </div>
      <Button onClick={handleSave} disabled={saving} className="cursor-pointer w-full sm:w-auto">
        {saving ? 'Saving...' : 'Update Profile'}
      </Button>
    </div>
  );
}

function NotificationsForm() {
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    newGigs: true,
    applicationStatus: true,
    messages: false,
    marketing: false
  })

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Email Notifications</h3>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-0.5">
              <Label className="text-base">Application Status Updates</Label>
              <p className="text-sm text-muted-foreground">Get notified when your application status changes</p>
            </div>
            <Switch 
              checked={notifications.applicationStatus} 
              onCheckedChange={(checked) => setNotifications({...notifications, applicationStatus: checked})}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-0.5">
              <Label className="text-base">New Gig Recommendations</Label>
              <p className="text-sm text-muted-foreground">Receive emails about new gigs matching your skills</p>
            </div>
            <Switch 
              checked={notifications.newGigs} 
              onCheckedChange={(checked) => setNotifications({...notifications, newGigs: checked})}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-0.5">
              <Label className="text-base">Messages</Label>
              <p className="text-sm text-muted-foreground">Get notified when you receive new messages</p>
            </div>
            <Switch 
              checked={notifications.messages} 
              onCheckedChange={(checked) => setNotifications({...notifications, messages: checked})}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-0.5">
              <Label className="text-base">Marketing & Promotions</Label>
              <p className="text-sm text-muted-foreground">Receive updates about new features and promotions</p>
            </div>
            <Switch 
              checked={notifications.marketing} 
              onCheckedChange={(checked) => setNotifications({...notifications, marketing: checked})}
            />
          </div>
        </div>
      </div>
      
      <Button className="w-full sm:w-auto">Save Notification Preferences</Button>
    </div>
  );
}
