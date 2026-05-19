# Acceptance Criteria - Lokali 📍

This document defines the conditions that must be met for a feature to be considered complete.

## 🚶 Visitor Features
| Story ID | Acceptance Criteria |
| :--- | :--- |
| **US-01** (Search) | 1. Search results appear within 500ms.<br>2. Map fly-to animation executes upon selection.<br>3. Search results are filtered by the current map viewport. |
| **US-03** (AI Summary) | 1. AI Vibe Check card is visible only if reviews >= 3.<br>2. Pros/Cons are displayed as bullet points.<br>3. Summary shows "Last updated" timestamp. |

## 👤 Member Features
| Story ID | Acceptance Criteria |
| :--- | :--- |
| **US-05** (Add Spot) | 1. Validation prevents submission without Name, Location, and Category.<br>2. "Menu Link" and "Opening Hours" inputs are hidden for non-owner/admin roles.<br>3. Image upload shows progress indicator.<br>4. User receives a success notification and is redirected to the pending list. |
| **US-07** (Check-in) | 1. Geolocation permission is requested if not granted.<br>2. System blocks check-in if distance > 100m.<br>3. XP is instantly credited and visible on profile upon successful check-in. |

## 💼 Business Owner Features
| Story ID | Acceptance Criteria |
| :--- | :--- |
| **US-11** (Claim Spot) | 1. "Claim" button is hidden if spot is already claimed.<br>2. Form requires at least one file upload.<br>3. Submission status is visible in the user's dashboard as "Pending Verification". |
| **US-12** (Manage Info) | 1. Owner can edit Menu URL, Opening Hours, and Facilities from the Business Dashboard.<br>2. Changes are immediately reflected on the public spot page.<br>3. Official photos can be added/removed. |

## 🛡️ Admin Features
| Story ID | Acceptance Criteria |
| :--- | :--- |
| **US-15** (Moderation) | 1. Admin can view side-by-side comparison of old vs new data (if edit).<br>2. Rejection requires a mandatory "Reason" comment.<br>3. Approval status propagates to the public map immediately. |
| **US-19** (AI Sync) | 1. "Sync" button triggers a loading state.<br>2. Gemini API response is parsed and saved to the correct Firestore document.<br>3. User-facing UI updates without a manual page refresh. |

## ⚙️ General Technical Criteria
- **Responsive**: UI must not break on screen widths between 320px and 1920px.
- **Security**: Firestore rules must deny unauthorized writes to `spots` or `users`. Input fields for official data (Menu/Hours) must be restricted on the frontend via role checks.
- **Performance**: Lighthouse score for "Performance" must be >= 80.
- **Error Handling**: Network failures must trigger a "Toast" notification instead of a silent fail.
