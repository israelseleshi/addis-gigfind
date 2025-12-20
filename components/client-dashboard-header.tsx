"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ClientDashboardHeader() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear any user session/token here
    localStorage.removeItem('authToken'); // Adjust based on your auth implementation
    // Redirect to login page
    router.push('/login');
  };

  return (
    <header className="flex items-center justify-between p-4 border-b">
      <h1 className="text-2xl font-bold">Client Dashboard</h1>
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src="/placeholder-user.jpg" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <Button variant="outline" onClick={handleLogout} className="cursor-pointer">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}
