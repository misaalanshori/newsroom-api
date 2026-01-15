/**
 * Authorization Types for Casbin RBAC+ABAC
 */

/**
 * Actions that can be performed on resources
 */
export type AuthAction = 'read' | 'write';

/**
 * Subject (user) context for authorization.
 * Decoupled from User entity - contains only what Casbin needs.
 */
export interface AuthSubject {
  id: number;
  role: string;
  department: number;
}

/**
 * Resource context for authorization.
 * Decoupled from entity - contains only what Casbin needs.
 */
export interface AuthResource {
  type: string;
  department?: number;
  writer?: number;
}
