import { LoginForm } from '@/features/auth/LoginForm'
import { Container } from '@/components/common/Container'

export default function LoginPage() {
  return (
    <Container className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <LoginForm />
    </Container>
  )
}
