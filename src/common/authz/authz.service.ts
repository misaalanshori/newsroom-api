import { ForbiddenException, Injectable, OnModuleInit } from '@nestjs/common';
import { newEnforcer, Enforcer } from 'casbin';
import { PrismaAdapter } from 'casbin-prisma-adapter';
import * as path from 'path';
import type { AuthSubject, AuthResource, AuthAction } from './authz.types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthzService implements OnModuleInit {
  private enforcer: Enforcer;

  constructor(private readonly prisma: PrismaService) { }

  async onModuleInit() {
    const modelPath = path.resolve(process.cwd(), 'model.conf');
    // Use Prisma adapter with our existing PrismaClient instance
    const adapter = await PrismaAdapter.newAdapter(this.prisma);
    this.enforcer = await newEnforcer(modelPath, adapter);
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
  async getPermissionsForUser(role: string, userId?: number): Promise<any[]> {
    const inheritedRoles = await this.enforcer.getImplicitRolesForUser(role);
    const allRoles = [role, ...inheritedRoles];
    const allPermissions: string[][] = [];

    // 1. Get policies for roles
    for (const r of allRoles) {
      const policies = await this.enforcer.getFilteredPolicy(0, r);
      allPermissions.push(...policies);
    }

    // 2. Get policies for specific user (e.g. "user:1")
    if (userId) {
      const userPolicyName = `user:${userId}`;
      const userPolicies = await this.enforcer.getFilteredPolicy(
        0,
        userPolicyName,
      );
      allPermissions.push(...userPolicies);
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
