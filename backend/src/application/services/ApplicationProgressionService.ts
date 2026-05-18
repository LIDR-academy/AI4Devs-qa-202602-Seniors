import { Application } from '../../domain/models/Application';
import { ApplicationRepository } from '../repositories/ApplicationRepository';
import { NotFoundError } from '../errors/AppError';

export class ApplicationProgressionService {
  constructor(private applicationRepository: ApplicationRepository) {}

  async updateCandidateStage(id: number, applicationIdNumber: number, currentInterviewStep: number): Promise<Application> {
    try {
      const application = await this.applicationRepository.findOneByPositionCandidateId(applicationIdNumber, id);
      if (!application) {
        throw new NotFoundError('Application not found');
      }

      application.currentInterviewStep = currentInterviewStep;

      const updatedApplication = await this.applicationRepository.update(application);

      return updatedApplication;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Error updating candidate stage');
    }
  }
}