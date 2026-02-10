import { ForgotPasswordForm } from '@/features/auth/ForgotPasswordForm'
import { Container } from '@/components/common/Container'

export default function ForgotPasswordPage() {
    return (
        <Container className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
            <ForgotPasswordForm />
        </Container>
    )
}
