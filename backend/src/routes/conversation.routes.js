import express from 'express';
import {
  getConversations,
  createConversation,
  getConversationMessages,
  closeConversation,
} from '../controllers/conversation.controller.js';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateJWT);

router.get('/', getConversations);
router.post('/', requireRole('client'), createConversation);
router.get('/:id/messages', getConversationMessages);
router.patch('/:id/close', requireRole('agent'), closeConversation);

export default router;
