export const AI_CONFIG = {
    // KILL SWITCH: Global flag to disable all AI features
    // Set to false by default for safety until fully tested
    // KILL SWITCH: Global flag to disable all AI features
    // Enabled now for Free Tier usage
    ENABLED: true,

    // Provider Config
    PROVIDER: 'gemini' as const,
    MODEL_VERSION: 'gemini-2.5-flash',

    // Prompt Versioning - Change these to force re-generation
    VERSIONS: {
        BREWSPOT_TAGGER: 'v1.1.0-gemini',
        REVIEW_SUMMARIZER: 'v1.1.0-gemini',
        SENTIMENT_ANALYZER: 'v1.1.0-gemini'
    },

    // Cost & Safety Limits
    LIMITS: {
        DAILY_GLOBAL_CALLS: 100, // Budget cap
        MAX_TOKENS_OUTPUT: 150,
        TIMEOUT_MS: 10000, // 10s soft timeout
        RETRY_ATTEMPTS: 2,
        REVIEW_THRESHOLD_FOR_AI_UPDATE: 5 // Trigger AI re-evaluation every 5 reviews
    },

    // Feature Flags
    FEATURES: {
        AUTO_TAGGING: true,
        REVIEW_SUMMARY: true,
        SENTIMENT: true
    }
} as const;

export type AIProvider = typeof AI_CONFIG.PROVIDER;
