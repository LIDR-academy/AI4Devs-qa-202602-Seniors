import { Request, Response } from 'express';
import { CandidateService } from '../../application/services/candidateService';
import { ApplicationProgressionService } from '../../application/services/ApplicationProgressionService';
import { PrismaCandidateRepository } from '../../application/repositories/PrismaCandidateRepository';
import { PrismaApplicationRepository } from '../../application/repositories/PrismaApplicationRepository';
import { ValidationError, DuplicateEmailError, NotFoundError } from '../../application/errors/AppError';

// Service instances - can be replaced for testing
let candidateService: CandidateService;
let applicationProgressionService: ApplicationProgressionService;

function getCandidateService(): CandidateService {
  if (!candidateService) {
    candidateService = new CandidateService(new PrismaCandidateRepository());
  }
  return candidateService;
}

function getApplicationProgressionService(): ApplicationProgressionService {
  if (!applicationProgressionService) {
    applicationProgressionService = new ApplicationProgressionService(new PrismaApplicationRepository());
  }
  return applicationProgressionService;
}

export function setCandidateService(service: CandidateService): void {
  candidateService = service;
}

export function setApplicationProgressionService(service: ApplicationProgressionService): void {
  applicationProgressionService = service;
}

export const addCandidateController = async (req: Request, res: Response) => {
  try {
    const candidateData = req.body;
    const candidate = await getCandidateService().addCandidate(candidateData);
    res.status(201).json({ message: 'Candidate added successfully', data: candidate });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ message: 'Error adding candidate', error: error.message });
    } else if (error instanceof DuplicateEmailError) {
      res.status(409).json({ message: 'Error adding candidate', error: error.message });
    } else {
      res.status(500).json({ message: 'Error adding candidate', error: 'Unknown error' });
    }
  }
};

export const getCandidateById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    const candidate = await getCandidateService().findCandidateById(id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateCandidateStageController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    const { applicationId, currentInterviewStep } = req.body;
    const applicationIdNumber = parseInt(applicationId);
    if (isNaN(applicationIdNumber)) {
      return res.status(400).json({ error: 'Invalid position ID format' });
    }
    const currentInterviewStepNumber = parseInt(currentInterviewStep);
    if (isNaN(currentInterviewStepNumber)) {
      return res.status(400).json({ error: 'Invalid currentInterviewStep format' });
    }
    const updatedApplication = await getApplicationProgressionService().updateCandidateStage(id, applicationIdNumber, currentInterviewStepNumber);
    res.status(200).json({ message: 'Candidate stage updated successfully', data: updatedApplication });
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: 'Application not found', error: error.message });
    } else {
      res.status(500).json({ message: 'Error updating candidate stage', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
};