"use client";

import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, UserPlus, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const testimonials = [
  {
    quote: "This is a fantastic platform. I found the perfect freelancer for my project in just a few hours. Highly recommended!",
    name: "Abebe Kebede",
    title: "Client",
  },
  {
    quote: "As a freelancer, this platform has been a game-changer for me. I've been able to connect with great clients and work on exciting projects.",
    name: "Fatuma Mohammed",
    title: "Freelancer",
  },
  {
    quote: "The user interface is clean and easy to use. I was able to post a job and hire a freelancer in no time.",
    name: "Yonas Getachew",
    title: "Client",
  },
];

export default function Home() {
  return (
    <div className="w-full">
      <main className="relative z-10 flex min-h-screen flex-col items-start justify-center gap-6 px-4 text-left bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')"}}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />
        <div className="relative z-10">
        <div className="space-y-4">
          <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white [text-shadow:_0_4px_8px_rgb(0_0_0_/_40%)] sm:text-6xl md:text-7xl lg:text-8xl">
            Addis GigFind
          </h1>
          
          <p className="max-w-2xl text-xl font-light text-white/80 [text-shadow:_0_2px_4px_rgb(0_0_0_/_30%)] sm:text-2xl md:text-3xl">
            A Local Skills Marketplace
          </p>
        </div>
        
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 [text-shadow:_0_1px_2px_rgb(0_0_0_/_20%)] sm:text-lg md:text-xl">
          Connecting skilled professionals with clients in Addis Ababa. Discover talent, build relationships, and grow your business.
        </p>
              </div>
      </main>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <UserPlus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">1. Create Account</h3>
              <p className="text-foreground/60">Sign up as a client or freelancer to get started.</p>
            </div>
            <div className="space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">2. Find or Post Gigs</h3>
              <p className="text-foreground/60">Browse available gigs or post a job for freelancers to apply to.</p>
            </div>
            <div className="space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">3. Get to Work</h3>
              <p className="text-foreground/60">Collaborate, manage projects, and get paid securely.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">Featured Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {["Design", "Writing", "Plumbing", "Electrical", "Tutoring", "Marketing", "Development", "Photography"].map(category => (
              <Card key={category} className="p-6 text-center hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold">{category}</h3>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">What Our Users Say</h2>
          <InfiniteMovingCards
            items={testimonials}
            direction="right"
            speed="slow"
          />
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Dual CTA Section */}
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-bold mb-12">Join Our Community</h2>
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
                className="p-8 border rounded-lg"
              >
                <h3 className="text-2xl font-bold mb-4">For Clients</h3>
                <p className="text-muted-foreground mb-6">Find the perfect freelancer for your project and get work done efficiently.</p>
                <Button size="lg">Find Talent</Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="p-8 border rounded-lg"
              >
                <h3 className="text-2xl font-bold mb-4">For Freelancers</h3>
                <p className="text-muted-foreground mb-6">Discover exciting projects and grow your freelance career.</p>
                <Button size="lg">Find Work</Button>
              </motion.div>
            </div>
          </div>

          {/* FAQ Section */}
          <div>
            <h2 className="text-4xl font-bold mb-4 text-center lg:text-left">Frequently Asked Questions</h2>
            <p className="text-muted-foreground mb-12 text-center lg:text-left">Everything you need to know about the product and billing.</p>
            <Accordion type="single" collapsible className="w-full text-left">
              <AccordionItem value="item-1">
                <AccordionTrigger className="font-semibold">How do I sign up for the platform?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  You can register as either a Client or a Freelancer. You'll need a unique phone number and your name to create an account. Your access to platform features will be based on the role you choose.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="font-semibold">Why can't I apply for gigs after signing up as a freelancer?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  To start applying for gigs, your profile must be 100% complete. This includes adding at least one skill category, a short bio, and a profile photo.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="font-semibold">What information is required to post a gig?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Only clients can post gigs. To publish a gig, you must provide a title, a detailed description, a skill category, your budget in Birr, and the neighborhood where the work will take place.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="font-semibold">Is there a limit to how many gigs I can work on at once?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes, freelancers can have a maximum of five active gigs at the same time. You won't be able to apply for new gigs until one of your active ones is marked as complete.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger className="font-semibold">Can I change my rating for a user after I've submitted it?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No. Once a job is completed, both clients and freelancers are required to submit a rating. These ratings are permanent and cannot be edited or deleted to ensure transparency and trust.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
