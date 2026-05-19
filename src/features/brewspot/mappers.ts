import { BrewSpot } from './types'

export function mapToBrewSpot(id: string, data: any): BrewSpot {
    return {
        id: id,
        name: data.name,
        address: data.address || '',
        city: data.city || '',
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        price_range: data.priceRange,
        facilities: data.facilities || [],
        photos: data.photos || [],
        description: data.description || '',
        tags: data.tags || [],
        menuUrl: data.menuUrl,
        user_id: data.createdBy || '',
        status: data.status,
        created_at: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        image_url: data.imageUrl,
        rating: data.rating,
        reviews_count: data.reviewsCount,
        weekly_hours: data.weekly_hours,
        autoApproved: data.autoApproved,
        approvedBy: data.approvedBy,
        authorName: data.authorName,
        authorAvatar: data.authorAvatar,
        authorIsContributor: data.authorIsContributor,
        aiMeta: data.aiMeta,
        ai_summary: data.ai_summary,
        videoUrl: data.videoUrl,
        category: data.category,
        subcategory: data.subcategory,
        
        // Ownership & Verification
        ownerId: data.ownerId || null,
        isOfficial: data.isOfficial || false,
        verificationStatus: data.verificationStatus || 'unclaimed',
        officialMenuUrl: data.officialMenuUrl || null,
        officialPhotos: data.officialPhotos || []
    }
}
