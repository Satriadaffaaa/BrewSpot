# Business Rules - Lokali 📍

This document defines the core logic, calculations, and constraints that govern the Lokali platform's behavior.

## 1. Gamification & XP (Experience Points)
| Action | XP Reward | Frequency Limit |
| :--- | :--- | :--- |
| **Add New Spot** | 50 XP | No limit (Subject to approval) |
| **Write Review** | 10 XP | 1 per spot |
| **Upload Photo/Video** | 5 XP | Max 3 per review |
| **Check-in (Verified)** | 20 XP | 1 per day per spot |
| **Received Like** | 2 XP | No limit |
| **Spot Approved** | 100 XP | One-time per spot |

## 2. Trending Algorithm
A spot is marked as "Trending" if it meets the following criteria:
- **Calculation Period**: Last 7 rolling days.
- **Score Formula**: `(Check-ins * 5) + (New Reviews * 3) + (Likes * 1)`.
- **Threshold**: Minimum score of 50 to appear in the "Trending" section.

## 3. Geolocation & Check-in
- **Radius**: Users must be within **100 meters** of the spot's coordinates.
- **Verification**: GPS coordinates must be fresh (less than 1 minute old).
- **Cooldown**: A user cannot check-in to the same spot more than once every **18 hours**.

## 4. Content Moderation
- **Auto-Filter**: Reviews containing blacklisted words are automatically flagged for admin review.
- **Trust Score**:
    - New users (Level < 5): Content is `pending` by default.
    - Trusted users (Level >= 5): Spots are `approved` automatically unless flagged.
- **Business Claims**: Requires at least 2 pieces of official documentation (e.g., NIB, Tax ID, or Storefront Photo with Owner).

## 5. AI Vibe Check Logic
- **Minimum Data**: A spot must have at least **3 reviews** before Gemini AI generates a summary.
- **Update Frequency**: AI summaries are re-generated every **5 new reviews** or manually by an Admin.
- **Content Scope**: AI only analyzes reviews from the last **6 months** to ensure relevancy.

## 6. User Roles & Permissions
- **Visitor**: Read-only access to map and public spots.
- **User / Member**: Can contribute basic spot data (name, location, category, description, photos), write reviews, and earn XP. Restricted from inputting official Menu links or Business Hours.
- **Business Owner**: Can manage official information (Menu links, Business Hours, Facilities, Official Photos) for spots they have successfully claimed or created as an owner.
- **Admin**: Full access to moderation, user management, and platform settings, including managing official information for any spot.
