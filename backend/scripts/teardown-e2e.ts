import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const e2eCompanies = await prisma.company.findMany({
    where: { name: { startsWith: 'E2E ' } },
    select: { id: true },
  });
  const e2eEmployees = await prisma.employee.findMany({
    where: { email: { startsWith: 'e2e-' } },
    select: { id: true },
  });
  const e2eCandidates = await prisma.candidate.findMany({
    where: { email: { startsWith: 'e2e-' } },
    select: { id: true },
  });
  const e2eFlows = await prisma.interviewFlow.findMany({
    where: { description: { startsWith: 'E2E ' } },
    select: { id: true },
  });
  const e2eTypes = await prisma.interviewType.findMany({
    where: { name: { startsWith: 'E2E ' } },
    select: { id: true },
  });
  const e2ePositions = await prisma.position.findMany({
    where: { title: { startsWith: 'E2E ' } },
    select: { id: true },
  });

  const companyIds = e2eCompanies.map((c) => c.id);
  const employeeIds = e2eEmployees.map((e) => e.id);
  const candidateIds = e2eCandidates.map((c) => c.id);
  const flowIds = e2eFlows.map((f) => f.id);
  const typeIds = e2eTypes.map((t) => t.id);
  const positionIds = e2ePositions.map((p) => p.id);

  const e2eSteps = await prisma.interviewStep.findMany({
    where: { interviewFlowId: { in: flowIds } },
    select: { id: true },
  });
  const stepIds = e2eSteps.map((s) => s.id);

  const e2eApplications = await prisma.application.findMany({
    where: { OR: [{ candidateId: { in: candidateIds } }, { positionId: { in: positionIds } }] },
    select: { id: true },
  });
  const applicationIds = e2eApplications.map((a) => a.id);

  // 1. Interviews (depends on Application, InterviewStep, Employee)
  await prisma.interview.deleteMany({
    where: {
      OR: [
        { applicationId: { in: applicationIds } },
        { interviewStepId: { in: stepIds } },
        { employeeId: { in: employeeIds } },
      ],
    },
  });

  // 2. Applications (depends on Position, Candidate, InterviewStep)
  await prisma.application.deleteMany({
    where: { OR: [{ candidateId: { in: candidateIds } }, { positionId: { in: positionIds } }] },
  });

  // 3. InterviewSteps (depends on InterviewFlow, InterviewType)
  await prisma.interviewStep.deleteMany({ where: { interviewFlowId: { in: flowIds } } });

  // 4. Positions (depends on Company, InterviewFlow)
  await prisma.position.deleteMany({ where: { id: { in: positionIds } } });

  // 5. Employees (depends on Company)
  await prisma.employee.deleteMany({ where: { id: { in: employeeIds } } });

  // 6. Resume, Education, WorkExperience (depends on Candidate)
  await prisma.resume.deleteMany({ where: { candidateId: { in: candidateIds } } });
  await prisma.education.deleteMany({ where: { candidateId: { in: candidateIds } } });
  await prisma.workExperience.deleteMany({ where: { candidateId: { in: candidateIds } } });

  // 7. Candidates
  await prisma.candidate.deleteMany({ where: { id: { in: candidateIds } } });

  // 8. InterviewFlows
  await prisma.interviewFlow.deleteMany({ where: { id: { in: flowIds } } });

  // 9. InterviewTypes
  await prisma.interviewType.deleteMany({ where: { id: { in: typeIds } } });

  // 10. Companies
  await prisma.company.deleteMany({ where: { id: { in: companyIds } } });

  console.log('E2E teardown complete.');
}

main()
  .catch((err) => {
    console.error('E2E teardown failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
