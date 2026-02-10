# Phase 4.5 Exit Safety Checklist

## 1. Safety & Stability
- [ ] **Kill Switch**: `AI_CONFIG.ENABLED` defaults to `false`. System behaves normally when disabled.
- [ ] **Soft Fail**: `aiService` catches all errors. UI components check for `aiMeta` existence before rendering.
- [ ] **Locking**: `aiLocks` prevents race conditions with 2-minute TTL.

## 2. Security (Firestore Rules)
- [ ] `ai_audit_logs` is Admin-only.
- [ ] `ai_usage` is Admin-only.
- [ ] `ai_locks` is Admin-only.
- [ ] `aiMeta` field on BrewSpots/Reviews is only modifiable by Admin (via existing update rules).

## 3. Data Integrity
- [ ] **Validation**: Tags are sanitized, lowercase, and length-limited.
- [ ] **Ownership**: AI does NOT overwrite user inputs (Checked in `brewspotTagger.ts`).
- [ ] **Versioning**: Prompt versions prevent endless regeneration of legacy data.

## 4. Cost Control
- [ ] **Quota**: Daily limit (100) is enforced.
- [ ] **Visibility**: Admin dashboard shows usage vs limit.
- [ ] **Mock Provider**: Default provider is "mock" (no cost) until API keys added.

## 5. Verification Steps
1.  Go to `/admin/ai-tools`.
2.  Enable AI (in code `aiConfig.ts` set ENABLED: true).
3.  Enter a BrewSpot ID.
4.  Click "Generate Tags".
5.  Check Console for "Tag Generation" success log.
6.  Check Firestore for `aiMeta` update on the BrewSpot.
7.  Check `ai_audit_logs` for the entry.
