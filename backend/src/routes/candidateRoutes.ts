import { Router } from 'express';
import { addCandidate, getCandidateById, updateCandidateStageController } from '../presentation/controllers/candidateController';

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

router.post('/', async (req, res) => {
  try {
    const result = await addCandidate(req.body);
    res.status(201).send(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send({ message: error.message });
    } else {
      res.status(500).send({ message: "An unexpected error occurred" });
    }
  }
});

export default router;
