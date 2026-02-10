import { AddBrewSpotForm } from '@/components/brewspot/AddBrewSpotForm'
import { Container } from '@/components/common/Container'
import { AuthGuard } from '@/components/common/AuthGuard'

export default function AddBrewSpotPage() {
    return (
        <Container className="py-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-heading font-bold text-primary">Add a BrewSpot</h1>
                    <p className="text-neutral/70">Share your favorite coffee spot with the community.</p>
                </div>

                <AuthGuard>
                    <AddBrewSpotForm />
                </AuthGuard>
            </div>
        </Container>
    )
}
