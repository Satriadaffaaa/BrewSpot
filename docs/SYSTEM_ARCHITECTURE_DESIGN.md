# System Architecture & Design - Lokali 📍
*SA Perspective: Designing the "How"*

## 1. High-Level Tech Stack
| Layer | Technology | Reason |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15 (App Router) | SEO, Server Components, and Fast Refresh. |
| **Styling** | Tailwind CSS + Shadcn UI | Rapid UI development with consistent design system. |
| **State Management** | React Context + SWR | Efficient data fetching and local state sharing. |
| **Backend / DB** | Firebase (Firestore) | Real-time updates and seamless scaling. |
| **Authentication** | Firebase Auth | Secure and easy-to-implement social login. |
| **AI Engine** | Gemini Pro API | Advanced NLP for review summarization and tagging. |
| **Media Storage** | Cloudinary | Auto-optimization and transformation of user images. |

---

## 2. Infrastructure Overview
- **Hosting**: Vercel (Frontend & Edge Functions).
- **DNS/Security**: Cloudflare (WAF, Turnstile Bot Protection, CDN).
- **Analytics**: Firebase Analytics + Custom DB Snapshots.

---

## 3. Core Module Architecture
- `src/features/auth`: Handling user lifecycle.
- `src/features/brewspot`: Core map and spot logic.
- `src/features/reviews`: Community feedback loop.
- `src/features/gamification`: XP, Badges, and Leaderboard calculations.
- `src/features/ai`: Integration with Gemini API.

---

## 4. Key Sequence: AI Vibe Check Update
1. **Trigger**: User posts a new review (`reviews` collection).
2. **Action**: Firebase Function or API route detects review count >= 3.
3. **AI Call**: System fetches all reviews for that spot and sends to Gemini.
4. **Processing**: Gemini generates JSON (Pros, Cons, Verdict).
5. **Update**: System overwrites `vibeCheck` field in the `spots` document.
6. **Delivery**: Next.js revalidates the cache to show the fresh summary.

---

## 5. Security Architecture
- **JWT**: Managed by Firebase Auth.
- **Rules**: Firestore Security Rules enforce that users can only write to their own data.
- **Sanitization**: API routes sanitize input to prevent script injection.
- **Bot Defense**: Cloudflare Turnstile validates form submissions.
