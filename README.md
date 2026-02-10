# BrewSpot ☕

**BrewSpot** is a modern, community-driven platform for discovering and sharing the best coffee spots. Built with **Next.js 14**, **TypeScript**, and **Firebase**, it combines robust location-based features with gamification and AI-powered insights to create an engaging experience for coffee lovers.

![BrewSpot Banner](https://img.shields.io/badge/Status-Active_Development-success) ![License](https://img.shields.io/badge/License-Private-blue)

## 🚀 Key Features

### 🌍 Discovery & Exploration
*   **Interactive Map**: Explore coffee spots on a Mapbox-powered map.
*   **Advanced Filtering**: Filter by city, rating, and tags (e.g., "Cozy", "Wifi").
*   **Smart Search**: Find spots by name or location with auto-centering map.
*   **Trending Spots**: Real-time trending list based on community check-ins.

### 🎮 Gamification & Community
*   **XP & Leveling System**: Earn XP for reviews, adding spots, and check-ins.
*   **Badges**: Unlock tier-based badges (Guide, Sage, Legend) for your contributions.
*   **Check-ins**: Geolocation-validated check-ins with cooldowns.
*   **Leaderboard**: Global ranking of top contributors.
*   **Trust Levels**: Contributors with high trust scores get perks like auto-approval.

### 🤖 AI-Powered Insights (Gemini AI)
*   **Vibe Check**: AI summarizes reviews into "Verdict", "Pros", and "Cons".
*   **Smart Tags**: AI analyzes listing details to automatically generate relevant tags.
*   **Content Moderation**: AI assists in flagging inappropriate content.

### 🛡️ Safety & Moderation
*   **Admin Dashboard**: Comprehensive tools for approving spots, managing reports, and moderating users.
*   **Role-Based Access**: Granular permissions for Users, Contributors, and Admins.
*   **Report System**: User-led reporting for spam or harassment.
*   **Automated Guards**: Rate limiting, orphan data protection, and ban enforcement.

## 🛠️ Tech Stack

*   **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Headless UI](https://headlessui.com/)
*   **Backend**: [Firebase](https://firebase.google.com/) (Firestore, Auth, Storage)
*   **Maps**: [Mapbox GL JS](https://www.mapbox.com/)
*   **AI**: [Google Gemini API](https://ai.google.dev/)
*   **Image Storage**: [Cloudinary](https://cloudinary.com/)

## 📦 Getting Started

### Prerequisites
*   Node.js 18+ 
*   npm or yarn
*   Firebase Project (Firestore & Auth enabled)
*   Cloudinary Account
*   Mapbox Access Token
*   Google Gemini API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Satriadaffaaa/BrewSpot.git
    cd BrewSpot
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file in the root directory and add the following keys:

    ```env
    # Firebase Client SDK
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

    # Firebase Admin SDK (Service Account)
    FIREBASE_PROJECT_ID=your_project_id
    FIREBASE_CLIENT_EMAIL=your_service_account_email
    FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

    # Analytics & Maps
    NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_id
    NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

    # Cloudinary
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

    # AI Configuration
    GEMINI_API_KEY=your_gemini_api_key
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

```
├── src/
│   ├── app/                # Next.js App Router pages & layouts
│   ├── components/         # Reusable UI components
│   ├── features/           # Feature-based modules (Auth, Gamification, etc.)
│   ├── lib/                # Utility functions & configurations
│   ├── providers/          # React Context providers (Auth, Theme)
│   └── types/              # Global TypeScript definitions
├── public/                 # Static assets
└── firestore.rules         # Database security rules
```

## 🗺️ Roadmap

- [x] **Phase 1: MVP**: Core discovery & review features.
- [x] **Phase 2: Gamification**: XP, Levels, and Badges.
- [x] **Phase 3: Safety**: Reporting system & Admin tools.
- [x] **Phase 4: Polish**: Premium UI & Animations.
- [x] **Phase 5: AI Integration**: Summaries & Smart Tags.
- [ ] **Phase 6: Mobile App**: React Native / Expo implementation.

---

Built with ❤️ by [Satria Daffa](https://github.com/Satriadaffaaa)
