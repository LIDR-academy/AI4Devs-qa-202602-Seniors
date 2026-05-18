import { Application } from '../../domain/models/Application';

export interface ApplicationRepository {
  findOne(id: number): Promise<Application | null>;
  findOneByPositionCandidateId(applicationId: number, candidateId: number): Promise<Application | null>;
  update(application: Application): Promise<Application>;
}