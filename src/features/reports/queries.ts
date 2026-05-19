import { db } from '@/lib/firebase/client';
import {
    collection, query, where, orderBy, getDocs
} from 'firebase/firestore';
import { Report } from '@/features/admin/types';
import { mapToReport } from './mappers';

export async function getReports(status: 'open' | 'reviewed' | 'dismissed' = 'open'): Promise<Report[]> {
    const q = query(
        collection(db, 'reports'),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(mapToReport);
}
