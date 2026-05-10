import Link from 'next/link';
import { Button } from '@/components/common/Button';
import { Container } from '@/components/common/Container';
import { 
  ArrowRightIcon, 
  MapIcon, 
  StarIcon, 
  SparklesIcon, 
  MagnifyingGlassIcon,
  HomeIcon,
  BriefcaseIcon,
  CameraIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-primary selection:bg-accent/30">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-[60%] h-[120%] bg-accent/10 -z-10 translate-x-1/4 -translate-y-1/4 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-primary/5 -z-10 -translate-x-1/4 rounded-full blur-[100px]" />
        
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
            <div className="lg:col-span-7 space-y-12">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/40 backdrop-blur-md rounded-full border border-white/50 text-primary text-xs font-black uppercase tracking-[0.2em] shadow-glass animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <SparklesIcon className="w-4 h-4 text-accent" />
                <span>Spot Lokal, Cerita Nyata</span>
              </div>
              
               <h1 className="text-6xl md:text-8xl font-black font-heading text-primary leading-[0.95] tracking-tight">
                Temukan <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-dark italic">Sisi Unik</span> <br />
                <span className="relative inline-block mt-2">
                  Sekitarmu.
                  <svg className="absolute -bottom-4 left-0 w-full opacity-60" viewBox="0 0 358 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 9.5C65.5 3.5 250 1.5 355.5 9.5" stroke="currentColor" className="text-accent" strokeWidth="6" strokeLinecap="round"/>
                  </svg>
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-primary/70 max-w-xl leading-relaxed font-medium">
                Lokali menghubungkanmu dengan UMKM pilihan, hidden gems terbaik, dan komunitas yang mencintai keaslian setiap tempat.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <Link href="/explore" className="w-full sm:w-auto">
                  <Button size="lg" className="group h-20 px-12 w-full sm:w-auto text-xl font-black rounded-3xl shadow-2xl shadow-accent/20 bg-accent text-[#1a1a2e] hover:bg-primary hover:text-white border-none transition-all">
                    Find Your Spot
                    <ArrowRightIcon className="w-6 h-6 ml-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <div className="flex items-center gap-5 text-sm font-bold text-mid">
                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`w-12 h-12 rounded-full border-4 border-background bg-accent/${i*10+10} shadow-sm flex items-center justify-center text-[10px] text-primary/40 font-black`}>L</div>
                    ))}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-primary font-black text-lg leading-none">10k+</span>
                    <span className="text-[10px] uppercase tracking-widest text-mid/60">Lokal Explorers</span>
                  </div>
                </div>
              </div>

              {/* Quick Search Mocks */}
              <div className="flex flex-wrap gap-3 pt-8">
                <span className="text-[10px] font-black text-mid uppercase tracking-[0.3em] self-center mr-4">Trending:</span>
                {['Cold Brew', 'Specialty', 'Quiet Space', 'Open Late'].map(tag => (
                  <button key={tag} className="px-5 py-2.5 bg-white/50 backdrop-blur-sm shadow-sm border border-primary/5 rounded-2xl text-xs font-bold hover:shadow-premium hover:border-accent hover:text-accent transition-all duration-300 text-primary">
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative z-10">
                {/* Main Hero Image with Premium Border */}
                <div className="aspect-[4/5] rounded-[3.5rem] overflow-hidden shadow-premium relative border-[12px] border-white group bg-primary/10">
                  <div className="absolute inset-0 flex items-center justify-center text-primary/10 font-black text-6xl rotate-12">LOKALI</div>
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-10 left-10 right-10 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Community Pick</p>
                    </div>
                    <h3 className="text-3xl font-black font-heading leading-tight tracking-tight">The Roastery Co.</h3>
                  </div>
                </div>
                
                {/* Floating Glass Cards */}
                <div className="absolute -top-12 -right-12 bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-glass border border-white/50 animate-bounce-slow hidden xl:block">
                  <div className="flex items-center gap-4">
                    <div className="bg-accent/10 p-3 rounded-2xl text-accent">
                      <StarIconSolid className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-mid uppercase tracking-widest">Global Rating</p>
                      <p className="font-black text-2xl text-primary">4.98</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-8 -left-12 bg-primary p-8 rounded-[2.5rem] shadow-2xl hidden xl:block">
                  <div className="flex items-center gap-4 text-background">
                    <MapIcon className="w-10 h-10 text-accent" />
                    <div className="leading-tight">
                      <p className="font-black text-xl">500+ Spots</p>
                      <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Across 12 Cities</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-accent/20 rounded-full blur-[100px] -z-10" />
            </div>
          </div>
        </Container>
      </section>

      {/* Categories Section with Improved Grid */}
      <section className="py-32 bg-white/30 relative">
        <Container>
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-10">
            <div className="max-w-2xl space-y-4">
              <div className="w-20 h-1.5 bg-accent rounded-full" />
              <h2 className="text-4xl md:text-6xl font-black font-heading text-primary leading-[1.1] tracking-tight">
                Eksplorasi <span className="italic">Tanpa Batas</span>
              </h2>
              <p className="text-mid text-xl font-medium">Dukung UMKM dan temukan pengalaman autentik di setiap sudut kota.</p>
            </div>
            <Link href="/explore">
              <Button variant="outline" className="rounded-2xl border-primary/10 hover:border-primary px-10 h-16 font-black uppercase text-xs tracking-widest text-primary">
                Explore All Havens
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <BriefcaseIcon className="w-9 h-9"/>, label: "Work & Focus", count: "142 Spots", color: "from-blue-500/10 to-blue-600/5 text-blue-600", border: "border-blue-100" },
              { icon: <MapIcon className="w-9 h-9"/>, label: "Hidden Gems", count: "89 Spots", color: "from-emerald-500/10 to-emerald-600/5 text-emerald-600", border: "border-emerald-100" },
              { icon: <CameraIcon className="w-9 h-9"/>, label: "Aesthetic", count: "216 Spots", color: "from-rose-500/10 to-rose-600/5 text-rose-600", border: "border-rose-100" },
              { icon: <HomeIcon className="w-9 h-9"/>, label: "Chill & Cozy", count: "324 Spots", color: "from-amber-500/10 to-amber-600/5 text-amber-600", border: "border-amber-100" },
            ].map((cat, idx) => (
              <button key={idx} className={`group relative p-10 rounded-[3rem] border ${cat.border} bg-white hover:border-accent transition-all duration-500 text-left overflow-hidden shadow-sm hover:shadow-xl`}>
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity blur-3xl`} />
                <div className={`w-20 h-20 bg-gradient-to-br ${cat.color} rounded-3xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                  {cat.icon}
                </div>
                <h3 className="text-2xl font-black font-heading text-primary relative z-10">{cat.label}</h3>
                <p className="text-sm font-bold text-mid mt-2 relative z-10">{cat.count}</p>
                <div className="mt-8 flex items-center gap-3 text-xs font-black uppercase tracking-widest text-accent opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  Discover <ArrowRightIcon className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </Container>
      </section>

      {/* Community / Social Proof Section */}
      <section className="py-32 bg-secondary relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-background to-transparent opacity-20" />
        
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="aspect-square rounded-[4rem] overflow-hidden border-[16px] border-white/5 shadow-premium relative group bg-white/5">
                <div className="absolute inset-0 flex items-center justify-center text-white/5 font-black text-8xl">LOKALI</div>
                <div className="absolute inset-0 bg-accent/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              {/* Premium Quote Card */}
              <div className="absolute -bottom-12 -right-12 bg-white p-10 rounded-[3rem] shadow-2xl border border-white/10 max-w-[340px] animate-in fade-in zoom-in duration-700">
                <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-accent/30">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-[#1a1a2e]" />
                </div>
                <p className="text-primary font-bold italic text-xl leading-relaxed">
                  &quot;Lokali changed how I see my city. Every corner now has a story and a perfect cup.&quot;
                </p>
                <div className="mt-6 pt-6 border-t border-primary/5">
                  <p className="text-primary font-black text-sm tracking-tight">Sarah Jenkins</p>
                  <p className="text-mid text-[10px] font-black uppercase tracking-[0.2em] mt-1">Legend Explorer</p>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-10 text-center lg:text-left">
              <div className="space-y-4">
                <p className="text-accent font-black uppercase tracking-[0.3em] text-xs">The Community</p>
                <h2 className="text-5xl md:text-7xl font-black font-heading !text-background leading-[1] tracking-tight">
                  Bukan Sekadar Peta. <br />
                  <span className="text-accent italic">Ini Kebanggaan Lokal.</span>
                </h2>
              </div>
              <p className="text-xl text-background/60 max-w-xl font-medium leading-relaxed mx-auto lg:mx-0">
                Bergabunglah dengan ribuan explorer yang berbagi temuan unik, ulasan jujur, dan tips rahasia. Dukung bisnis lokal favoritmu dan jadilah bagian dari pergerakan ini.
              </p>
              
              <div className="grid grid-cols-2 gap-12 pt-6">
                <div className="space-y-1">
                  <p className="text-5xl md:text-6xl font-black text-background font-heading tracking-tighter">12k<span className="text-accent">+</span></p>
                  <p className="text-[10px] font-black text-accent/60 uppercase tracking-[0.3em]">Verified Spots</p>
                </div>
                <div className="space-y-1">
                  <p className="text-5xl md:text-6xl font-black text-background font-heading tracking-tighter">4.8k<span className="text-accent">+</span></p>
                  <p className="text-[10px] font-black text-accent/60 uppercase tracking-[0.3em]">Daily Reviews</p>
                </div>
              </div>

              <div className="pt-10">
                <Link href="/register">
                  <Button size="lg" className="h-20 px-14 text-xl font-black rounded-3xl shadow-2xl shadow-accent/20 bg-accent text-[#1a1a2e] hover:bg-white transition-all border-none">
                    Join the Movement
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Final with High Impact */}
      <section className="py-40 bg-primary relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
        
        <Container className="relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-12">
            <h2 className="text-5xl md:text-8xl font-black font-heading !text-background leading-[0.95] tracking-tighter">
              Ready to Discover <br /> Your Next <span className="text-accent underline decoration-[12px] underline-offset-[12px]">Obsession?</span>
            </h2>
            <p className="text-xl md:text-2xl !text-background/60 font-medium max-w-2xl mx-auto leading-relaxed">
              Join for free today and start your journey through the finest coffee spots in the world.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6 pt-10">
              <Link href="/register">
                <Button size="lg" className="bg-accent text-[#1a1a2e] hover:bg-white h-20 px-12 rounded-3xl font-black text-xl shadow-2xl shadow-accent/40 border-none transition-all">
                  Get Started — It&apos;s Free
                </Button>
              </Link>
              <Link href="/explore">
                <Button variant="outline" size="lg" className="border-background/20 !text-background hover:bg-background/10 hover:border-background h-20 px-12 rounded-3xl font-black text-xl transition-all">
                  Explore the Map
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
