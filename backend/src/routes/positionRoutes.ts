import { getCandidatesByPosition, getInterviewFlowByPosition, getAllPositions, createPosition, deletePosition } from '../presentation/controllers/positionController';


const router = require('express').Router();

router.get('/', getAllPositions);
router.post('/', createPosition);
router.get('/:id/candidates', getCandidatesByPosition);
router.get('/:id/interviewflow', getInterviewFlowByPosition);
router.delete('/:id', deletePosition);

export default router;
