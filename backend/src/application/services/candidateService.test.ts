import { CandidateService } from './candidateService';
import { ValidationError, DuplicateEmailError, NotFoundError } from '../errors/AppError';
import { CandidateRepository } from '../repositories/CandidateRepository';
import { Application } from '../../domain/models/Application';

describe('CandidateService', () => {
  let mockRepository: jest.Mocked<CandidateRepository>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
    };
  });

  describe('addCandidate', () => {
    it('should add candidate successfully with valid data', async () => {
      const candidateData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '612345678',
      };

      const savedCandidate = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '612345678',
        address: undefined,
        educations: [],
        workExperiences: [],
        resumes: [],
        applications: [],
      };

      mockRepository.save.mockResolvedValue(savedCandidate as any);

      const service = new CandidateService(mockRepository);
      const result = await service.addCandidate(candidateData);

      expect(result).toEqual(savedCandidate);
      expect(mockRepository.save).toHaveBeenCalledWith(candidateData);
    });

    it('should throw ValidationError for invalid firstName', async () => {
      const candidateData = {
        firstName: 'J', // too short
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      const service = new CandidateService(mockRepository);
      await expect(service.addCandidate(candidateData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid email', async () => {
      const candidateData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
      };

      const service = new CandidateService(mockRepository);
      await expect(service.addCandidate(candidateData)).rejects.toThrow(ValidationError);
    });

    it('should throw DuplicateEmailError on email conflict', async () => {
      const candidateData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      mockRepository.save.mockRejectedValue(new DuplicateEmailError('The email already exists in the database'));

      const service = new CandidateService(mockRepository);
      await expect(service.addCandidate(candidateData)).rejects.toThrow(DuplicateEmailError);
    });
  });

  describe('findCandidateById', () => {
    it('should return candidate when found', async () => {
      const candidate = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        educations: [],
        workExperiences: [],
        resumes: [],
        applications: [],
      };

      mockRepository.findOne.mockResolvedValue(candidate as any);

      const service = new CandidateService(mockRepository);
      const result = await service.findCandidateById(1);

      expect(result).toEqual(candidate);
      expect(mockRepository.findOne).toHaveBeenCalledWith(1);
    });

    it('should return null when candidate not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const service = new CandidateService(mockRepository);
      const result = await service.findCandidateById(999);

      expect(result).toBeNull();
    });
  });

  describe('updateCandidateStage', () => {
    it('should throw NotFoundError when application not found', async () => {
      jest.spyOn(Application, 'findOneByPositionCandidateId').mockResolvedValue(null as any);
      const service = new CandidateService(mockRepository);
      await expect(service.updateCandidateStage(1, 999, 2)).rejects.toThrow(NotFoundError);
    });
  });
});