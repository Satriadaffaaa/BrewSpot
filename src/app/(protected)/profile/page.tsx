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
import { TrophyIcon, StarIcon, HeartIcon, MapPinIcon } from '@heroicons/react/24/outline'

import { EditProfileModal } from '@/components/profile/EditProfileModal'
import { PencilSquareIcon } from '@heroicons/react/24/outline'
import { UserVisitHistory } from '@/features/checkin/components/UserVisitHistory'

type ProfileTab = 'reviews' | 'brewspots' | 'likes' | 'visits'

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<ProfileTab>('reviews')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)

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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <Container className="py-8 md:py-12 max-w-5xl mx-auto">
      {/* Header / Profile Card */}
      <div className="relative mb-12">
        {/* Background Decor */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl transform -rotate-1 translate-y-2 z-0"></div>

        <Card className="relative z-10 overflow-hidden border-none shadow-soft bg-surface/80 backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 p-8">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-white border-4 border-white shadow-xl overflow-hidden flex-shrink-0 relative z-10">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary-light text-white text-4xl font-bold font-heading">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-sm z-20 border border-neutral/10">
                <button
                  onClick={() => setIsEditProfileOpen(true)}
                  className="w-8 h-8 flex items-center justify-center bg-neutral/5 hover:bg-primary/10 text-neutral-light hover:text-primary rounded-full transition-colors"
                  title="Edit Profile"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-grow text-center md:text-left space-y-4 w-full">
              <div>
                <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                  <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary">
                    {user.displayName}
                  </h1>
                  {userProfile?.isContributor && (
                    <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-amber-200">
                      <SparklesIcon className="w-3 h-3 text-amber-500 fill-current" />
                      Contributor
                    </span>
                  )}
                </div>
                <p className="text-neutral/60 font-medium">{user.email}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 border-t border-b border-primary/5 py-4">
                <div className="text-center md:text-left">
                  <div className="text-2xl font-bold font-heading text-primary">{userProfile?.level || 1}</div>
                  <div className="text-xs text-neutral/40 uppercase tracking-wider font-bold">Level</div>
                </div>
                <div className="text-center md:text-left border-l border-primary/5 pl-4">
                  <div className="text-2xl font-bold font-heading text-primary">{userProfile?.xp || 0}</div>
                  <div className="text-xs text-neutral/40 uppercase tracking-wider font-bold">Total XP</div>
                </div>
                <div className="text-center md:text-left border-l border-primary/5 pl-4">
                  <div className="text-2xl font-bold font-heading text-primary">{userProfile?.trustLevel || 0}</div>
                  <div className="text-xs text-neutral/40 uppercase tracking-wider font-bold">Trust Score</div>
                </div>
              </div>

              {/* XP Bar */}
              <div className="max-w-md mx-auto md:mx-0">
                <div className="flex justify-between text-xs font-bold text-neutral/50 mb-1.5 uppercase tracking-wider">
                  <span>Progress to Level {(userProfile?.level || 1) + 1}</span>
                  <span className="text-primary">{(userProfile?.xp || 0) % 500} / 500 XP</span>
                </div>
                <div className="h-3 w-full bg-secondary/20 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out relative"
                    style={{ width: `${Math.min(((userProfile?.xp || 0) % 500) / 500 * 100, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Badges Section */}
          <div className="bg-secondary/5 px-8 py-6 border-t border-primary/5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-bold text-neutral/40 uppercase tracking-widest flex items-center gap-2">
                <TrophyIcon className="w-4 h-4" /> Earned Badges
              </div>
              <Link href="/profile/badges" className="text-xs font-bold text-primary hover:underline">
                View All Badges →
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

      {/* Impact Analysis Card */}
      {userProfile?.stats?.totalViews !== undefined && userProfile.stats.totalViews > 0 && (
        <div className="mb-12 relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-lg p-1">
          <div className="bg-white/5 backdrop-blur-sm rounded-[14px] p-6 relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
              <SparklesIcon className="w-48 h-48 text-white" />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
              <div className="text-center sm:text-left space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-blue-200 text-sm font-bold uppercase tracking-wider mb-2">
                  <SparklesIcon className="w-4 h-4" /> Community Impact
                </div>
                <h3 className="text-2xl md:text-3xl font-bold font-heading leading-tight">
                  You've guided <span className="text-yellow-300 border-b-2 border-yellow-300/30">{userProfile.stats.totalViews.toLocaleString()}</span> people to better coffee!
                </h3>
                <p className="text-blue-100/80 text-sm">Thanks for being an awesome part of the community.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl min-w-[120px] text-center shadow-lg">
                <div className="text-3xl font-bold font-heading">{userProfile.stats.totalViews}</div>
                <div className="text-[10px] text-blue-200 uppercase tracking-wider font-bold mt-1">Total Views</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'reviews'
            ? 'border-primary text-primary'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <StarIcon className="w-5 h-5" />
          My Reviews
        </button>
        <button
          onClick={() => setActiveTab('brewspots')}
          className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'brewspots'
            ? 'border-primary text-primary'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <MapPinIcon className="w-5 h-5" />
          My BrewSpots
        </button>
        <button
          onClick={() => setActiveTab('likes')}
          className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'likes'
            ? 'border-primary text-primary'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <HeartIcon className="w-5 h-5" />
          Liked Spots
        </button>
        <button
          onClick={() => setActiveTab('visits')}
          className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'visits'
            ? 'border-primary text-primary'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <MapPinIcon className="w-5 h-5" />
          Top Visits
        </button>
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
    </Container>
  )
}
