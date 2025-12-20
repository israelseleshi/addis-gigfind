"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" defaultValue="Abebe Kebede" />
        <p className="text-xs text-gray-500">This is your public display name. It can be your real name or a pseudonym.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" defaultValue="abebe@addisbusiness.et" />
        <p className="text-xs text-gray-500">You can manage verified email addresses in your email settings.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" defaultValue="I am a freelance software developer with over 5 years of experience." />
        <p className="text-xs text-gray-500">You can @mention other users and organizations to link to them.</p>
      </div>
      <div className="space-y-2">
        <Label>Profile Picture</Label>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback>AK</AvatarFallback>
          </Avatar>
          <Button variant="outline" className="cursor-pointer">Upload Image</Button>
        </div>
      </div>
      <Button className="cursor-pointer">Update Profile</Button>
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
      <Button className="cursor-pointer">Update Notifications</Button>
    </div>
  );
}
