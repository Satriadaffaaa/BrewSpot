import Link from 'next/link';
import { Button } from '@/components/common/Button';
import { Container } from '@/components/common/Container';
import { ArrowRightIcon, MapIcon, StarIcon, SparklesIcon } from '@heroicons/react/24/solid';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-secondary/30 -z-10" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 -z-10" />

        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in-up">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-primary leading-tight text-balance">
                Discover the Best <span className="text-accent underline decoration-wavy decoration-2 underline-offset-4">Coffee Spots</span> in Town
              </h1>
              <p className="text-lg md:text-xl text-neutral/80 max-w-xl leading-relaxed">
                Join a community of coffee lovers. Find hidden gems, rate your brews, and track your caffeine journey with BrewSpot.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/explore" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto shadow-xl shadow-primary/20">
                    Start Exploring <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/register" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-2">
                    Join Community
                  </Button>
                </Link>
              </div>
              <div className="pt-8 flex items-center gap-4 text-sm text-neutral/60">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200" />
                  ))}
                </div>
                <p>Trusted by 1,000+ coffee enthusiasts</p>
              </div>
            </div>

            <div className="relative mt-12 lg:mt-0">
              {/* Abstract decorative shapes or a placeholder for a 3D illusion */}
              <div className="relative z-10 bg-white p-6 rounded-3xl shadow-card rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="aspect-[4/3] bg-neutral-100 rounded-2xl overflow-hidden relative">
                  {/* Placeholder for Hero Image */}
                  <div className="absolute inset-0 flex items-center justify-center bg-primary/5 text-primary/20">
                    <MapIcon className="w-32 h-32 opacity-20" />
                    <span className="absolute bottom-4 font-heading font-bold text-xl">Find Your Vibe</span>
                  </div>
                </div>
                <div className="mt-6 flex justify-between items-end">
                  <div>
                    <h3 className="font-bold text-lg font-heading">Kopi Kenangan Mantan</h3>
                    <div className="flex gap-1 text-yellow-400 mt-1">
                      {[1, 2, 3, 4, 5].map(s => <StarIcon key={s} className="w-4 h-4" />)}
                    </div>
                  </div>
                  <div className="bg-secondary text-primary px-3 py-1 rounded-full text-xs font-bold">
                    1.2km away
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 w-full h-full bg-accent/20 rounded-3xl -z-10 rotate-[-6deg]" />
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-primary mb-4">Why BrewSpot?</h2>
            <p className="text-neutral/70 text-lg">More than just a map. It's your personal coffee journal and community.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <MapIcon className="w-8 h-8 text-primary" />,
                title: "Curated Map",
                desc: "Filter by vibe, wifi speed, or brew method. Find exactly what you need for work or play."
              },
              {
                icon: <StartIcon className="w-8 h-8 text-primary" />, // Typo fix: StarIcon usually, but using custom mapping logic implies component existence. Assuming StarIcon exists based on imports above.
                title: "Honest Reviews",
                desc: "Real ratings from real coffee lovers. No more bot reviews or paid promotions."
              },
              {
                icon: <SparklesIcon className="w-8 h-8 text-primary" />,
                title: "Earn Badges",
                desc: "Check in, write reviews, and climb the leaderboard. Become a certified Coffee Connoisseur."
              }
            ].map((feature, idx) => (
              <div key={idx} className="group p-8 rounded-2xl bg-secondary/20 hover:bg-secondary/40 transition-colors duration-300">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold font-heading mb-3 text-primary">{feature.title}</h3>
                <p className="text-neutral/70 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-secondary relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/pattern.png')] opacity-5" />
        <Container className="relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6">Ready for your next cup?</h2>
          <p className="text-xl opacity-90 mb-10 max-w-xl mx-auto">Join thousands of coffee enthusiasts and start discovering your new favorite spots today.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-secondary text-primary hover:bg-white w-full sm:w-auto font-bold shadow-lg">
                Create Free Account
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="outline" size="lg" className="border-secondary text-secondary hover:bg-secondary/10 w-full sm:w-auto">
                Browse Guest Mode
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}

function StartIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
  )
}
