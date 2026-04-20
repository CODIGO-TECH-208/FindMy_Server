import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { uploadImage } from '../config/cloudinary.js';
import {
  getMyChats,
  getChatMessages,
  sendMessage,
  sendImageMessage
} from '../controllers/chat.js';

const router = express.Router();

router.get('/', verifyToken, getMyChats);
router.get('/:id/messages', verifyToken, getChatMessages);
router.post('/:id/messages', verifyToken, sendMessage);
router.post('/:id/messages/image', verifyToken, uploadImage.single('image'), sendImageMessage);

export default router;
