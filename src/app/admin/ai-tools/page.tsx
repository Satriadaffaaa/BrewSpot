'use client'

import { useState, useEffect } from 'react'
import { Container } from '@/components/common/Container'
import { Card } from '@/components/common/Card'
import { AI_CONFIG } from '@/lib/ai/aiConfig'
// import { checkDailyLimit } from '@/lib/ai/aiGuards' // REMOVED
// import { generateBrewSpotTags } from '@/features/ai/brewspotTagger' // REMOVED
// import { generateReviewSummary } from '@/features/ai/reviewSummarizer' // REMOVED
import { doc, getDoc, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'

interface SimpleSpot { id: string; name: string; }
interface SimpleReview { id: string; opinion: string; rating: number; aiMeta?: any; }

export default function AdminAITools() {
    const [dailyUsage, setDailyUsage] = useState<number>(0)
    const [limitReached, setLimitReached] = useState(false)
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState('')

    // Data for selectors
    const [brewspots, setBrewspots] = useState<SimpleSpot[]>([])
    const [selectedSpotId, setSelectedSpotId] = useState('')
    const [reviews, setReviews] = useState<SimpleReview[]>([])

    useEffect(() => {
        // Fetch usage
        const fetchUsage = async () => {
            const today = new Date().toISOString().split('T')[0];
            const docRef = doc(db, 'ai_usage', today);
            try {
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const count = snap.data().count || 0;
                    setDailyUsage(count);
                    // Local check
                    if (count >= AI_CONFIG.LIMITS.DAILY_GLOBAL_CALLS) {
                        setLimitReached(true);
                    }
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchUsage();
        // checkDailyLimit().then(isOk => setLimitReached(!isOk)); // REMOVED

        // Fetch BrewSpots List
        const fetchSpots = async () => {
            try {
                const q = query(collection(db, 'brewspots'), limit(50)); // Limit for safety
                const snap = await getDocs(q);
                const spots = snap.docs.map(d => ({ id: d.id, name: d.data().name }));
                setBrewspots(spots);
            } catch (e) {
                console.error("Failed to load spots", e);
            }
        };
        fetchSpots();
    }, []);

    // Fetch Reviews when Spot Selected
    useEffect(() => {
        if (!selectedSpotId) {
            setReviews([]);
            return;
        }
        const fetchReviews = async () => {
            try {
                const q = query(
                    collection(db, 'reviews'),
                    where('brewspotId', '==', selectedSpotId),
                    limit(10)
                );
                const snap = await getDocs(q);
                const revs = snap.docs.map(d => ({
                    id: d.id,
                    opinion: d.data().opinion,
                    rating: d.data().rating,
                    aiMeta: d.data().aiMeta
                }));
                setReviews(revs);
            } catch (e) {
                console.error("Failed to load reviews", e);
            }
        }
        fetchReviews();
    }, [selectedSpotId]);


    const handleGenerateTags = async () => {
        if (!selectedSpotId) return;
        setLoading(true);
        setStatus(`Generating Tags for ${selectedSpotId}...`);
        try {
            // Dynamic import Server Action
            const { generateBrewSpotTagsAction } = await import('@/features/ai/actions');
            await generateBrewSpotTagsAction(selectedSpotId);
            setStatus('Tags Generated! Checks Firestore or Console.');
        } catch (e) {
            setStatus('Error: ' + e);
        } finally {
            setLoading(false);
        }
    }

    const handleGenerateSummary = async (reviewId: string) => {
        // Deprecated: Review Summary is now per-spot, not per-review
        alert("Please use the Batch Summarize button below for now.");
        /*
        setLoading(true);
        setStatus(`Summarizing Review ${reviewId}...`);
        try {
            const { generateBrewSpotSummaryAction } = await import('@/features/ai/actions');
            // await generateBrewSpotSummaryAction(reviewId); // API changed
            setStatus('Summary Generated! Check Firestore.');
        } catch (e) {
            setStatus('Error: ' + e);
        } finally {
            setLoading(false);
        }
        */
    }

    const isEnabled = AI_CONFIG.ENABLED;
    const quota = AI_CONFIG.LIMITS.DAILY_GLOBAL_CALLS;

    return (
        <Container className="py-8">
            <h1 className="text-2xl font-bold mb-6">AI Control Panel</h1>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className={`text-center p-6 border-l-4 ${isEnabled ? 'border-green-500' : 'border-red-500'}`}>
                    <h3 className="text-gray-500 text-sm uppercase">Global Status</h3>
                    <div className="text-3xl font-bold mt-2">{isEnabled ? 'ENABLED' : 'DISABLED'}</div>
                </Card>
                <Card className="text-center p-6">
                    <h3 className="text-gray-500 text-sm uppercase">Daily Quota</h3>
                    <div className="text-3xl font-bold mt-2 text-blue-600">{dailyUsage} / {quota}</div>
                    <div className="w-full bg-gray-200 h-2 rounded-full mt-3 overflow-hidden">
                        <div className={`h-full ${limitReached ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min((dailyUsage / quota) * 100, 100)}%` }} />
                    </div>
                </Card>
                <Card className="text-center p-6">
                    <h3 className="text-gray-500 text-sm uppercase">Provider</h3>
                    <div className="text-3xl font-bold mt-2 text-purple-600">{AI_CONFIG.PROVIDER}</div>
                    <p className="text-xs text-gray-400 mt-2">{AI_CONFIG.MODEL_VERSION}</p>
                </Card>
            </div>

            {/* Action Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* 1. Select Target */}
                <Card className="p-6">
                    <h2 className="text-lg font-bold mb-4">1. Select Target BrewSpot</h2>
                    <select
                        className="w-full border p-3 rounded-lg mb-4 bg-white"
                        value={selectedSpotId}
                        onChange={e => setSelectedSpotId(e.target.value)}
                    >
                        <option value="">-- Choose a BrewSpot --</option>
                        {brewspots.map(spot => (
                            <option key={spot.id} value={spot.id}>{spot.name}</option>
                        ))}
                    </select>

                    <button
                        onClick={handleGenerateTags}
                        disabled={!selectedSpotId || !isEnabled || limitReached}
                        className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg disabled:opacity-50 hover:bg-indigo-700 font-bold"
                    >
                        🪄 Generate AI Tags for Spot
                    </button>

                    {status && (
                        <div className="mt-4 p-3 bg-gray-100 text-sm font-mono border rounded break-all">
                            {status}
                        </div>
                    )}
                </Card>

                {/* 2. Review Actions */}
                <Card className="p-6">
                    <h2 className="text-lg font-bold mb-4">2. Manage Reviews</h2>
                    {!selectedSpotId ? (
                        <p className="text-gray-400 italic">Select a BrewSpot to see reviews.</p>
                    ) : (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {reviews.length === 0 && <p>No reviews found.</p>}
                            {reviews.map(rev => (
                                <div key={rev.id} className="border p-3 rounded-lg hover:bg-gray-50">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="text-sm font-medium">Rating: {rev.rating}/5</div>
                                        {rev.aiMeta ? (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">AI Processed</span>
                                        ) : (
                                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">Raw</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">"{rev.opinion}"</p>
                                    <button
                                        onClick={() => handleGenerateSummary(rev.id)}
                                        disabled={!isEnabled || limitReached}
                                        className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded hover:bg-teal-700 w-full"
                                    >
                                        📝 Summarize Review
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* 3. Batch Operations (NEW) */}
                <Card className="p-6 lg:col-span-2 bg-gradient-to-r from-gray-50 to-white border-l-4 border-indigo-500">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <span>⚡</span> Batch Operations
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Process all BrewSpots sequentially. This may take a while depending on the number of spots.
                    </p>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={async () => {
                                if (!confirm("Are you sure? This will regenerate tags for ALL spots.")) return;
                                setLoading(true);
                                setStatus('Starting Batch Process...');

                                let successCount = 0;
                                let failCount = 0;

                                // Import action dynamically
                                const { forceRegenerateTagsAction } = await import('@/features/ai/actions');

                                for (let i = 0; i < brewspots.length; i++) {
                                    const spot = brewspots[i];
                                    setStatus(`Processing ${i + 1}/${brewspots.length}: ${spot.name}`);

                                    const res = await forceRegenerateTagsAction(spot.id);
                                    if (res.success) successCount++;
                                    else failCount++;
                                }

                                setStatus(`Batch Complete! Success: ${successCount}, Failed: ${failCount}`);
                                setLoading(false);
                            }}
                            disabled={loading || brewspots.length === 0 || limitReached}
                            className="bg-indigo-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-800 disabled:opacity-50 shadow-lg"
                        >
                            {loading ? 'Processing...' : '⚡ Regenerate ALL Tags & Highlights'}
                        </button>

                        <button
                            onClick={async () => {
                                if (!confirm("Are you sure? This will generate Review Summaries for ALL spots. This is expensive!")) return;
                                setLoading(true);
                                setStatus('Starting Batch Summarization...');

                                let successCount = 0;
                                let failCount = 0;
                                let skipCount = 0;

                                // Import action dynamically
                                const { generateBrewSpotSummaryAction } = await import('@/features/ai/actions');

                                for (let i = 0; i < brewspots.length; i++) {
                                    const spot = brewspots[i];
                                    setStatus(`Summarizing ${i + 1}/${brewspots.length}: ${spot.name}`);

                                    const res = await generateBrewSpotSummaryAction(spot.id);
                                    if (res.success) successCount++;
                                    else if (res.error === 'Not enough reviews') skipCount++;
                                    else failCount++;
                                }

                                setStatus(`Batch Complete! Success: ${successCount}, Skipped: ${skipCount}, Failed: ${failCount}`);
                                setLoading(false);
                            }}
                            disabled={loading || brewspots.length === 0 || limitReached}
                            className="bg-teal-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-teal-600 disabled:opacity-50 shadow-lg"
                        >
                            {loading ? 'Processing...' : '📝 Summarize ALL Reviews'}
                        </button>

                        {loading && (
                            <div className="flex-1">
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 animate-pulse w-full"></div>
                                </div>
                                <p className="text-xs text-right mt-1 text-gray-500">Please do not close this tab.</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </Container>
    )
}
