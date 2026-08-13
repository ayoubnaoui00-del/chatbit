import express from 'express';
import { getMe } from '../controllers/user.controller.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/me', authenticateJWT, getMe);

export default router;
