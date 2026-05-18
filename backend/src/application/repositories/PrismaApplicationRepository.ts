import { Application } from '../../domain/models/Application';
import { ApplicationRepository } from './ApplicationRepository';
import { prisma } from '../../database/prisma';
import { NotFoundError } from '../errors/AppError';

export class PrismaApplicationRepository implements ApplicationRepository {
  async findOne(id: number): Promise<Application | null> {
    const data = await prisma.application.findUnique({
      where: { id },
    });
    if (!data) return null;
    return new Application(data);
  }

  async findOneByPositionCandidateId(applicationId: number, candidateId: number): Promise<Application | null> {
    const data = await prisma.application.findFirst({
      where: {
        id: applicationId,
        candidateId: candidateId
      }
    });
    if (!data) return null;
    return new Application(data);
  }

  async update(application: Application): Promise<Application> {
    const applicationData: any = {
      positionId: application.positionId,
      candidateId: application.candidateId,
      applicationDate: application.applicationDate,
      currentInterviewStep: application.currentInterviewStep,
      notes: application.notes,
    };

    const result = await prisma.application.update({
      where: { id: application.id },
      data: applicationData,
    });
    return new Application(result);
  }
}