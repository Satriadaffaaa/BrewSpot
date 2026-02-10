# AI Firestore Security Rules

## Strategy
We enforce a strict "Server/Admin Only" write policy for all AI-related data. Clients (users) are consumers only.

## 1. AI Audit Logs (`ai_audit_logs`)
- **Read**: Admin Only.
- **Write**: Admin Only.
- **Reason**: Prevents users from spamming logs or seeing internal system prompts/failures.

## 2. AI Usage Limits (`ai_usage`)
- **Read**: Admin Only.
- **Write**: Admin Only.
- **Reason**: Critical for cost control. Users should not be able to reset global counters.

## 3. AI Locks (`ai_locks`)
- **Read**: Admin Only (System uses Admin SDK or runs in Admin context in real backend).
- **Write**: Admin Only.
- **Reason**: Prevents race condition tampering.

## 4. AI Metadata (`brewspots/{id}`)
- **Field**: `aiMeta`
- **Read**: Public (Approved spots only).
- **Write**: Admin Only (via existing Rule).
- **Reason**: Users cannot fabricate AI tags or summaries to boost SEO.

## 5. Implementation
These rules are enforced in `firestore.rules`:
```javascript
match /ai_audit_logs/{logId} { allow read, write: if isAdmin(); }
match /ai_usage/{docId} { allow read, write: if isAdmin(); }
match /ai_locks/{lockId} { allow read, write: if isAdmin(); }
```
