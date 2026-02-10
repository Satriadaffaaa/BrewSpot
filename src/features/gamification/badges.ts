export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string; // Emoji character for now
    category: 'community' | 'contribution' | 'excellence';
}

export const BADGE_DEFINITIONS: Record<string, Badge> = {
    'first_review': {
        id: 'first_review',
        name: 'First Voice',
        description: 'Wrote your first review',
        icon: '🗣️',
        category: 'community'
    },
    'five_reviews': {
        id: 'five_reviews',
        name: 'Critic',
        description: 'Wrote 5 reviews',
        icon: '📝',
        category: 'community'
    },
    'ten_reviews': {
        id: 'ten_reviews',
        name: 'Connoisseur',
        description: 'Wrote 10 reviews',
        icon: '🧐',
        category: 'community'
    },
    'twenty_five_reviews': {
        id: 'twenty_five_reviews',
        name: 'Guide',
        description: 'Wrote 25 reviews',
        icon: '🧭',
        category: 'community'
    },
    'fifty_reviews': {
        id: 'fifty_reviews',
        name: 'Sage',
        description: 'Wrote 50 reviews',
        icon: '🧙‍♂️',
        category: 'community'
    },
    'hundred_reviews': {
        id: 'hundred_reviews',
        name: 'Legend',
        description: 'Wrote 100 reviews',
        icon: '👑',
        category: 'community'
    },

    // Contribution Badges (Approved Spots)
    'first_approved_spot': {
        id: 'first_approved_spot',
        name: 'Pathfinder',
        description: 'Had your first BrewSpot approved',
        icon: '🚩',
        category: 'contribution'
    },
    'five_approved_spots': {
        id: 'five_approved_spots',
        name: 'Cartographer',
        description: 'Had 5 BrewSpots approved',
        icon: '🗺️',
        category: 'contribution'
    },
    'ten_approved_spots': {
        id: 'ten_approved_spots',
        name: 'Explorer',
        description: 'Had 10 BrewSpots approved',
        icon: '🔭',
        category: 'contribution'
    },
    'twenty_five_approved_spots': {
        id: 'twenty_five_approved_spots',
        name: 'Pioneer',
        description: 'Had 25 BrewSpots approved',
        icon: '🚀',
        category: 'contribution'
    },
    'fifty_approved_spots': {
        id: 'fifty_approved_spots',
        name: 'Founder',
        description: 'Had 50 BrewSpots approved',
        icon: '🏛️',
        category: 'contribution'
    },

    // Photo Badges
    'first_photo': {
        id: 'first_photo',
        name: 'Shutterbug',
        description: 'Uploaded your first photo',
        icon: '📸',
        category: 'contribution'
    },
    'ten_photos': {
        id: 'ten_photos',
        name: 'Photographer',
        description: 'Uploaded 10 photos',
        icon: '🎞️',
        category: 'contribution'
    },
    'fifty_photos': {
        id: 'fifty_photos',
        name: 'Lens Master',
        description: 'Uploaded 50 photos',
        icon: '🖼️',
        category: 'contribution'
    },

    // Like Badges
    'first_like': {
        id: 'first_like',
        name: 'Supporter',
        description: 'Gave your first like',
        icon: '👍',
        category: 'community'
    },
    'fifty_likes': {
        id: 'fifty_likes',
        name: 'Fan',
        description: 'Gave 50 likes',
        icon: '❤️',
        category: 'community'
    },
    'hundred_likes': {
        id: 'hundred_likes',
        name: 'Super Fan',
        description: 'Gave 100 likes',
        icon: '🔥',
        category: 'community'
    },

    'contributor': {
        id: 'contributor',
        name: 'Contributor',
        description: 'Earned Contributor status',
        icon: '⭐',
        category: 'excellence'
    }
};
