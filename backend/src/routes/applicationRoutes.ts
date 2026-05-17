import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { candidateId, positionId, currentInterviewStep } = req.body;

    const application = await prisma.application.create({
      data: {
        candidateId: parseInt(candidateId),
        positionId: parseInt(positionId),
        currentInterviewStep: parseInt(currentInterviewStep),
        applicationDate: new Date(),
      },
    });

    res.status(201).json({ message: 'Application created successfully', data: application });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: 'Error creating application', error: error.message });
    } else {
      res.status(500).json({ message: 'Error creating application', error: String(error) });
    }
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.application.delete({
      where: { id },
    });
    res.status(200).json({ message: 'Application deleted successfully' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Error deleting application', error: error.message });
    } else {
      res.status(500).json({ message: 'Error deleting application', error: String(error) });
    }
  }
});

export default router;
