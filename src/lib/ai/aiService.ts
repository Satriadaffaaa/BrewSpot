import { AI_CONFIG } from './aiConfig';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logAICall, AILogEntry } from '@/features/ai/aiLogs';
import { acquireLock, releaseLock } from './aiLocks';
import { checkDailyLimit, incrementDailyLimit } from './aiGuards';

/**
 * AI Service Layer - Central Handler
 * Enforces: Safety, Logging, Locking, Limits
 */

interface AIRequest {
    entityId: string;
    entityType: 'brewspot' | 'review';
    prompt: string;
    actionType: AILogEntry['action'];
    promptVersion: string;
    triggeredBy: 'system' | 'admin';
}

interface AIResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// MOCK AI PROVIDER (Since we are in controlled enablement with no real keys yet)
// Phase 5 will implement real Gemini calls here.
const GEN_AI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyBaNZ-njSHMdHxMmTGq51m5xxNbl8t9GRI");
const MODEL = GEN_AI.getGenerativeModel({ model: "gemini-2.5-flash" });

// REAL AI PROVIDER (Gemini Free Tier)
const realAIProvider = async (prompt: string): Promise<string> => {
    try {
        // Enforce JSON structure in prompt
        const jsonPrompt = `${prompt} 
        
        CRITICAL INSTRUCTION: FAIL if you cannot return valid JSON.
        Output ONLY raw JSON. No markdown ticks. No explanations.
        Format example for TAGS: {"tags": ["Tag1", "Tag2"], "confidence": 0.9}
        Format example for SUMMARY: {"summary": "Text...", "sentiment": "positive"}
        `;

        const result = await MODEL.generateContent(jsonPrompt);
        const response = await result.response;
        const text = response.text();

        // Robust JSON extraction
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : text.replace(/```json/g, '').replace(/```/g, '').trim();
        return cleanJson;
    } catch (e) {
        console.error("Gemini API Error:", e);
        throw new Error("Provider Failed");
    }
};

export async function executeAISafe<T>(request: AIRequest): Promise<AIResult<T>> {
    const { entityId, entityType, actionType, promptVersion, triggeredBy } = request;
    const lockKey = `ai:${entityType}:${entityId}`;
    let lockAcquired = false;

    // 1. Check Global Switch
    if (!AI_CONFIG.ENABLED) {
        await logAICall({
            action: actionType, entityId, entityType, promptVersion, triggeredBy,
            status: 'skipped', failureReason: 'disabled', meta: { step: 'config_check' }
        });
        return { success: false, error: 'AI Disabled' };
    }

    // 2. Check Daily Limit
    const limitOk = await checkDailyLimit();
    if (!limitOk) {
        await logAICall({
            action: actionType, entityId, entityType, promptVersion, triggeredBy,
            status: 'failed', failureReason: 'rate_limit'
        });
        return { success: false, error: 'Daily Limit Reached' };
    }

    try {
        // 3. Acquire Lock
        lockAcquired = await acquireLock(lockKey);
        if (!lockAcquired) {
            await logAICall({
                action: actionType, entityId, entityType, promptVersion, triggeredBy,
                status: 'skipped', failureReason: 'lock_active'
            });
            return { success: false, error: 'Lock Active' };
        }

        // 4. CALL AI (Gemini)
        const startTime = Date.now();
        const rawResponse = await realAIProvider(request.prompt);
        const duration = Date.now() - startTime;

        // 5. Increment usage
        await incrementDailyLimit();

        // 6. Log Success
        await logAICall({
            action: actionType, entityId, entityType, promptVersion, triggeredBy,
            status: 'success', durationMs: duration, tokensUsed: 50 // Mock
        });

        // 7. Parse Result
        try {
            const parsed = JSON.parse(rawResponse);
            return { success: true, data: parsed as T };
        } catch (parseError) {
            await logAICall({
                action: actionType, entityId, entityType, promptVersion, triggeredBy,
                status: 'failed', failureReason: 'provider_error', meta: { error: 'JSON Parse Failed' }
            });
            return { success: false, error: 'Invalid AI Response' };
        }

    } catch (error) {
        // Safe Catch
        await logAICall({
            action: actionType, entityId, entityType, promptVersion, triggeredBy,
            status: 'failed', failureReason: 'unknown', meta: { error: String(error) }
        });
        return { success: false, error: 'AI Error' };

    } finally {
        if (lockAcquired) {
            await releaseLock(lockKey);
        }
    }
}

/**
 * Phase 7: Generate Tags from Description (Single Text)
 */
export async function generateTagsFromText(description: string, existingTags: string[] = []): Promise<string[]> {
    const prompt = `
        Analyze the following coffee shop description and suggest 5-8 relevant tags like "Cozy", "WiFi", "Outdoor", "Specialty Coffee".
        Return ONLY a JSON object: { "tags": ["Tag1", "Tag2"] }
        
        Description: "${description}"
        Existing Tags (Preserve valid ones): ${existingTags.join(', ')}
    `;

    const result = await executeAISafe<{ tags: string[] }>({
        entityId: 'temp-gen-' + Date.now(),
        entityType: 'brewspot', // misuse slightly but safe
        actionType: 'generate_tags',
        promptVersion: AI_CONFIG.VERSIONS.BREWSPOT_TAGGER,
        prompt: prompt,
        triggeredBy: 'system'
    });

    if (result.success && result.data?.tags) {
        // Simple dedupe and limit
        return Array.from(new Set([...existingTags, ...result.data.tags])).slice(0, 10);
    }
    return existingTags;
}

/**
 * Phase 7: Generate Tags from Reviews + Description (Social Proof)
 */
export async function generateTagsFromReviews(description: string, reviews: string[]): Promise<string[]> {
    const combinedText = `
        Description: ${description}
        
        Recent Reviews:
        ${reviews.map((r, i) => `${i + 1}. ${r}`).join('\n')}
    `;

    const prompt = `
        Based on the description and recent customer reviews, identify the top 5 most mentioned strengths or characteristics of this coffee shop.
        Prioritize what users say in reviews (e.g. if many say "Noisy", add "Lively" or "Noisy" appropriately).
        Return ONLY a JSON object: { "tags": ["Tag1", "Tag2"] }
    `;

    const result = await executeAISafe<{ tags: string[] }>({
        entityId: 'review-gen-' + Date.now(),
        entityType: 'review',
        actionType: 'analyze_reviews',
        promptVersion: AI_CONFIG.VERSIONS.REVIEW_SUMMARIZER,
        prompt: prompt + combinedText,
        triggeredBy: 'system'
    });

    if (result.success && result.data?.tags) {
        return result.data.tags;
    }
    return [];
}

/**
 * Phase 7: Batch Process (Stub for Admin Tool)
 */
export async function batchProcessTags(spots: { id: string, description: string }[]) {
    // This will be called by the Admin Tool loop
    // Returning a helper to process one spot to avoid massive parallel locking issues
    return async (spotId: string, description: string) => {
        return await generateTagsFromText(description);
    };
}
