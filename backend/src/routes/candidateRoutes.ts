import { Router } from 'express';
import { addCandidateController, getCandidateById, updateCandidateStageController } from '../presentation/controllers/candidateController';

const router = Router();

router.get('/', async (req, res) => {
  try {
    res.status(200).json({ message: 'Candidate routes working' });
  } catch (error) {
    res.status(500).send({ message: "An unexpected error occurred" });
  }
});

router.get('/:id', getCandidateById);

router.put('/:id', updateCandidateStageController);

router.post('/', addCandidateController);

export default router;