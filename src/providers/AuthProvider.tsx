
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut as firebaseSignOut, User } from 'firebase/auth'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/client'
import { UserProfile } from '@/features/gamification/types'
import { reactivateUserIfExpired } from '@/features/gamification/api'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => { }
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      console.warn("Firebase Auth not initialized. Skipping auth listener.");
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        // Subscribe to user profile changes (real-time updates for bans/suspensions)
        const userRef = doc(db, 'users', user.uid)
        const unsubProfile = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data() as UserProfile & { suspensionUntil?: any }; // Allow implicit any for runtime check
            setProfile({ ...data, uid: doc.id })

            // Check Suspension Expiry
            if (data.accountStatus === 'suspended' && data.suspensionUntil) {
              let expiryString = '';

              // Handle Firestore Timestamp vs String mismatch
              if (typeof data.suspensionUntil === 'string') {
                expiryString = data.suspensionUntil;
              } else if (data.suspensionUntil?.toDate) {
                expiryString = data.suspensionUntil.toDate().toISOString();
              }

              if (expiryString) {
                reactivateUserIfExpired(doc.id, expiryString)
                  .catch((e: unknown) => console.error("Reactivation check failed", e));
              }
            }
          } else {
            setProfile(null)
          }
          setLoading(false)
        }, (error) => {
          console.error("Error fetching profile:", error)
          setLoading(false)
        })

        return () => unsubProfile()
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const signOut = async () => {
    await firebaseSignOut(auth);
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
