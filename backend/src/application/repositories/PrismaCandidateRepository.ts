import { Candidate } from '../../domain/models/Candidate';
import { CandidateRepository } from './CandidateRepository';
import { prisma } from '../../database/prisma';
import { DuplicateEmailError, NotFoundError } from '../errors/AppError';
import { Prisma } from '@prisma/client';

export class PrismaCandidateRepository implements CandidateRepository {
  async save(candidateData: any): Promise<Candidate> {
    try {
      const candidate = new Candidate(candidateData);

      const candidateResult = await prisma.candidate.create({
        data: {
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          phone: candidate.phone,
          address: candidate.address,
          educations: candidate.educations.length > 0 ? {
            create: candidate.educations.map(edu => ({
              institution: edu.institution,
              title: edu.title,
              startDate: edu.startDate,
              endDate: edu.endDate
            }))
          } : undefined,
          workExperiences: candidate.workExperiences.length > 0 ? {
            create: candidate.workExperiences.map(exp => ({
              company: exp.company,
              position: exp.position,
              description: exp.description,
              startDate: exp.startDate,
              endDate: exp.endDate
            }))
          } : undefined,
          resumes: candidate.resumes.length > 0 ? {
            create: candidate.resumes.map(resume => ({
              filePath: resume.filePath,
              fileType: resume.fileType,
              uploadDate: new Date()
            }))
          } : undefined
        }
      });

      return new Candidate(candidateResult);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new DuplicateEmailError('The email already exists in the database');
      }
      throw error;
    }
  }

  async findOne(id: number): Promise<Candidate | null> {
    const data = await prisma.candidate.findUnique({
      where: { id },
      include: {
        educations: true,
        workExperiences: true,
        resumes: true,
        applications: {
          include: {
            position: {
              select: {
                id: true,
                title: true
              }
            },
            interviews: {
              select: {
                interviewDate: true,
                interviewStep: {
                  select: {
                    name: true
                  }
                },
                notes: true,
                score: true
              }
            }
          }
        }
      }
    });

    if (!data) return null;
    return new Candidate(data);
  }
}