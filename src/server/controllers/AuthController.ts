import { Request, Response } from 'express';
import AuthService from '../services/AuthService';
import { AuthenticatedRequest } from '../middleware/auth';

class AuthController {
  private authService = new AuthService();

  login = async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      const result = await this.authService.authenticateLocal({ username, password });
      res.status(200).json(result);
    } catch (error) {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  };

  microsoftLogin = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const result = await this.authService.authenticateMicrosoft(token);
      res.status(200).json(result);
    } catch (error) {
      res.status(401).json({ error: 'Microsoft authentication failed' });
    }
  };

  refreshToken = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      const result = await this.authService.refreshToken(refreshToken);
      res.status(200).json(result);
    } catch (error) {
      res.status(403).json({ error: 'Invalid refresh token' });
    }
  };

  logout = async (req: AuthenticatedRequest, res: Response) => {
    if (req.user) {
      await this.authService.logout(req.user.sessionId);
    }
    res.status(204).end();
  };

  verifyToken = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({ user: req.user });
  };
}

export default AuthController;
