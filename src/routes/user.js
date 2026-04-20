import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { uploadImage } from '../config/cloudinary.js';
import {
  getProfile,
  updateProfile,
  getNotifications
} from '../controllers/user.js';

const router = express.Router();

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, uploadImage.single('profilePicture'), updateProfile);
router.get('/notifications', verifyToken, getNotifications);

export default router;
