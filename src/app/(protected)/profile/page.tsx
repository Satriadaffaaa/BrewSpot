'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/providers/AuthProvider'
import { Container } from '@/components/common/Container'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { ReviewList } from '@/components/reviews/ReviewList'
import { BrewSpotList } from '@/components/brewspot/BrewSpotList'
import { BadgeList } from '@/components/gamification/BadgeList'
import { getReviewsByUser } from '@/features/reviews/api'
import { getBrewSpotsByUser, getLikedBrewSpots } from '@/features/brewspot/api'
import { getUserProfile } from '@/features/gamification/api'
import { Review, BrewSpot } from '@/features/brewspot/types'
import { UserProfile } from '@/features/gamification/types'
import { SparklesIcon } from '@heroicons/react/24/solid'
import { PencilSquareIcon, BuildingStorefrontIcon, ArrowPathIcon, CheckBadgeIcon, StarIcon, HeartIcon, MapPinIcon, TrophyIcon } from '@heroicons/react/24/outline'

import { EditProfileModal } from '@/components/profile/EditProfileModal'
import { UserVisitHistory } from '@/features/checkin/components/UserVisitHistory'
import { BusinessVerificationModal } from '@/components/profile/BusinessVerificationModal'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'

type ProfileTab = 'reviews' | 'brewspots' | 'likes' | 'visits'

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<ProfileTab>('reviews')
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false)
  const [hasPendingRequest, setHasPendingRequest] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  // Data States
  const [reviews, setReviews] = useState<Review[]>([])
  const [brewSpots, setBrewSpots] = useState<BrewSpot[]>([])
  const [likedSpots, setLikedSpots] = useState<BrewSpot[]>([])

  const [loadingData, setLoadingData] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Fetch User Profile (XP, Level, etc)
  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(setUserProfile)
      
      // Check for pending business verification
      const checkPending = async () => {
          const q = query(
              collection(db, 'business_verification_requests'),
              where('userId', '==', user.uid),
              where('status', '==', 'pending')
          )
          const snap = await getDocs(q)
          setHasPendingRequest(!snap.empty)
      }
      checkPending()
    }
  }, [user])

  // Fetch Tab Data
  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      setLoadingData(true)
      try {
        if (activeTab === 'reviews') {
          const data = await getReviewsByUser(user.uid)
          setReviews(data)
        } else if (activeTab === 'brewspots') {
          const data = await getBrewSpotsByUser(user.uid)
          setBrewSpots(data)
        } else if (activeTab === 'likes') {
          const data = await getLikedBrewSpots(user.uid)
          setLikedSpots(data)
        }
      } catch (error) {
        console.error("Failed to fetch profile data", error)
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [user, activeTab])

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>
  }

  return (
    <Container className="py-12 md:py-24 max-w-6xl mx-auto">
      {/* Header / Profile Card */}
      <div className="relative mb-16">
        {/* Advanced Background Decor */}
        <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 via-primary/5 to-transparent rounded-[4rem] blur-3xl opacity-50 -z-10" />
        
        <Card className="relative z-10 overflow-hidden border-white/50 shadow-glass bg-surface/60 backdrop-blur-2xl rounded-[3.5rem] p-0">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12 p-10 md:p-14">
            {/* Avatar with Premium Border */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-full bg-surface p-2 shadow-premium relative z-10 overflow-hidden ring-8 ring-accent/5">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary-light text-white text-5xl font-black font-heading rounded-full">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsEditProfileOpen(true)}
                className="absolute -bottom-2 -right-2 w-12 h-12 bg-surface rounded-2xl shadow-xl border border-neutral/5 flex items-center justify-center text-neutral-light hover:text-accent hover:scale-110 transition-all z-20"
                title="Edit Profile"
              >
                <PencilSquareIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-grow text-center lg:text-left space-y-8 w-full">
              <div className="space-y-2">
                <div className="flex flex-col lg:flex-row items-center lg:items-end gap-4 mb-2">
                  <h1 className="text-4xl md:text-6xl font-black font-heading text-primary tracking-tighter leading-none">
                    {user.displayName}
                  </h1>
                  {userProfile?.isContributor && (
                    <span className="bg-accent/10 text-accent text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-[0.2em] border border-accent/20 flex items-center gap-2 mb-2 lg:mb-1">
                      <SparklesIcon className="w-3 h-3 animate-pulse" />
                      Contributor
                    </span>
                  )}
                </div>
                <p className="text-neutral-light text-lg font-medium opacity-60 tracking-tight">{user.email}</p>
              </div>

              {/* High-Fidelity Stats Grid */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-neutral/5">
                <div className="space-y-1">
                  <div className="text-3xl md:text-5xl font-black font-heading text-primary tracking-tighter">{userProfile?.level || 1}</div>
                  <div className="text-[10px] text-neutral-light uppercase tracking-[0.3em] font-black">Level</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl md:text-5xl font-black font-heading text-primary tracking-tighter">{userProfile?.xp || 0}</div>
                  <div className="text-[10px] text-neutral-light uppercase tracking-[0.3em] font-black">Total XP</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl md:text-5xl font-black font-heading text-primary tracking-tighter">{userProfile?.trustLevel || 0}</div>
                  <div className="text-[10px] text-neutral-light uppercase tracking-[0.3em] font-black">Trust Score</div>
                </div>
              </div>

              {/* Premium XP Progress System */}
              <div className="max-w-xl mx-auto lg:mx-0 pt-4">
                <div className="flex justify-between text-[10px] font-black text-neutral-light/60 mb-3 uppercase tracking-[0.2em]">
                  <span>Next Level Progres</span>
                  <span className="text-accent">{(userProfile?.xp || 0) % 500} / 500 <span className="opacity-50">XP</span></span>
                </div>
                <div className="h-4 w-full bg-secondary/30 rounded-full p-1 shadow-inner ring-1 ring-black/5">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-accent-dark rounded-full transition-all duration-1000 ease-out relative shadow-sm"
                    style={{ width: `${Math.min(((userProfile?.xp || 0) % 500) / 500 * 100, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-full" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-surface rounded-full shadow-lg -translate-x-1/2" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Luxury Badges Section */}
          <div className="bg-primary/5 px-10 py-10 border-t border-white/40">
            <div className="flex items-center justify-between mb-8">
              <div className="text-[10px] font-black text-neutral-light uppercase tracking-[0.3em] flex items-center gap-3">
                <TrophyIcon className="w-5 h-5 text-accent" /> Achievement Gallery
              </div>
              <Link href="/profile/badges" className="text-xs font-black text-accent uppercase tracking-widest hover:underline transition-all">
                View All Collection →
              </Link>
            </div>
            <BadgeList
              badgeIds={userProfile?.badges || []}
              userStats={userProfile?.stats}
              variant="preview"
            />
          </div>
        </Card>
      </div>

      {/* Business Owner Onboarding / Dashboard CTA */}
      <div className="mb-12">
          {userProfile?.role === 'owner' ? (
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 shadow-soft">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                              <BuildingStorefrontIcon className="w-8 h-8" />
                          </div>
                          <div>
                              <h3 className="text-xl font-bold font-heading text-primary">Pusat Bisnis Lokali</h3>
                              <p className="text-sm text-neutral/60">Kelola spot terverifikasi Anda dan pantau performa bisnis.</p>
                          </div>
                      </div>
                      <Link href="/dashboard/business">
                          <Button size="lg" className="rounded-xl shadow-lg border-none">
                              Buka Dashboard Bisnis
                          </Button>
                      </Link>
                  </div>
              </Card>
          ) : hasPendingRequest ? (
              <Card className="p-6 bg-amber-50 border-amber-200">
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 animate-pulse">
                          <ArrowPathIcon className="w-6 h-6" />
                      </div>
                      <div>
                          <h3 className="text-lg font-bold text-amber-900">Verifikasi Sedang Diproses</h3>
                          <p className="text-sm text-amber-700/80">Pengajuan akses owner Anda sedang ditinjau oleh Admin (1-3 hari kerja).</p>
                      </div>
                  </div>
              </Card>
          ) : (
              <Card className="p-8 border-dashed border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors group">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="space-y-2 text-center md:text-left">
                          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary mb-2">
                              <CheckBadgeIcon className="w-4 h-4" /> Kesempatan Bisnis
                          </div>
                          <h3 className="text-2xl font-black font-heading text-primary">Miliki Bisnis yang Terdaftar?</h3>
                          <p className="text-neutral/70 max-w-lg">
                              Klaim hak kelola spot Anda untuk mendapatkan status <b>Verified Official</b>, memantau analitik, dan merespons ulasan pelanggan secara profesional.
                          </p>
                      </div>
                      <Button 
                        size="lg" 
                        variant="primary" 
                        className="rounded-xl px-10 h-14 font-bold shadow-xl group-hover:scale-105 transition-transform"
                        onClick={() => setIsBusinessModalOpen(true)}
                      >
                          Daftar Akses Owner
                      </Button>
                  </div>
              </Card>
          )}
      </div>

      {/* Impact Analysis Card - High Impact */}
      {userProfile?.stats?.totalViews !== undefined && userProfile.stats.totalViews > 0 && (
        <div className="mb-20 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent-dark rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
          <Card className="relative overflow-hidden rounded-[3rem] bg-primary border-none shadow-premium p-1">
            <div className="bg-surface/5 backdrop-blur-xl rounded-[2.8rem] p-10 md:p-14 relative overflow-hidden">
              {/* Decorative Background */}
              <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                <SparklesIcon className="w-80 h-80 text-white" />
              </div>

              <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
                <div className="text-center lg:text-left space-y-4">
                  <div className="flex items-center justify-center lg:justify-start gap-3 text-accent text-[10px] font-black uppercase tracking-[0.4em] mb-4">
                    <SparklesIcon className="w-4 h-4 animate-bounce" /> Community Impact
                  </div>
                  <h3 className="text-3xl md:text-5xl font-black font-heading text-white leading-[1.1] tracking-tighter">
                    You&apos;ve guided <span className="text-accent italic"> {userProfile.stats.totalViews.toLocaleString()} </span> explorers <br className="hidden md:block" /> to their next favorite spot.
                  </h3>
                  <p className="text-white/50 text-lg font-medium">Your contributions are shaping the future of coffee discovery.</p>
                </div>

                <div className="bg-surface/10 backdrop-blur-2xl border border-white/20 p-8 rounded-[2.5rem] min-w-[200px] text-center shadow-2xl group-hover:scale-105 transition-transform">
                  <div className="text-5xl md:text-7xl font-black font-heading text-white tracking-tighter">{userProfile.stats.totalViews}</div>
                  <div className="text-[10px] text-accent uppercase tracking-[0.3em] font-black mt-3">Total Views</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Premium Tabs */}
      <div className="flex gap-4 border-b border-neutral/5 mb-12 overflow-x-auto pb-4 scrollbar-hide">
        {[
          { id: 'reviews', label: 'My Reviews', icon: StarIcon },
          { id: 'brewspots', label: 'My Spots', icon: MapPinIcon },
          { id: 'likes', label: 'Favorites', icon: HeartIcon },
          { id: 'visits', label: 'Visit History', icon: MapPinIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ProfileTab)}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === tab.id
              ? 'bg-primary text-white shadow-premium ring-2 ring-primary/5'
              : 'bg-surface/40 text-neutral-light hover:bg-surface/80 hover:text-primary border border-white/50'
              }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-accent' : ''}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[300px]">
        {loadingData ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {activeTab === 'reviews' && (
              <ReviewList
                reviews={reviews}
                isLoading={loadingData}
                variant="user"
                onReviewDeleted={() => {
                  // Refresh logic
                  getReviewsByUser(user.uid).then(setReviews)
                }}
              />
            )}

            {activeTab === 'brewspots' && (
              <BrewSpotList spots={brewSpots} isLoading={loadingData} />
            )}

            {activeTab === 'likes' && (
              <BrewSpotList spots={likedSpots} isLoading={loadingData} />
            )}

            {activeTab === 'visits' && (
              <UserVisitHistory userId={user.uid} />
            )}
          </>
        )}
      </div>
      
      <EditProfileModal 
        isOpen={isEditProfileOpen} 
        onClose={() => setIsEditProfileOpen(false)} 
      />

      <BusinessVerificationModal
        isOpen={isBusinessModalOpen}
        onClose={() => setIsBusinessModalOpen(false)}
        userId={user.uid}
        userName={user.displayName || ''}
        userEmail={user.email || ''}
      />
    </Container>
  )
}
