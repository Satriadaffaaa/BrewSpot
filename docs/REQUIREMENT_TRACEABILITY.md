# Requirement Traceability Matrix - Lokali 📍

This document maps User Stories to Functional Requirements and their respective implementation areas in the codebase.

| User Story | Functional Req | Use Case | Implementation / Feature Folder |
| :--- | :--- | :--- | :--- |
| **US-01** (Search) | FR-02 | UC-01 | `src/features/brewspot/api.ts`, `src/components/brewspot/BrewSpotMap.tsx` |
| **US-02** (Filter) | FR-04, FR-05 | UC-02 | `src/components/common/FilterBar.tsx`, `src/features/brewspot/hooks.ts` |
| **US-03** (AI Summary) | FR-17 | UC-03 | `src/features/ai/reviewSummarizer.ts`, `src/components/brewspot/VibeCheckCard.tsx` |
| **US-05** (Add Spot) | FR-08 | UC-04 | `src/components/brewspot/AddBrewSpotForm.tsx`, `src/features/brewspot/mutations.ts` |
| **US-06** (Review) | FR-09 | UC-05 | `src/components/reviews/AddReviewForm.tsx`, `src/features/reviews/api.ts` |
| **US-07** (Check-in) | FR-13 | UC-06 | `src/features/checkin/service.ts`, `src/features/gamification/userStats.ts` |
| **US-09** (Stats/Profile) | FR-11 | UC-11 | `src/app/(protected)/profile/page.tsx`, `src/features/gamification/queries.ts` |
| **US-10** (Report) | FR-12 | UC-10 | `src/components/common/ReportDialog.tsx`, `src/features/reports/api.ts` |
| **US-11** (Claim Spot) | FR-19 | UC-07 | `src/components/brewspot/ClaimSpotModal.tsx`, `src/features/admin/api.ts` |
| **US-13** (Analytics) | FR-21 | UC-17 | `src/features/analytics/api.ts`, `src/app/admin/analytics/page.tsx` |
| **US-15** (Moderation) | FR-22 | UC-09 | `src/components/admin/PendingSpotTable.tsx`, `src/features/admin/api.ts` |
| **US-16** (Verify Claim) | FR-24 | UC-18 | `src/app/admin/verifications/page.tsx`, `src/features/admin/api.ts` |
| **US-17** (Search Trends) | FR-25 | UC-21 | `src/app/admin/tools/page.tsx`, `src/features/analytics/api.ts` |
| **US-19** (AI Sync) | FR-26 | UC-19 | `src/app/admin/ai-tools/page.tsx`, `src/features/ai/actions.ts` |

## 🔗 Traceability Summary
- **FRs to US**: Every User Story is supported by at least one Functional Requirement.
- **FRs to Code**: Functional requirements are implemented within the `src/features` (Logic) and `src/components` (UI) folders, adhering to the project's architecture.
- **Technical Reference**: 
    - Detailed logic and rewards can be found in `docs/BUSINESS_RULES.md`.
    - Database schema definitions are in `docs/DATA_DICTIONARY.md`.
    - Feature completion criteria are listed in `docs/ACCEPTANCE_CRITERIA.md`.
    - External dependencies and fallbacks are documented in `docs/RISK_CONSTRAINTS.md`.
- **NFRs**: Non-Functional Requirements are addressed via infrastructure (Firebase, Cloudinary, Cloudflare) and cross-cutting concerns (AuthGuard, BannedUserGuard).
