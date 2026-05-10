import { AddBrewSpotForm } from '@/components/brewspot/AddBrewSpotForm'
import { Container } from '@/components/common/Container'
import { AuthGuard } from '@/components/common/AuthGuard'

export default function AddBrewSpotPage() {
    return (
        <Container className="py-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-heading font-bold text-primary">Tambah Spot Baru</h1>
                    <p className="text-neutral/70">Bagikan tempat lokal favoritmu ke komunitas.</p>
                </div>

                <AuthGuard>
                    <AddBrewSpotForm />
                </AuthGuard>
            </div>
        </Container>
    )
}
