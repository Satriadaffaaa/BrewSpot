'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Card } from '@/components/common/Card'
import Link from 'next/link'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

import { TurnstileWidget } from '@/components/common/TurnstileWidget'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await signInWithEmailAndPassword(auth, email, password)

      router.refresh()
      router.push('/profile')
    } catch (err: any) {
      console.error(err)
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password')
      } else {
        setError('Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md p-8 md:p-10 shadow-card border-none bg-surface/80 backdrop-blur-sm mx-auto animate-fade-in-up">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold font-heading text-primary">Welcome Back</h1>
        <p className="text-neutral/60 mt-2">Sign in to continue your coffee journey</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          id="email"
          type="email"
          label="Email Address"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-background"
        />
        <div className="space-y-2">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-background"
            endIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none text-neutral/40 hover:text-primary transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            }
          />
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:text-primary-light hover:underline font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
            <span className="text-lg">⚠️</span> {error}
          </div>
        )}

        <div className="flex justify-center">
          <TurnstileWidget
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken(null)}
            onError={() => setCaptchaToken(null)}
          />
        </div>

        <Button
          type="submit"
          className="w-full shadow-lg shadow-primary/20"
          size="lg"
          isLoading={loading}
          disabled={!captchaToken}
        >
          {captchaToken ? 'Sign In' : 'Complete Verification'}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-neutral/60">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-primary font-bold hover:underline transition-colors">
          Sign up now
        </Link>
      </div>
    </Card>
  )
}
