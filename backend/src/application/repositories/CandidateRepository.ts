import { Candidate } from '../../domain/models/Candidate';

export interface CandidateRepository {
  save(candidateData: any): Promise<Candidate>;
  findOne(id: number): Promise<Candidate | null>;
}