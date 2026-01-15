# Authorization Implementation Retrospective

This document captures the lessons learned during the implementation of the Hybrid RBAC & ABAC authorization system using Casbin in NestJS.

## 1. The Challenge
We needed a system that supports:
- **Role Hierarchy**: `super-admin` > `admin` > `editor` > `reader`.
- **Ownership/Scope**: Editors can only write their *own* news in their *department*.
- **Field-Level Security**: Only super-admins can change a user's role or department.
- **Frontend Awareness**: The UI needs to know what buttons to show/hide.

## 2. Key Issues & Solutions

### A. Casbin's "Implicit Permissions" Limitation
**Issue**: `enforcer.getImplicitPermissionsForUser(user)` returned empty results.
**Root Cause**: Our strict custom model defined `p = role, ...` but Casbin's RBAC API implicitly assumes `p = sub, ...` or failed to traverse our specific `g` policy graph correctly for leaf nodes.
**Solution**: We implemented **manual traversal**:
1. Get inherited roles: `enforcer.getImplicitRolesForUser(role)`.
2. Iterate through each role and fetch policies manually: `enforcer.getFilteredPolicy(0, role)`.
3. Combine results.

### B. Controller Logic vs. Guards
**Issue**: Initially, we relied on decorators `@RequirePermission('news', 'write')`. This failed for ABAC because generic guards don't know *which* specific news item is being accessed (to check ownership/dept).
**Solution**: **Explicit Controller Checks**.
We moved authorization *inside* the controller method:
```typescript
// 1. Fetch resource
const news = await service.findOne(id);
// 2. Check permission with ACTUAL data
await authz.checkPermission(user, { type: 'news', writer: news.writerId, ... }, 'write');
// 3. Proceed
```
**Takeaway**: Guards are good for global RBAC. Controllers are required for ABAC (data-dependent auth).

### C. Field-Level Authorization
**Issue**: How to allow a user to update their *username* but not their *role* in the same endpoint (`PUT /user/:id`)?
**Solution**: We introduced a specific action **`write:sensitive`**.
- Generic update? Check `write`.
- Updating `roleId`? Check `write:sensitive` (Only granted to `super-admin`).

### D. User-Specific Policies
**Issue**: We needed to allow specific exceptions (e.g., "User 2 can delete news").
**Solution**:
1. Support `user:ID` in the Casbin matcher: `p.role == ("user:" + r.sub.id)`.
2. Explicitly fetch these policies in `getPermissionsForUser` by querying `user:{id}`.

## 3. Future Considerations (Best Practices)

1.  **Keep the Model Simple**: Our matcher is complex. If logic grows, consider putting more logic into the App code rather than the `.conf` file.
2.  **Explicit > Implicit**: Don't rely on "magic" inheritance if you can't debug it easily. Our manual `getPermissionsForUser` is robust because it's explicit.
3.  **Frontend is for UX, Backend is for Security**: Never trust the `permissions` list sent to the frontend. Always re-verify in the backend.
4.  **Test with "Super-Powers"**: Verifying the system by giving a weak role a specific powerful permission (like we did with User 2) is an excellent way to prove the ABAC logic works.
