import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../../shared';

export interface AuthenticatedRequest extends Request {
  userRole?: UserRole;
  userName?: string;
}

export const roleHierarchy: Record<UserRole, number> = {
  ADMIN: 100,
  DISASTER_MANAGER: 80,
  FIELD_COORDINATOR: 60,
  RESOURCE_MANAGER: 60,
  MEDICAL_COORDINATOR: 60,
  LOGISTICS_COORDINATOR: 60,
  ANALYST: 40,
  VIEWER: 10
};

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Read from header or default to DISASTER_MANAGER for smooth demonstration
    const roleHeader = (req.headers['x-user-role'] as UserRole) || 'DISASTER_MANAGER';
    req.userRole = roleHeader;
    req.userName = (req.headers['x-user-name'] as string) || 'Authorized Emergency Operator';

    if (allowedRoles.includes(roleHeader) || roleHeader === 'ADMIN') {
      return next();
    }

    return res.status(403).json({
      error: 'Permission Denied',
      message: `Your active role (${roleHeader}) does not have permission to execute this emergency action. Allowed roles: ${allowedRoles.join(', ')}.`
    });
  };
}
