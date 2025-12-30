"use client";

import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Briefcase, UserPlus, Search, Paintbrush, PenTool, Wrench, Zap, BookOpen, Megaphone, Code, Camera } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Quote } from 'lucide-react';
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
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <Badge className="mb-4">New: Now serving all of Addis</Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight">
              Find & Hire Freelancers in Addis Ababa
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0">
              Connecting skilled professionals with clients in Addis Ababa. Discover talent, build relationships, and grow your business.
            </p>
            <div className="flex gap-4 justify-center lg:justify-start">
              <Button size="lg">Get Started</Button>
              <Button size="lg" variant="outline">Learn More</Button>
            </div>
          </div>
          <div>
            <Image
              src="https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Hero Image"
              width={600}
              height={400}
              className="rounded-2xl border border-slate-200 shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-slate-200 bg-transparent shadow-none">
              <CardHeader>
                <div className="mx-auto h-16 w-16 rounded-md bg-slate-100 flex items-center justify-center">
                  <UserPlus className="h-8 w-8 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <h3 className="text-2xl font-bold">1. Create Account</h3>
                <p className="text-muted-foreground">Sign up as a client or freelancer to get started.</p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 bg-transparent shadow-none">
              <CardHeader>
                <div className="mx-auto h-16 w-16 rounded-md bg-slate-100 flex items-center justify-center">
                  <Search className="h-8 w-8 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <h3 className="text-2xl font-bold">2. Find or Post Gigs</h3>
                <p className="text-muted-foreground">Browse available gigs or post a job for freelancers to apply to.</p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 bg-transparent shadow-none">
              <CardHeader>
                <div className="mx-auto h-16 w-16 rounded-md bg-slate-100 flex items-center justify-center">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <h3 className="text-2xl font-bold">3. Get to Work</h3>
                <p className="text-muted-foreground">Collaborate, manage projects, and get paid securely.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Categories Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-12">Featured Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[ 
              { name: "Design", icon: <Paintbrush className="h-8 w-8 mx-auto mb-4 text-primary" /> },
              { name: "Writing", icon: <PenTool className="h-8 w-8 mx-auto mb-4 text-primary" /> },
              { name: "Plumbing", icon: <Wrench className="h-8 w-8 mx-auto mb-4 text-primary" /> },
              { name: "Electrical", icon: <Zap className="h-8 w-8 mx-auto mb-4 text-primary" /> },
              { name: "Tutoring", icon: <BookOpen className="h-8 w-8 mx-auto mb-4 text-primary" /> },
              { name: "Marketing", icon: <Megaphone className="h-8 w-8 mx-auto mb-4 text-primary" /> },
              { name: "Development", icon: <Code className="h-8 w-8 mx-auto mb-4 text-primary" /> },
              { name: "Photography", icon: <Camera className="h-8 w-8 mx-auto mb-4 text-primary" /> },
            ].map(category => (
              <Card key={category.name} className="p-6 text-center border-slate-200 hover:border-black transition-colors cursor-pointer">
                {category.icon}
                <h3 className="text-lg font-semibold">{category.name}</h3>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-12">What Our Users Say</h2>
          <Carousel className="w-full max-w-4xl mx-auto">
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index}>
                  <Card className="p-8 border-slate-200 shadow-none">
                    <div className="relative">
                      <Quote className="absolute -top-4 -left-4 h-12 w-12 text-slate-100" />
                      <p className="text-lg leading-relaxed text-muted-foreground mb-6 text-left">{testimonial.quote}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${testimonial.name}`} />
                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                      </div>
                    </div>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground mb-12">Everything you need to know about the product and billing.</p>
          <Accordion type="single" collapsible className="w-full text-left">
            <AccordionItem value="item-1">
              <AccordionTrigger className="font-semibold">How do I sign up for the platform?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                You can register as either a Client or a Freelancer. You'll need a unique phone number and your name to create an account. Your access to platform features will be based on the role you choose.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="font-semibold">Why can't I apply for gigs after signing up as a freelancer?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                To start applying for gigs, your profile must be 100% complete. This includes adding at least one skill category, a short bio, and a profile photo.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="font-semibold">What information is required to post a gig?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Only clients can post gigs. To publish a gig, you must provide a title, a detailed description, a skill category, your budget in Birr, and the neighborhood where the work will take place.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="font-semibold">Is there a limit to how many gigs I can work on at once?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Yes, freelancers can have a maximum of five active gigs at the same time. You won't be able to apply for new gigs until one of your active ones is marked as complete.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger className="font-semibold">Can I change my rating for a user after I've submitted it?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                No. Once a job is completed, both clients and freelancers are required to submit a rating. These ratings are permanent and cannot be edited or deleted to ensure transparency and trust.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-black text-white p-12 rounded-2xl">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold">Join Our Community</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Stay up to date with the latest news, announcements, and articles.</p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input type="email" placeholder="Enter your email" className="bg-white/10 border-white/20 text-white placeholder:text-white/50" />
                <Button variant="secondary">Subscribe</Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Separator />
      </div>
      <Footer />
    </div>
  );
}
