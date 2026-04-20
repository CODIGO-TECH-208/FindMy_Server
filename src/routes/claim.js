import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  submitClaim,
  getMyClaims,
  getReceivedClaims,
  acceptClaim,
  rejectClaim
} from '../controllers/claim.js';

const router = express.Router();

router.post('/', verifyToken, submitClaim);
router.get('/my-claims', verifyToken, getMyClaims);
router.get('/received', verifyToken, getReceivedClaims);
router.put('/:id/accept', verifyToken, acceptClaim);
router.put('/:id/reject', verifyToken, rejectClaim);

export default router;
