import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const existing = await prisma.company.findMany({ where: { name: { startsWith: 'E2E ' } } });
  if (existing.length > 0) {
    const list = existing.map((c) => `  id=${c.id} name="${c.name}"`).join('\n');
    throw new Error(
      `E2E seed aborted: stale/partial E2E company records already exist in the database.\n` +
      `Run the teardown script (prisma migrate reset or a dedicated cleanup) before re-seeding.\n` +
      `Found records:\n${list}`,
    );
  }

  const company = await prisma.company.create({ data: { name: 'E2E LTI' } });

  const employee = await prisma.employee.create({
    data: {
      companyId: company.id,
      name: 'E2E Alice Johnson',
      email: 'e2e-alice.johnson@lti.com',
      role: 'Recruiter',
      isActive: true,
    },
  });

  const hrType = await prisma.interviewType.create({
    data: { name: 'E2E HR Interview', description: 'E2E human resources screening' },
  });
  const techType = await prisma.interviewType.create({
    data: { name: 'E2E Technical Interview', description: 'E2E technical assessment' },
  });
  const mgrType = await prisma.interviewType.create({
    data: { name: 'E2E Manager Interview', description: 'E2E manager review' },
  });

  const flow = await prisma.interviewFlow.create({
    data: { description: 'E2E standard interview process' },
  });

  const step1 = await prisma.interviewStep.create({
    data: {
      interviewFlowId: flow.id,
      interviewTypeId: hrType.id,
      name: 'Initial Screening',
      orderIndex: 1,
    },
  });
  const step2 = await prisma.interviewStep.create({
    data: {
      interviewFlowId: flow.id,
      interviewTypeId: techType.id,
      name: 'Technical Interview',
      orderIndex: 2,
    },
  });
  await prisma.interviewStep.create({
    data: {
      interviewFlowId: flow.id,
      interviewTypeId: mgrType.id,
      name: 'Manager Interview',
      orderIndex: 3,
    },
  });

  const position = await prisma.position.create({
    data: {
      companyId: company.id,
      interviewFlowId: flow.id,
      title: 'E2E Senior Full-Stack Engineer',
      description: 'E2E test position',
      status: 'Open',
      isVisible: true,
      location: 'Remote',
      jobDescription: 'E2E job description',
    },
  });

  // Candidate names are intentionally distinct from the regular seed (no John Doe / Jane Smith / Carlos García).
  // The feature file uses those names as scenario labels; fixtures.ts maps them to these candidates by DB ID.
  const candidateAlice = await prisma.candidate.create({
    data: {
      firstName: 'E2E Alice',
      lastName: 'Brown',
      email: 'e2e-alice.brown@gmail.com',
      phone: '600000001',
      address: 'E2E Address 1',
    },
  });
  const candidateBob = await prisma.candidate.create({
    data: {
      firstName: 'E2E Bob',
      lastName: 'Chen',
      email: 'e2e-bob.chen@gmail.com',
      phone: '600000002',
      address: 'E2E Address 2',
    },
  });
  const candidateMia = await prisma.candidate.create({
    data: {
      firstName: 'E2E Mia',
      lastName: 'Tanaka',
      email: 'e2e-mia.tanaka@gmail.com',
      phone: '600000003',
      address: 'E2E Address 3',
    },
  });

  await prisma.application.create({
    data: {
      positionId: position.id,
      candidateId: candidateAlice.id,
      applicationDate: new Date('2024-01-01'),
      currentInterviewStep: step2.id,
    },
  });
  await prisma.application.create({
    data: {
      positionId: position.id,
      candidateId: candidateBob.id,
      applicationDate: new Date('2024-01-02'),
      currentInterviewStep: step2.id,
    },
  });
  await prisma.application.create({
    data: {
      positionId: position.id,
      candidateId: candidateMia.id,
      applicationDate: new Date('2024-01-03'),
      currentInterviewStep: step1.id,
    },
  });

  void employee; // employee created for FK completeness, interviews not required for E2E scenarios

  console.log('E2E seed complete.');
  console.log(`  Company:  ${company.name} (id=${company.id})`);
  console.log(`  Position: ${position.title} (id=${position.id})`);
  console.log(`  Candidates: ${candidateAlice.firstName} ${candidateAlice.lastName}, ${candidateBob.firstName} ${candidateBob.lastName}, ${candidateMia.firstName} ${candidateMia.lastName}`);
}

main()
  .catch((err) => {
    console.error('E2E seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
