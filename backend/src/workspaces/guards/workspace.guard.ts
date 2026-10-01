import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WorkspacesService } from '../workspaces.service.js';
import { PERMISSIONS_KEY } from '../decorators/require-permission.decorator.js';
import { WorkspacePermission } from '../workspace-permissions.js';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    const rawWsId =
      request.headers['x-workspace-id'] ||
      request.query.workspaceId ||
      request.params.workspaceId ||
      request.params.id;

    if (!rawWsId || isNaN(Number(rawWsId))) {
      // If no workspace is provided in request, check if permissions are required
      const requiredPermissions = this.reflector.getAllAndOverride<WorkspacePermission[]>(
        PERMISSIONS_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (requiredPermissions && requiredPermissions.length > 0) {
        throw new ForbiddenException('Workspace context (x-workspace-id) is required');
      }
      return true;
    }

    const workspaceId = Number(rawWsId);

    const userAuth = await this.workspacesService.getUserPermissionsInWorkspace(
      user.sub,
      workspaceId,
    );

    request.workspace = {
      id: workspaceId,
      ...userAuth,
    };

    const requiredPermissions = this.reflector.getAllAndOverride<WorkspacePermission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    if (userAuth.isOwner) {
      return true;
    }

    const hasAll = requiredPermissions.every((perm) => userAuth.permissions.includes(perm));
    if (!hasAll) {
      throw new ForbiddenException(
        `Insufficient workspace permissions. Required: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
