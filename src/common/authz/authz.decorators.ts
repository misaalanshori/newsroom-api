import { SetMetadata } from '@nestjs/common';
import type { AuthAction } from './authz.types';

export const AUTHZ_RESOURCE_KEY = 'authz_resource';
export const AUTHZ_ACTION_KEY = 'authz_action';

/**
 * Decorator to specify required resource type and action for a route
 * @param resource - Resource type (e.g., 'news', 'department')
 * @param action - Action type ('read' or 'write')
 */
export const RequirePermission = (resource: string, action: AuthAction) => {
  return (
    target: object,
    key?: string | symbol,
    descriptor?: PropertyDescriptor,
  ) => {
    SetMetadata(AUTHZ_RESOURCE_KEY, resource)(target, key!, descriptor!);
    SetMetadata(AUTHZ_ACTION_KEY, action)(target, key!, descriptor!);
  };
};
