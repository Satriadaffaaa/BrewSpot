import { RegisterForm } from '@/features/auth/RegisterForm'
import { Container } from '@/components/common/Container'

export default function RegisterPage() {
  return (
    <Container className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <RegisterForm />
    </Container>
  )
}
