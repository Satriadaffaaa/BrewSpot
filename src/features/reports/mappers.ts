import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { Report, ModerationLog } from '@/features/admin/types';

export function mapToReport(doc: QueryDocumentSnapshot<DocumentData>): Report {
    const data = doc.data();
    return {
        id: doc.id,
        targetType: data.targetType,
        targetId: data.targetId,
        reportedBy: data.reportedBy,
        reason: data.reason,
        description: data.description,
        status: data.status,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
    };
}

export function mapToModerationLog(doc: QueryDocumentSnapshot<DocumentData>): ModerationLog {
    const data = doc.data();
    return {
        id: doc.id,
        actionType: data.actionType,
        targetType: data.targetType,
        targetId: data.targetId,
        adminId: data.adminId,
        reason: data.reason,
        metadata: data.metadata,
        createdAt: data.createdAt,
    };
}
