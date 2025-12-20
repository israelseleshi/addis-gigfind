"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardHeader from '@/components/dashboard-header';

const freelancerNavLinks = [
  { href: "/freelancer/dashboard", label: "Overview" },
  { href: "/freelancer/find-work", label: "Find Work" },
  { href: "/freelancer/my-jobs", label: "My Jobs" },
  { href: "/freelancer/messages", label: "Messages" },
  { href: "/freelancer/settings", label: "Profile & Identity" },
];

export default function FreelancerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleTabChange = (value: string) => {
    router.push(value);
  };

  return (
    <div>
      <DashboardHeader />
      <div className="p-6">
        <div className="flex justify-center">
          <Tabs value={pathname} onValueChange={handleTabChange}>
            <TabsList>
              {freelancerNavLinks.map((link) => (
                <TabsTrigger key={link.href} value={link.href} className="cursor-pointer">
                  {link.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
