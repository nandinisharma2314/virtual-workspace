import { SetMetadata } from '@nestjs/common';
import { WorkspacePermission } from '../workspace-permissions.js';

export const PERMISSIONS_KEY = 'workspace_permissions';
export const RequirePermission = (...permissions: WorkspacePermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
