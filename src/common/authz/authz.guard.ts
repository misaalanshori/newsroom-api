import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthzService } from './authz.service';
import { AUTHZ_RESOURCE_KEY, AUTHZ_ACTION_KEY } from './authz.decorators';
import type { AuthSubject, AuthResource, AuthAction } from './authz.types';

/**
 * Guard that enforces Casbin authorization
 * Requires @RequirePermission decorator on the route
 * Requires a resourceResolver to be set via setResourceResolver()
 */
@Injectable()
export class AuthzGuard implements CanActivate {
  constructor(
    private authzService: AuthzService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resourceType = this.reflector.get<string>(
      AUTHZ_RESOURCE_KEY,
      context.getHandler(),
    );
    const action = this.reflector.get<AuthAction>(
      AUTHZ_ACTION_KEY,
      context.getHandler(),
    );

    // If no permission decorator, allow (no authz required for this route)
    if (!resourceType || !action) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user: { sub: number; role: string; departmentId: number };
      authResource?: AuthResource;
    }>();

    const user = request.user;
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Build subject from JWT payload
    const subject: AuthSubject = {
      id: user.sub,
      role: user.role,
      department: user.departmentId,
    };

    // Get resource from request (set by controller or interceptor)
    // For list/create operations, use a minimal resource object
    const resource: AuthResource = request.authResource ?? {
      type: resourceType,
      department: undefined,
      writer: undefined,
    };

    // Ensure resource type matches decorator
    resource.type = resourceType;

    const allowed = await this.authzService.enforce(subject, resource, action);
    if (!allowed) {
      throw new ForbiddenException(
        `Access denied: cannot ${action} ${resourceType}`,
      );
    }

    return true;
  }
}
