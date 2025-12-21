import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, UserPlus, Search } from 'lucide-react';

export default function Home() {
  return (
    <div className="w-full">
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1589149098258-3e9102cd63d3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')"}}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10">
        <div className="space-y-4">
          <div className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            Welcome to the Future of Work
          </div>
          
          <h1 className="mx-auto max-w-4xl text-6xl font-900 tracking-tight text-foreground md:text-7xl lg:text-8xl">
            Addis GigFind
          </h1>
          
          <p className="mx-auto max-w-2xl text-2xl font-300 text-foreground/80 md:text-3xl">
            A Local Skills Marketplace
          </p>
        </div>
        
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-foreground/60 md:text-xl">
          Connecting skilled professionals with clients in Addis Ababa. Discover talent, build relationships, and grow your business.
        </p>
        
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <button className="group relative inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-primary/50 active:scale-95">
            Get Started
            <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
          </button>
          <button className="inline-flex items-center justify-center rounded-full border border-foreground/20 px-8 py-4 font-semibold text-foreground transition-all duration-300 hover:border-foreground/40 hover:bg-foreground/5">
            Learn More
          </button>
        </div>
              </div>
      </main>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-12">
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
            {["Design", "Writing", "Plumbing", "Electrical"].map(category => (
              <Card key={category} className="p-6 text-center hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold">{category}</h3>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
