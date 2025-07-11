import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/AuthService';
import { AuthenticatedUser } from '../../shared/types/database';

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

const authService = new AuthService();

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const user = await authService.verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!req.user.permissions.includes(permission) && !req.user.roles.includes('Admin')) {
      res.status(403).json({
        error: 'Insufficient permissions',
        required: permission,
        current: req.user.permissions
      });
      return;
    }

    next();
  };
};

export const requireRole = (roles: string | string[]) => {
  const requiredRoles = Array.isArray(roles) ? roles : [roles];

  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const hasRole = requiredRoles.some(role => req.user!.roles.includes(role));
    if (!hasRole && !req.user.roles.includes('Admin')) {
      res.status(403).json({
        error: 'Insufficient role permissions',
        required: requiredRoles,
        current: req.user.roles
      });
      return;
    }

    next();
  };
};

export { AuthenticatedRequest };
