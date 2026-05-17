import { Request, Response } from 'express';
import { getCandidatesByPositionService, getInterviewFlowByPositionService, getAllPositionsService, createPositionService, deletePositionService } from '../../application/services/positionService';


export const getAllPositions = async (req: Request, res: Response) => {
    try {
        const positions = await getAllPositionsService();
        res.status(200).json(positions);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving positions', error: error instanceof Error ? error.message : String(error) });
    }
};

export const getCandidatesByPosition = async (req: Request, res: Response) => {
    try {
        const positionId = parseInt(req.params.id);
        const candidates = await getCandidatesByPositionService(positionId);
        res.status(200).json(candidates);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error retrieving candidates', error: error.message });
        } else {
            res.status(500).json({ message: 'Error retrieving candidates', error: String(error) });
        }
    }
};

export const getInterviewFlowByPosition = async (req: Request, res: Response) => {
    try {
        const positionId = parseInt(req.params.id);
        const interviewFlow = await getInterviewFlowByPositionService(positionId);
        res.status(200).json({ interviewFlow });
    } catch (error) {
        if (error instanceof Error) {
            res.status(404).json({ message: 'Position not found', error: error.message });
        } else {
            res.status(500).json({ message: 'Server error', error: String(error) });
        }
    }
};

export const createPosition = async (req: Request, res: Response) => {
    try {
        console.log('CREATE POSITION received data:', JSON.stringify(req.body, null, 2));
        const position = await createPositionService(req.body);
        res.status(201).json({ message: 'Position created successfully', data: position });
    } catch (error) {
        if (error instanceof Error) {
            console.error('CREATE POSITION error:', error);
            res.status(400).json({ message: 'Error creating position', error: error.message });
        } else {
            res.status(500).json({ message: 'Error creating position', error: String(error) });
        }
    }
};

export const deletePosition = async (req: Request, res: Response) => {
    try {
        const positionId = parseInt(req.params.id);
        if (isNaN(positionId)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        await deletePositionService(positionId);
        res.status(200).json({ message: 'Position deleted successfully' });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error deleting position', error: error.message });
        } else {
            res.status(500).json({ message: 'Error deleting position', error: String(error) });
        }
    }
};