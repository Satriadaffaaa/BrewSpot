'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
    <Container className="py-12">
      {/* Header / Profile Card */}
      <Card className="mb-8 overflow-hidden bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/10">
        <div className="flex flex-col md:flex-row items-center gap-6 p-4">
          <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md overflow-hidden flex-shrink-0">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary text-secondary text-3xl font-bold">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>

          <div className="text-center md:text-left flex-grow">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <h1 className="text-3xl font-heading font-bold text-neutral">
                {user.displayName}
              </h1>
              {userProfile?.isContributor && (
                <SparklesIcon className="w-6 h-6 text-amber-500 animate-pulse" title="Contributor" />
              )}
            </div>

            <p className="text-neutral/60 mb-4">{user.email}</p>

            {/* XP Bar */}
            <div className="max-w-md mx-auto md:mx-0 bg-white/50 p-3 rounded-lg border border-white/60">
              <div className="flex justify-between text-sm mb-1 font-bold">
                <span>Level {userProfile?.level || 1}</span>
                <span className="text-primary">{userProfile?.xp || 0} XP</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-1000"
                  style={{ width: `${Math.min(((userProfile?.xp || 0) % 500) / 500 * 100, 100)}%` }} // Rough calc for Demo
                />
              </div>
              <div className="mt-2 flex gap-4 text-xs text-neutral/60 justify-center md:justify-start">
                <span className="flex items-center gap-1">
                  <TrophyIcon className="w-3 h-3" />
                  Trust Level: {userProfile?.trustLevel || 0}
                </span>
              </div>
            </div>

            {/* Badges */}
            <div className="mt-4 border-t border-gray-100 pt-2">
              <div className="text-xs font-bold text-neutral/50 mb-2 uppercase tracking-wider">Badges</div>
              <BadgeList
                badgeIds={userProfile?.badges || []}
                userStats={userProfile?.stats}
                variant="preview"
              />
            </div>
          </div>

          <div className="self-start md:self-center">
            <Button variant="outline" size="sm" onClick={() => setIsEditProfileOpen(true)} className="flex items-center gap-2">
              <PencilSquareIcon className="w-4 h-4" />
              Edit Profile
            </Button>
          </div>
        </div>
      </Card>

      <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />

      {/* Impact Card (Phase 8: Analytics) */}
      {userProfile?.stats?.totalViews !== undefined && userProfile.stats.totalViews > 0 && (
        <Card className="mb-8 p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative overflow-hidden">
          {/* Decor */}
          <div className="absolute -right-10 -top-10 text-white/10">
            <SparklesIcon className="w-40 h-40" />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-bold font-heading mb-1 text-blue-100">Community Impact</h3>
              <p className="text-2xl font-bold">
                Your contributions have helped <span className="text-yellow-300 mx-1">{userProfile.stats.totalViews.toLocaleString()}</span> people find coffee! ☕
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl text-center min-w-[100px] flex-shrink-0">
              <div className="text-3xl font-bold">{userProfile.stats.totalViews}</div>
              <div className="text-xs text-blue-100 uppercase tracking-wider font-medium">Total Views</div>
            </div>
          </div>
        </Card>
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
