// AI Meta Schema (Phase 4 Preparation)
export interface AIMeta {
    tags?: string[]
    summary?: string
    sentiment?: "positive" | "neutral" | "negative"
    version?: string
    generatedAt?: any // Timestamp
}

export interface BrewSpot {
    id: string
    name: string
    address: string
    city: string
    latitude: number
    longitude: number
    price_range: 'cheap' | 'moderate' | 'expensive'
    facilities: string[]
    rating?: number
    reviews_count?: number
    image_url?: string // Deprecated
    photos: string[]
    description: string
    tags: string[]
    status: 'pending' | 'approved' | 'rejected'
    user_id: string
    created_at: string
    // Phase 2 Extensions
    autoApproved?: boolean
    approvedBy?: 'admin' | 'system' | string
    submissionSource?: 'manual-admin' | 'auto-approved-contributor' | 'manual-user'

    // Phase 5: Author Info (Denormalized)
    authorName?: string
    authorAvatar?: string
    authorIsContributor?: boolean

    // Phase 4: AI
    aiMeta?: AIMeta
    ai_summary?: {
        summary: string;
        pros: string[];
        cons: string[];
        generatedAt: string;
        version: string;
    }

    // Phase 8: Analytics
    viewsCount?: number
    totalCheckIns?: number // Trending Feature
    videoUrl?: string // Social Media Embed
    weekly_hours?: WeeklyHours
}

export interface DailySchedule {
    isOpen: boolean
    openTime: string // Format "HH:mm"
    closeTime: string // Format "HH:mm"
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export type WeeklyHours = {
    [key in DayOfWeek]?: DailySchedule
}

export interface AddBrewSpotInput {
    name: string
    address: string
    city: string
    latitude: number
    longitude: number
    price_range: 'cheap' | 'moderate' | 'expensive'
    facilities: string[]
    photos: string[]
    description: string
    tags: string[]
    videoUrl?: string
    weekly_hours?: WeeklyHours
}

export interface BrewSpotFilters {
    city?: string
    price_range?: string
}

// Phase 2: Community Interfaces

export interface Review {
    id: string
    brewspotId: string
    userId: string
    userName?: string // Denormalized for display
    userAvatar?: string
    brewspotName?: string // Phase 2.7: For My Reviews list
    rating: number
    opinion: string
    photos?: string[] // URLs
    videoUrl?: string
    createdAt: string
    updatedAt: string

    // Moderation
    isHidden?: boolean
    hiddenAt?: string
    hiddenBy?: string
    hiddenReason?: string

    // Phase 4: AI
    aiMeta?: AIMeta
}

export interface ReviewPhoto {
    id: string
    reviewId: string
    brewspotId: string
    url: string
    storagePath: string // For deletion
    uploadedBy: string
    createdAt: string
}

export interface Like {
    id: string
    brewspotId: string
    userId: string
    createdAt: string
}

export interface ReviewInput {
    rating: number
    opinion: string
    photos?: File[]
    videoUrl?: string
}
