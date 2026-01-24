import { ClientSignUpForm } from "@/components/auth/client-signup-form";
import { FreelancerSignUpForm } from "@/components/auth/freelancer-signup-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center py-12">
      <div className="mx-auto grid w-[450px] gap-6">
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
    </div>
  );
}
