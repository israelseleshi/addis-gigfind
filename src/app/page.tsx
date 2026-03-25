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
      <section className="relative min-h-[35rem] sm:min-h-[38rem] md:min-h-[40rem] lg:min-h-[45rem] xl:min-h-[50rem] 2xl:min-h-[55rem] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Hero Image"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 via-orange-500/50 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4 sm:space-y-5 md:space-y-6 text-center lg:text-left max-w-xl xl:max-w-2xl 2xl:max-w-3xl"
          >
            <Badge className="mb-2 sm:mb-3 md:mb-4 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 text-xs sm:text-sm">New: Now serving all of Addis</Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold tracking-tighter leading-tight text-white">
              Find & Hire <span className="text-white">Freelancers</span> in <span className="text-white">Addis Ababa</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-lg mx-auto lg:mx-0">
              Connecting skilled professionals with clients in Addis Ababa. Discover talent, build relationships, and grow your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Button className="bg-amber-500 hover:bg-amber-600 w-full sm:w-auto sm:text-base sm:px-8 sm:py-5">Get Started</Button>
              <Button variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 w-full sm:w-auto sm:text-base sm:px-8 sm:py-5">Learn More</Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 2xl:py-32 px-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 text-center">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-8 sm:mb-10 md:mb-12 xl:mb-16">How It Works</motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 xl:gap-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Card className="border-zinc-200 bg-transparent shadow-none h-full">
                <CardHeader>
                  <div className="mx-auto h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-md bg-zinc-100 flex items-center justify-center">
                    <UserPlus className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-orange-500" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-1 sm:space-y-2">
                  <h3 className="text-xl sm:text-2xl md:text-2xl font-bold">1. Create Account</h3>
                  <p className="text-zinc-500 text-sm sm:text-base">Sign up as a client or freelancer to get started.</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }}>
              <Card className="border-zinc-200 bg-transparent shadow-none h-full">
                <CardHeader>
                  <div className="mx-auto h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-md bg-zinc-100 flex items-center justify-center">
                    <Search className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-orange-500" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-1 sm:space-y-2">
                  <h3 className="text-xl sm:text-2xl md:text-2xl font-bold">2. Find or Post Gigs</h3>
                  <p className="text-zinc-500 text-sm sm:text-base">Browse available gigs or post a job for freelancers to apply to.</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.6 }}>
              <Card className="border-zinc-200 bg-transparent shadow-none h-full">
                <CardHeader>
                  <div className="mx-auto h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-md bg-zinc-100 flex items-center justify-center">
                    <Briefcase className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-orange-500" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-1 sm:space-y-2">
                  <h3 className="text-xl sm:text-2xl md:text-2xl font-bold">3. Get to Work</h3>
                  <p className="text-zinc-500 text-sm sm:text-base">Collaborate, manage projects, and get paid securely.</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Categories Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 2xl:py-32 px-4 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 text-center">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-8 sm:mb-10 md:mb-12 xl:mb-16">Featured Categories</motion.h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {[ 
              { name: "Design", icon: <Paintbrush className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 mx-auto mb-2 sm:mb-3 md:mb-4 text-primary" /> },
              { name: "Writing", icon: <PenTool className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 mx-auto mb-2 sm:mb-3 md:mb-4 text-primary" /> },
              { name: "Plumbing", icon: <Wrench className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 mx-auto mb-2 sm:mb-3 md:mb-4 text-primary" /> },
              { name: "Electrical", icon: <Zap className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 mx-auto mb-2 sm:mb-3 md:mb-4 text-primary" /> },
              { name: "Tutoring", icon: <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 mx-auto mb-2 sm:mb-3 md:mb-4 text-primary" /> },
              { name: "Marketing", icon: <Megaphone className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 mx-auto mb-2 sm:mb-3 md:mb-4 text-primary" /> },
              { name: "Development", icon: <Code className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 mx-auto mb-2 sm:mb-3 md:mb-4 text-primary" /> },
              { name: "Photography", icon: <Camera className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 mx-auto mb-2 sm:mb-3 md:mb-4 text-primary" /> },
            ].map((category, index) => (
              <motion.div key={category.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                <Card className="p-3 sm:p-4 md:p-6 text-center border-zinc-200 hover:border-orange-500 transition-colors cursor-pointer h-full">
                  {category.icon}
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold">{category.name}</h3>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 2xl:py-32 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-8 sm:mb-10 md:mb-12 xl:mb-16">What Our Users Say</h2>
          <Carousel className="w-full max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto">
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index}>
                  <Card className="p-4 sm:p-6 md:p-8 border-zinc-200 shadow-none">
                    <div className="relative">
                      <Quote className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 md:-top-4 md:-left-4 h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-zinc-100" />
                      <p className="text-sm sm:text-base md:text-lg leading-relaxed text-muted-foreground mb-4 sm:mb-5 md:mb-6 text-left">{testimonial.quote}</p>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${testimonial.name}`} />
                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm sm:text-base">{testimonial.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{testimonial.title}</p>
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

      <section className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 2xl:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 md:mb-6">Frequently Asked Questions</h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-8 sm:mb-10 md:mb-12 xl:mb-16">Everything you need to know about the product and billing.</p>
          <Accordion type="single" collapsible className="w-full text-left">
            <AccordionItem value="item-1">
              <AccordionTrigger className="font-semibold text-sm sm:text-base md:text-lg">How do I sign up for the platform?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                You can register as either a Client or a Freelancer. You&apos;ll need a unique phone number and your name to create an account. Your access to platform features will be based on the role you choose.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="font-semibold text-sm sm:text-base md:text-lg">Why can&apos;t I apply for gigs after signing up as a freelancer?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                To start applying for gigs, your profile must be 100% complete. This includes adding at least one skill category, a short bio, and a profile photo.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="font-semibold text-sm sm:text-base md:text-lg">What information is required to post a gig?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                Only clients can post gigs. To publish a gig, you must provide a title, a detailed description, a skill category, your budget in Birr, and the neighborhood where the work will take place.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="font-semibold text-sm sm:text-base md:text-lg">Is there a limit to how many gigs I can work on at once?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                Yes, freelancers can have a maximum of five active gigs at the same time. You won&apos;t be able to apply for new gigs until one of your active ones is marked as complete.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger className="font-semibold text-sm sm:text-base md:text-lg">Can I change my rating for a user after I&apos;ve submitted it?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                No. Once a job is completed, both clients and freelancers are required to submit a rating. These ratings are permanent and cannot be edited or deleted to ensure transparency and trust.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 2xl:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <Card className="bg-black text-white p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 rounded-xl sm:rounded-2xl">
            <div className="text-center space-y-3 sm:space-y-4 md:space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold">Join Our Community</h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl sm:max-w-2xl mx-auto">Stay up to date with the latest news, announcements, and articles.</p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-xs sm:max-w-md md:max-w-lg mx-auto">
                <Input type="email" placeholder="Enter your email" className="bg-white/10 border-white/20 text-white placeholder:text-white/50" />
                <Button variant="secondary" className="w-full sm:w-auto">Subscribe</Button>
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
