import { Candidate } from '../../domain/models/Candidate';
import { validateCandidateData } from '../validator';
import { CandidateRepository } from '../repositories/CandidateRepository';
import { ValidationError, DuplicateEmailError, NotFoundError } from '../errors/AppError';
import { Application } from '../../domain/models/Application';

export class CandidateService {
  constructor(private repository: CandidateRepository) {}

  async addCandidate(candidateData: any): Promise<Candidate> {
    try {
      validateCandidateData(candidateData);
    } catch (error: any) {
      throw new ValidationError(error.message);
    }

    try {
      const savedCandidate = await this.repository.save(candidateData);
      return savedCandidate;
    } catch (error) {
      if (error instanceof DuplicateEmailError) {
        throw error;
      }
      throw error;
    }
  }

  async findCandidateById(id: number): Promise<Candidate | null> {
    return this.repository.findOne(id);
  }

  async updateCandidateStage(id: number, applicationIdNumber: number, currentInterviewStep: number): Promise<Application> {
    try {
      const application = await Application.findOneByPositionCandidateId(applicationIdNumber, id);
      if (!application) {
        throw new NotFoundError('Application not found');
      }

      application.currentInterviewStep = currentInterviewStep;

      await application.save();

      return application;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw error;
    }
  }
}