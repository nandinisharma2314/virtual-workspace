import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { DatabaseService } from '../../database/database.service.js';
import { users } from '../../database/schema.js';
import { eq } from 'drizzle-orm';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private dbService: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Insufficient permissions: Authentication required');
    }

    let userRoleLower = (user.role || '').toLowerCase();

    // Check against required roles from token
    let hasRole = requiredRoles.some(
      (role) => role.toLowerCase() === userRoleLower,
    );

    // If not satisfied from token payload, verify live role from DB
    // to handle role promotions without requiring re-login
    if (!hasRole && user.sub) {
      const [dbUser] = await this.dbService.db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, user.sub))
        .limit(1);

      if (dbUser?.role) {
        userRoleLower = dbUser.role.toLowerCase();
        hasRole = requiredRoles.some(
          (role) => role.toLowerCase() === userRoleLower,
        );
      }
    }

    if (!hasRole) {
      throw new ForbiddenException(
        `Insufficient permissions: Requires ${requiredRoles.join(' or ')}`,
      );
    }

    return true;
  }
}
