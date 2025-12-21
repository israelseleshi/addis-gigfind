"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ClientSignUpPage from "../register/client/page"
import FreelancerSignUpPage from "../register/freelancer/page"

export default function SignUpPage() {
  return (
    <div className="container mx-auto py-12 flex items-center justify-center">
      <Card className="w-full max-w-4xl">
        <CardContent className="p-6">
          <Tabs defaultValue="client">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="client" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold">Sign up as Client</TabsTrigger>
              <TabsTrigger value="freelancer" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white font-bold">Sign up as Freelancer</TabsTrigger>
            </TabsList>
            <TabsContent value="client">
              <ClientSignUpPage />
            </TabsContent>
            <TabsContent value="freelancer">
              <FreelancerSignUpPage />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
