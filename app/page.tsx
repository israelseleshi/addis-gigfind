export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Decorative gradient orbs */}
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
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
      </main>
    </div>
  );
}
