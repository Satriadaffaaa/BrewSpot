import { adminDb } from '@/lib/firebase/admin';

export type AIActionType = 'TAG_GENERATION' | 'REVIEW_SUMMARY' | 'SENTIMENT_ANALYSIS' | 'generate_tags' | 'analyze_reviews';
export type AIStatus = 'success' | 'failed' | 'skipped';
export type AIFailureReason = 'timeout' | 'validation' | 'rate_limit' | 'disabled' | 'provider_error' | 'lock_active' | 'unknown';

export interface AILogEntry {
    action: AIActionType;
    entityId: string;
    entityType: 'brewspot' | 'review';
    promptVersion: string;
    status: AIStatus;
    triggeredBy: 'system' | 'admin' | 'user_action';
    durationMs?: number;
    tokensUsed?: number;
    failureReason?: AIFailureReason;
    meta?: Record<string, any>; // error details, validation issues
    createdAt: any;
}

const AI_LOGS_COLLECTION = 'ai_audit_logs';

export const logAICall = async (entry: Omit<AILogEntry, 'createdAt'>) => {
    try {
        await adminDb.collection(AI_LOGS_COLLECTION).add({
            ...entry,
            createdAt: new Date() // Admin SDK uses native Date or Timestamp
        });
    } catch (error) {
        // Fallback: Console log if Firestore fails (should rarely happen)
        // We don't want audit logging to crash the app, but we need visibility.
        console.error('Failed to write AI Audit Log:', error, entry);
    }
};
