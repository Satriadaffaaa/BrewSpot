# Test Plan & Strategy - Lokali 📍
*QA/SA Perspective: Ensuring Quality*

## 1. Testing Objectives
Memastikan aplikasi berjalan stabil, data akurat, dan fitur AI memberikan hasil yang relevan tanpa mengorbankan keamanan data pengguna.

---

## 2. Scope of Testing
| Level | Type | Focus Area |
| :--- | :--- | :--- |
| **Unit Testing** | Automated (Jest) | Logic XP, Trending Score, Price Utils. |
| **Integration** | Automated (Cypress/Playwright) | Auth Flow, Add Spot -> Admin Approval -> Public Map. |
| **AI Validation** | Manual/Analytical | Accuracy of AI summaries vs actual review text. |
| **Geolocation** | Manual (Device) | Check-in validation with mock locations and real GPS. |
| **Security** | Manual (Audit) | Testing Firestore rules and role-based access. |

---

## 3. Test Scenarios (High Level)
### Scenario 1: Add New Spot (Happy Path)
- **Steps**: Login -> Add Spot -> Upload Image -> Submit.
- **Expected**: Data appears in Admin Dashboard with `pending` status.

### Scenario 2: Check-in Validation
- **Steps**: Open spot detail -> Click Check-in at 50m away -> Click Check-in at 500m away.
- **Expected**: First one succeeds (XP added), second one fails with "Too far" error.

### Scenario 3: AI Vibe Check Trigger
- **Steps**: Add 3rd review to a spot.
- **Expected**: AI summary is generated and visible on the spot detail page.

### Scenario 4: Admin Moderation
- **Steps**: Admin rejects a spot.
- **Expected**: Spot disappears from public view and user sees `rejected` status.

---

## 4. Environment
- **Development**: Local environment with Firebase Emulator.
- **Staging**: Vercel Preview deployments connected to a separate Firebase Project.
- **Production**: Vercel Production deployment.

---

## 5. Bug Severity Levels
- **S1 (Blocker)**: App crashes, Login fails, Data leak.
- **S2 (Critical)**: Feature not working (e.g., Cannot add review), Map not loading.
- **S3 (Major)**: UI glitch, Typo in AI summary, XP calculation slightly off.
- **S4 (Minor)**: Cosmetic issues, slow loading (within NFR limits).
