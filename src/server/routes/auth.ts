import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

router.post('/login', authController.login);
router.post('/microsoft', authController.microsoftLogin);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticateToken, authController.logout);
router.get('/verify', authenticateToken, authController.verifyToken);

export default router;
