'use client'

import { useState } from 'react'
import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { toggleLike } from '@/features/brewspot/api'
import { useAuth } from '@/providers/AuthProvider'

interface LikeButtonProps {
    brewspotId: string
    initialLiked?: boolean
}

export function LikeButton({ brewspotId, initialLiked = false }: LikeButtonProps) {
    const { user } = useAuth()
    const [liked, setLiked] = useState(initialLiked)
    const [animate, setAnimate] = useState(false)

    const handleToggle = async () => {
        if (!user) {
            alert("Silakan login untuk menyukai tempat ini.")
            return
        }

        // Optimistic UI
        setLiked(!liked)
        setAnimate(true)
        setTimeout(() => setAnimate(false), 300)

        try {
            await toggleLike(brewspotId)
        } catch (error) {
            console.error("Like failed", error)
            setLiked(initialLiked) // Revert
        }
    }

    return (
        <button
            onClick={handleToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${liked
                ? 'bg-red-50 border-red-200 text-red-500'
                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
        >
            <div className={animate ? 'animate-ping duration-300' : ''}>
                {liked ? (
                    <HeartIconSolid className="w-5 h-5" />
                ) : (
                    <HeartIcon className="w-5 h-5" />
                )}
            </div>
            <span className="font-medium text-sm">
                {liked ? 'Liked' : 'Like'}
                {/* Note: Total likes count requires reading from spot stats or separate query, optional for now */}
            </span>
        </button>
    )
}
