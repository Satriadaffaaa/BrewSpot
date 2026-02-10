import Link from 'next/link'
import { Button } from '@/components/common/Button'
import { Container } from '@/components/common/Container'
import { Card } from '@/components/common/Card'
import { RecommendedSection } from '@/components/brewspot/RecommendedSection'
import { TrendingSection } from '@/components/brewspot/TrendingSection'

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-secondary/30">
        <Container className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold font-heading text-primary tracking-tight">
            Find Your Perfect Cup
          </h1>
          <p className="text-lg md:text-xl text-neutral/80 max-w-2xl mx-auto">
            Discover the best local coffee shops, share your favorites, and join a community of coffee lovers.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <Button size="lg">Join the Community</Button>
            </Link>
            <Link href="/explore">
              <Button variant="outline" size="lg">Browse Spots</Button>
            </Link>
          </div>
        </Container>
      </section>



      {/* Trending Section */}
      <section className="py-12 bg-white border-b border-gray-100">
        <Container>
          <TrendingSection />
        </Container>
      </section>

      {/* Recommendations */}
      <RecommendedSection />

      {/* Features Section */}
      <section className="py-20 bg-background">
        <Container>
          <h2 className="text-3xl font-bold font-heading text-primary text-center mb-12">
            Why BrewSpot?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                ☕
              </div>
              <h3 className="text-xl font-semibold mb-2">Curated Spots</h3>
              <p className="text-neutral/70">
                Find hidden gems and top-rated cafes in your neighborhood.
              </p>
            </Card>
            <Card className="p-8 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                🤝
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
              <p className="text-neutral/70">
                Share reviews, photos, and connect with other coffee enthusiasts.
              </p>
            </Card>
            <Card className="p-8 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                ✨
              </div>
              <h3 className="text-xl font-semibold mb-2">Vibe Check</h3>
              <p className="text-neutral/70">
                Filter by atmosphere, wifi availability, and brewing methods.
              </p>
            </Card>
          </div>
        </Container>
      </section>
    </div>
  )
}
