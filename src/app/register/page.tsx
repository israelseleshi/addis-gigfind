import { ClientSignUpForm } from "@/components/auth/client-signup-form";
import { FreelancerSignUpForm } from "@/components/auth/freelancer-signup-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Footer } from '@/components/footer';

export default function RegisterPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto w-full max-w-md gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Sign Up</h1>
            <p className="text-balance text-zinc-500">
              Choose your role and start your journey with Addis GigFind.
            </p>
          </div>
          <Tabs defaultValue="client" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="client">I&apos;m a Client</TabsTrigger>
              <TabsTrigger value="freelancer">I&apos;m a Freelancer</TabsTrigger>
              
            </TabsList>
            <TabsContent value="client">
              <ClientSignUpForm />
            </TabsContent>
            <TabsContent value="freelancer">
              <FreelancerSignUpForm />
            </TabsContent>
            
          </Tabs>
        </div>
      </main>
      
      {/* Footer at bottom */}
      <Footer />
    </div>
  );
}
