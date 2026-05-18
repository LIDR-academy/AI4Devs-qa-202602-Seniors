import { Position } from '../../domain/models/Position';
import { prisma } from '../../database/prisma';

// Simple in-memory cache with TTL
interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL_MS = 30_000; // 30 seconds

const getCached = <T>(key: string): T | null => {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        cache.delete(key);
        return null;
    }
    return entry.data as T;
};

const setCache = <T>(key: string, data: T, ttlMs: number = CACHE_TTL_MS): void => {
    cache.set(key, { data, expiresAt: Date.now() + ttlMs });
};

const invalidateCache = (pattern: string): void => {
    const keysToDelete = Array.from(cache.keys()).filter(key => key.includes(pattern));
    for (const key of keysToDelete) {
        cache.delete(key);
    }
};

const calculateAverageScore = (interviews: any[]) => {
    if (interviews.length === 0) return 0;
    const totalScore = interviews.reduce((acc, interview) => acc + (interview.score || 0), 0);
    return totalScore / interviews.length;
};

/**
 * @deprecated Use PositionService class for dependency injection
 */
export const getCandidatesByPositionService = async (positionId: number) => {
    try {
        const applications = await prisma.application.findMany({
            where: { positionId },
            include: {
                candidate: true,
                interviews: true,
                interviewStep: true
            }
        });

        return applications.map(app => ({
            fullName: `${app.candidate.firstName} ${app.candidate.lastName}`,
            currentInterviewStep: app.interviewStep.name,
            candidateId: app.candidateId,
            applicationId: app.id,
            averageScore: calculateAverageScore(app.interviews)
        }));
    } catch (error) {
        console.error('Error retrieving candidates by position:', error);
        throw new Error('Error retrieving candidates by position');
    }
};

/**
 * @deprecated Use PositionService class for dependency injection
 */
export const getInterviewFlowByPositionService = async (positionId: number) => {
    const positionWithInterviewFlow = await prisma.position.findUnique({
        where: { id: positionId },
        include: {
            interviewFlow: {
                include: {
                    interviewSteps: true
                }
            }
        }
    });

    if (!positionWithInterviewFlow) {
        throw new Error('Position not found');
    }

    return {
        positionName: positionWithInterviewFlow.title,
        interviewFlow: {
            id: positionWithInterviewFlow.interviewFlow.id,
            description: positionWithInterviewFlow.interviewFlow.description,
            interviewSteps: positionWithInterviewFlow.interviewFlow.interviewSteps.map(step => ({
                id: step.id,
                interviewFlowId: step.interviewFlowId,
                interviewTypeId: step.interviewTypeId,
                name: step.name,
                orderIndex: step.orderIndex
            }))
        }
    };
};

/**
 * @deprecated Use PositionService class for dependency injection
 */
export const getAllPositionsService = async () => {
    try {
        const cached = getCached<any[]>('positions:all');
        if (cached) return cached;

        const positions = await prisma.position.findMany({
            where: { isVisible: true }
        });

        setCache('positions:all', positions);
        return positions;
    } catch (error) {
        console.error('Error retrieving all positions:', error);
        throw new Error('Error retrieving all positions');
    }
};

// Deepened service class with dependency injection support
export class PositionService {
    async getCandidatesByPosition(positionId: number) {
        return getCandidatesByPositionService(positionId);
    }

    async getInterviewFlowByPosition(positionId: number) {
        return getInterviewFlowByPositionService(positionId);
    }

    async getAllPositions() {
        return getAllPositionsService();
    }

    /**
     * Invalidate cache when position data changes
     */
    invalidatePositionsCache(): void {
        invalidateCache('positions');
    }
}