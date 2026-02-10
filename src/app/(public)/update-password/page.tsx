import { UpdatePasswordForm } from '@/features/auth/UpdatePasswordForm'
import { Container } from '@/components/common/Container'

export default function UpdatePasswordPage() {
    return (
        <Container className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
            <UpdatePasswordForm />
        </Container>
    )
}
