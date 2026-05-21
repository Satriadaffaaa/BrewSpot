import { Container } from '@/components/common/Container'
import { ExploreView } from '@/components/brewspot/ExploreView'

export default function ExplorePage() {
    return (
    <Container className="pt-28 pb-16 md:pt-36 md:pb-24 space-y-16">
      <div className="flex flex-col gap-4 max-w-3xl">
        <p className="text-accent font-black uppercase tracking-[0.3em] text-xs">Spot lokal, cerita nyata</p>
        <h1 className="text-4xl md:text-7xl font-black font-heading text-primary tracking-tighter leading-none">
          Jelajahi <br /> <span className="text-accent italic">Potensi Sekitarmu.</span>
        </h1>
        <p className="text-xl text-neutral-light font-medium max-w-xl leading-relaxed">
          Temukan UMKM pilihan, hidden gems terbaik, dan komunitas yang mencintai keaslian setiap tempat di sekitarmu.
        </p>
      </div>

      <ExploreView />
    </Container>
    )
}
