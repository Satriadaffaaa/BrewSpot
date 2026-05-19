# Risk & Constraints - Lokali 📍

This document identifies potential risks and technical constraints that may impact the development or operation of the Lokali platform.

## 1. External Service Dependencies
| Service | Risk | Fallback / Mitigation |
| :--- | :--- | :--- |
| **Firebase Firestore** | Connectivity issues or slow reads. | Implement local caching (SWR/React Query) and optimistic UI updates. |
| **Gemini API (AI)** | Rate limits or unexpected API downtime. | Use a graceful degradation strategy: hide AI Vibe Check or show "Summary temporarily unavailable". |
| **Mapbox / OSM** | API key expiration or usage limits. | Monitor usage dashboard; implement a secondary tile provider if necessary. |
| **Cloudinary** | Bandwidth limits for high-res images. | Enforce automatic image resizing and quality compression on upload. |

## 2. Technical Constraints
- **Client-Side Heavy**: The application relies heavily on Mapbox/OpenLayers, which can be memory-intensive on low-end mobile devices.
- **NoSQL Structure**: Firestore's NoSQL nature makes complex relational queries (like multi-collection joins) difficult; data must be denormalized where necessary.
- **GPS Accuracy**: Check-in validation depends on the accuracy of the user's device GPS, which can be inconsistent in dense urban areas (urban canyons).

## 3. Security & Compliance
- **User Privacy**: Geolocation data must only be used for check-in validation and not stored as a persistent movement history.
- **Content Integrity**: Malicious users may attempt to "spam" check-ins or reviews to manipulate the trending algorithm.
- **Data Protection**: Must adhere to local data protection regulations (e.g., GDPR/CCPA) regarding user profile data.

## 4. Development Risks
- **AI Hallucinations**: Gemini AI might generate inaccurate summaries if the review text is sarcastic or contradictory.
- **Moderation Bottleneck**: If the platform grows rapidly, the manual moderation of spots and business claims may become a bottleneck for system growth.

## 5. Mitigation Strategies
- **Automated Testing**: Implement unit tests for core logic (XP calculation, trending scores).
- **Rate Limiting**: Apply Cloudflare rate limiting on API routes to prevent bot attacks.
- **Shadow Moderation**: Use AI to pre-screen content and only flag high-confidence violations for human review.
