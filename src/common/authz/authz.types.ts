/**
 * Authorization Types for Casbin RBAC+ABAC
 */

/**
 * Actions that can be performed on resources
 * - create: POST (new resource)
 * - read: GET (view resource)
 * - update: PUT/PATCH (modify resource)
 * - delete: DELETE (remove resource)
 * - update:sensitive: Modify sensitive fields (e.g., roleId, departmentId)
 */
export type AuthAction = 'create' | 'read' | 'update' | 'delete' | 'update:sensitive';

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
