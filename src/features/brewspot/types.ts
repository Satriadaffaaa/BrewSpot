// Lokali Category System
export const SPOT_CATEGORIES = {
    viral: { label: 'Sedang Viral', icon: '🔥', color: '#FF4500' },
    hidden_gem: { label: 'Hidden Gem', icon: '💎', color: '#00BFFF' },
    cafe: { label: 'Kafe & Kopi', icon: '☕', color: '#A0967F' },
    kuliner: { label: 'Kuliner & Warung', icon: '🍜', color: '#D85A30' },
    bar: { label: 'Bar & Hiburan', icon: '🍹', color: '#1a1a2e' },
    outdoor: { label: 'Outdoor & Wisata', icon: '🌿', color: '#3B6D11' },
    creative: { label: 'Ruang Kreatif', icon: '🎨', color: '#534AB7' },
    popup: { label: 'Pop-up & Pasar', icon: '🛍️', color: '#993556' },
    wellness: { label: 'Wellness & Spa', icon: '💆', color: '#0F6E56' },
} as const

export type SpotCategory = keyof typeof SPOT_CATEGORIES

export function getCategoryOrDefault(spot: { category?: SpotCategory }): SpotCategory {
    return spot.category || 'cafe'
}

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
    menuUrl?: string // New: Link to menu image/pdf
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

    // Lokali: Category System
    category?: SpotCategory
    subcategory?: string

    // Phase 10: Ownership & Verification
    ownerId?: string
    isOfficial?: boolean
    verificationStatus?: 'unclaimed' | 'pending' | 'verified'
    officialMenuUrl?: string
    officialPhotos?: string[]
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
    menuUrl?: string
    videoUrl?: string
    weekly_hours?: WeeklyHours
    category?: SpotCategory
    subcategory?: string
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

// Phase 10: Business Onboarding & Verification

export interface BusinessVerificationRequest {
    id: string
    userId: string
    userName: string
    userEmail: string
    
    // Legal Details
    legalName: string
    idNumber: string
    businessName: string
    businessType: string
    phone: string
    
    // Support Documents (URLs)
    idProofUrl: string
    businessProofUrl: string
    
    status: 'pending' | 'approved' | 'rejected'
    adminNotes?: string
    createdAt: string
    updatedAt: string
}

export interface ClaimRequest {
    id: string
    spotId: string
    spotName: string
    userId: string
    
    // Proof of specific spot control
    proofUrl: string 
    description: string
    
    status: 'pending' | 'approved' | 'rejected'
    adminNotes?: string
    createdAt: string
}
