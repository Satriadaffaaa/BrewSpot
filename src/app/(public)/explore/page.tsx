import { Container } from '@/components/common/Container'
import { ExploreView } from '@/components/brewspot/ExploreView'

export default function ExplorePage() {
    return (
        <Container className="py-8 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-heading font-bold text-primary">Explore BrewSpots</h1>
                <p className="text-neutral/70">Discover the best coffee shops in town.</p>
            </div>

            <ExploreView />
        </Container>
    )
}
