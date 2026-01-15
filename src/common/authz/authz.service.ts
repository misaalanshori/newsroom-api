import { ForbiddenException, Injectable, OnModuleInit } from '@nestjs/common';
import { newEnforcer, Enforcer } from 'casbin';
import * as path from 'path';
import type { AuthSubject, AuthResource, AuthAction } from './authz.types';

@Injectable()
export class AuthzService implements OnModuleInit {
  private enforcer: Enforcer;

  async onModuleInit() {
    const modelPath = path.resolve(process.cwd(), 'model.conf');
    const policyPath = path.resolve(process.cwd(), 'policy.conf');
    this.enforcer = await newEnforcer(modelPath, policyPath);
  }

  /**
   * Check permission and throw ForbiddenException if denied
   */
  async checkPermission(
    subject: AuthSubject,
    resource: AuthResource,
    action: AuthAction,
  ): Promise<void> {
    const allowed = await this.enforce(subject, resource, action);
    if (!allowed) {
      throw new ForbiddenException(
        `Access denied: cannot ${action} this ${resource.type} resource`,
      );
    }
  }

  /**
   * Check if a subject can perform an action on a resource
   */
  async enforce(
    subject: AuthSubject,
    resource: AuthResource,
    action: AuthAction,
  ): Promise<boolean> {
    return this.enforcer.enforce(subject, resource, action);
  }

  /**
   * Get all permissions allowed for a user role
   */
  async getPermissionsForUser(role: string): Promise<any[]> {
    const inheritedRoles = await this.enforcer.getImplicitRolesForUser(role);
    const allRoles = [role, ...inheritedRoles];
    const allPermissions: string[][] = [];

    for (const r of allRoles) {
      const policies = await this.enforcer.getFilteredPolicy(0, r);
      allPermissions.push(...policies);
    }

    // Mapping based on policy.conf format:
    // p, role, resource, scope, ownership, action
    return allPermissions.map((p) => ({
      resource: p[1],
      scope: p[2],
      ownership: p[3],
      action: p[4],
    }));
  }

  /**
   * Get the raw enforcer for advanced use cases
   */
  getEnforcer(): Enforcer {
    return this.enforcer;
  }
}
