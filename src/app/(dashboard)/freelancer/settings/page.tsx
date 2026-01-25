"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [userEmail, setUserEmail] = useState('');
  const supabase = createClient();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
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
          full_name: profile.full_name,
          bio: profile.bio,
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
          onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
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
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          placeholder="Tell us about yourself..."
          rows={4}
        />
        <p className="text-xs text-zinc-500">You can @mention other users and organizations to link to them.</p>
      </div>
      <div className="space-y-2">
        <Label>Profile Picture</Label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback>{profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <Button variant="outline" className="cursor-pointer">Upload Image</Button>
        </div>
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
