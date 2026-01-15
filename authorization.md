# Authorization System Documentation

This document outlines the Hybrid RBAC (Role-Based Access Control) + ABAC (Attribute-Based Access Control) system implemented using [Casbin](https://casbin.org/).

## 1. Overview
The system authorizes actions based on:
- **Role Hierarchy**: `super-admin` > `admin` > `editor` > `reader`.
- **Resource Ownership**: Users can primarily modify resources they created.
- **Department Scope**: Actions valid only within the user's department vs. global actions.
- **Field-Level Security**: Sensitive data (e.g., Role ID) requires higher privileges.

## 2. Configuration (`model.conf` & `policy.conf`)

### The Model (`model.conf`)
Our custom matcher enforces strict logic for every request.
```ini
[request_definition]
r = sub, obj, act  # Request: Subject (User), Object (Resource), Action

[policy_definition]
p = role, res, scope, own, act  # Policy: Role, Resource Type, Scope, Ownership, Action

[matchers]
m = (g(r.sub.role, p.role) || p.role == ("user:" + r.sub.id)) && \  # 1. Role Check (Inheritance OR Direct User)
    r.obj.type == p.res && \                                         # 2. Resource Type
    r.act == p.act && \                                              # 3. Action
    (p.scope == "global" || r.sub.department == r.obj.department) && \ # 4. Scope (Global or Same Dept)
    (p.own == "any" || r.sub.id == r.obj.writer)                       # 5. Ownership (Any or Own)
```

### The Policy (`policy.conf`)
Define *generic* rules for roles. Explicit user permissions (`user:ID`) block generic rules if needed.

| Role | Resource | Scope | Ownership | Action | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Reader** | News | Global | Any | `read` | Can read all news. |
| **Editor** | News | Dept | **Own** | `write` | Can write only their OWN news in their OWN dept. |
| **Admin** | News | Dept | **Any** | `write` | Can write ANY news in their OWN dept. |
| **Super Admin** | News | Global | Any | `write` | Can write ANY news globallly. |

**Field-Level Example:**
```csv
# Base write permission for non-sensitive fields
p, reader, user, global, own, write 

# Sensitive permission (required for Role/Dept changes)
p, super-admin, user, global, any, write:sensitive
```

## 3. Backend Implementation

### `AuthzService`
The central service for all checks.
- `enforce(subject, resource, action)`: Boolean check.
- `checkPermission(subject, resource, action)`: Helper that throws `ForbiddenException`.
- `getPermissionsForUser(role, userId)`: returns list of all allowed policies.

### Controller Usage
Authorizations are explicit and happen *inside* the method to leverage fetched data (ABAC).

```typescript
// Example: Updating a News Item
async update(@User() user, @Param('id') id) {
  const news = await this.newsService.findOne(id);
  
  // Check: Can 'user' 'write' to 'news' considering 'dept' and 'writer'?
  await this.authzService.checkPermission(
    { id: user.sub, role: user.role, department: user.departmentId },
    { type: 'news', department: news.departmentId, writer: news.writerId },
    'write'
  );
  
  return this.newsService.update(id, ...);
}
```

## 4. Frontend Integration

### Fetching Permissions
Call `GET /user/me` to retrieve the current user's active permissions.
```json
{
  "username": "testeditor",
  "permissions": [
    { "resource": "news", "action": "read", "scope": "global", "ownership": "any" },
    { "resource": "news", "action": "write", "scope": "department", "ownership": "own" }
  ]
}
```

### Handling Logic
Use these permissions to toggle UI elements. **Do not rely on this for security**—this is UX only. The backend validation is the source of truth.

**Example Logic:**
```javascript
const canEditNews = permissions.some(p => 
  p.resource === 'news' && 
  p.action === 'write'
);

if (canEditNews) {
  showEditButton();
}
```

**Scope/Ownership Hints:**
- If `scope: "department"`, the frontend knows "I can edit this, BUT only if it matches my department."
- If `ownership: "own"`, the frontend knows "I can edit this, BUT only if I created it."
