'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/client'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Card } from '@/components/common/Card'
import Link from 'next/link'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

import { TurnstileWidget } from '@/components/common/TurnstileWidget'

export function RegisterForm() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // 2. Update profile (display name)
      await updateProfile(user, {
        displayName: username
      })

      // 3. Create user document in Firestore 'users' collection
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        username: username,
        email: email,
        role: 'user',
        xp: 0,
        level: 1,
        trustLevel: 1,
        isContributor: false,
        accountStatus: 'active',
        stats: {
          brewspotSubmitted: 0,
          brewspotApproved: 0,
          brewspotRejected: 0,
          totalLikesGiven: 0,
          totalReviews: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      setSuccess('Account created successfully!')

      // Optional: Redirect immediately or let them click login
      // router.push('/login')
    } catch (err: any) {
      console.error(err)
      if (err.code === 'auth/email-already-in-use') {
        setError('Email is already registered')
      } else {
        setError(err.message || 'An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md p-8 shadow-lg text-center">
        <h1 className="text-2xl font-bold font-heading text-primary mb-4">Welcome to BrewSpot!</h1>
        <p className="text-neutral mb-6">{success}</p>
        <Link href="/login">
          <Button className="w-full">Go to Login</Button>
        </Link>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md p-8 md:p-10 shadow-card border-none bg-surface/80 backdrop-blur-sm mx-auto animate-fade-in-up">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold font-heading text-primary">Join BrewSpot</h1>
        <p className="text-neutral/60 mt-2">Start discovering amazing coffee spots</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          id="username"
          type="text"
          label="Username"
          placeholder="johndoe"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="bg-background"
        />
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
          <p className="text-xs text-neutral/50 px-1">Must be at least 6 characters long</p>
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
          {captchaToken ? 'Create Account' : 'Complete Verification'}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-neutral/60">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-bold hover:underline transition-colors">
          Log in
        </Link>
      </div>
    </Card>
  )
}
