"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface Profile {
  id: string;
  full_name: string;
  email: string;
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
        </nav>
        <div className="flex-1">
          {activeTab === 'profile' && <ProfileForm />}
          {activeTab === 'notifications' && <NotificationsForm />}
        </div>
      </div>
    </div>
  );
}

function ProfileForm() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          setProfile(data);
          setFormData({
            full_name: data.full_name || '',
            phone: data.phone || '',
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
            phone: formData.phone,
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

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

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
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback>{profile?.full_name ? getInitials(profile.full_name) : 'CU'}</AvatarFallback>
          </Avatar>
          <Button variant="outline" className="cursor-pointer">Upload Image</Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Account Info</Label>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <p className="text-sm"><span className="font-medium">Email:</span> {profile?.email || 'Not set'}</p>
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
