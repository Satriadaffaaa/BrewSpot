'use client'

import { useState } from 'react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'

export default function ConsistencyTool() {
    const [userId, setUserId] = useState('')
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const validateUser = async () => {
        if (!userId) return
        setLoading(true)
        setResult(null)

        // Audit Log
        import('@/features/admin/api').then(mod => mod.logAdminAction('validate_consistency_tool', { targetUserId: userId }));

        try {
            // 1. Fetch User Data
            const userRef = doc(db, 'users', userId)
            const userSnap = await getDoc(userRef)

            if (!userSnap.exists()) {
                setResult({ error: 'User not found' })
                setLoading(false)
                return
            }

            const userData = userSnap.data()
            const storedXP = userData.xp || 0
            const storedLevel = userData.level || 1

            // 2. Fetch All XP Logs (Audit)
            const logsRef = collection(db, 'xp_logs')
            const q = query(logsRef, where('userId', '==', userId))
            const logsSnap = await getDocs(q)

            let calculatedXP = 0
            logsSnap.forEach(doc => {
                calculatedXP += (doc.data().amount || 0)
            })

            // 3. Compare
            setResult({
                status: storedXP === calculatedXP ? 'MATCH' : 'MISMATCH',
                storedXP,
                calculatedXP,
                diff: storedXP - calculatedXP,
                storedLevel,
                logsCount: logsSnap.size
            })

        } catch (error) {
            console.error(error)
            setResult({ error: 'Validation failed' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold font-heading">Consistency Validator</h1>

            <Card className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">User ID</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={userId}
                            onChange={e => setUserId(e.target.value)}
                            className="flex-1 p-2 border rounded"
                            placeholder="Enter UID..."
                        />
                        <Button onClick={validateUser} disabled={loading}>
                            {loading ? 'Validating...' : 'Validate'}
                        </Button>
                    </div>
                </div>

                {result && (
                    <div className={`p-4 rounded border ${result.status === 'MATCH' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        {result.error ? (
                            <p className="text-red-600">{result.error}</p>
                        ) : (
                            <div className="space-y-2">
                                <p className="font-bold text-lg">Status: {result.status}</p>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>Stored XP: <strong>{result.storedXP}</strong></div>
                                    <div>Calculated XP: <strong>{result.calculatedXP}</strong></div>
                                    <div>Difference: <strong>{result.diff}</strong></div>
                                    <div>Logs Count: <strong>{result.logsCount}</strong></div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Card>
        </div>
    )
}
