# Authorization Implementation: The "War Story" & Lessons Learned

This document serves as a detailed retrospective of the authorization implementation. It chronicles the challenges faced, the dead-ends encountered, and the solutions we engineered. Read this before refactoring or replicating the system.

## 1. The Architecture Challenge: Hybrid RBAC + ABAC
We needed to support:
- **RBAC**: `role` based access (Reader < Editor < Admin).
- **ABAC**: Attribute based access (Department Match, Ownership).
- **Exceptions**: Specific users needing specific rights (`user:ID`).

**Lesson**: Pure RBAC is rarely enough. Always design for ABAC from day one if you have "ownership" or "group" concepts.

## 2. Issues Encountered & Solutions

### A. Dependency Injection Hell (Circular Dependencies)
**The Problem**: Authorization requires User data. Users require Auth (JWT).
**Symptoms**: `Nest can't resolve dependencies of the UserModule (?). Please make sure that the argument JwtService at index [0] is available in the UserModule context.`
**Reflections**: We initially tried to just "use" the `AuthService` inside `UserModule`. This created a cycle.
**Solution**:
- We imported `JwtModule` directly into `UserModule` configuration with `registerAsync`/`register`, decoupling the specific *service* dependency while allowing `JwtAuthGuard` to work.
- **Takeaway**: When using Guards in a module, that module *must* have access to the providers used by the Guard (in this case, `JwtService`).

### B. The Failure of Generic Guards (`@RequirePermission`)
**The Problem**: We initially relied on a global `AuthzGuard`.
**Symptoms**: The guard worked for basic checks ("Can I read news?"), but failed for specific checks ("Can I edit *this* news?"). The Guard executes *before* the controller method, so it doesn't have access to the specific news item fetched from the DB. it only has the ID from the URL.
**Solution**: **Explicit Controller Checks**.
We pattern-matched the Controller methods:
1. `getOne(id)` -> Fetch data.
2. `checkPermission(user, resource, 'write')` -> Pass the *actual* fetched data to Casbin.
3. Proceed.
**Takeaway**: Generic Guards are strictly for global RBAC. Any data-dependent logic (ABAC) *must* live inside the business logic layer (Controller/Service).

### C. Casbin API Mismatch ("The Ghost Permissions")
**The Problem**: `enforcer.getImplicitPermissionsForUser('reader')` returned `[]` (empty).
**Analysis**: Our `model.conf` uses `p = role, res, ...`. Standard Casbin RBAC expects `p = sub, ...`. Because we renamed the first column to `role` (semantically correct for us), Casbin's high-level introspection API—which makes assumptions about standard RBAC—failed to map our policies.
**Solution**: **Manual Traversal**.
We wrote our own `getPermissionsForUser` method:
1. `getImplicitRolesForUser(role)`: This *did* work because `g` policies matched standard format.
2. `getFilteredPolicy(0, role)`: Query raw CSV policies by the first column.
3. Merge results.
**Takeaway**: When using custom Casbin models, trust the *low-level* APIs (`getFilteredPolicy`) over the high-level "magic" APIs.

### D. TypeScript Inference on Empty Arrays
**The Problem**: `const allPermissions = []`. TS inferred `never[]`.
**Symptoms**: `Argument of type 'string[]' is not assignable to parameter of type 'never'.`
**Solution**: Explicit typing: `const allPermissions: string[][] = [];`.
**Takeaway**: Always explicitly type arrays that start empty.

### E. Field-Level Authorization
**The Problem**: How to let a user update their *username* but not their *role* in the same `PUT` request?
**Dead Ends**: We considered separate endpoints (`PUT /user/:id/role`) or generic "ABAC" rules based on request body.
**Solution**: The **`write:sensitive`** Action.
- We check `write` permission for general updates.
- If the DTO contains sensitive fields (`roleId`, `departmentId`), we *additionally* check `write:sensitive`.
- This keeps the policy logic in `policy.conf` (`p, super-admin, ..., write:sensitive`) rather than hardcoding "Admin checks" in TypeScript.

### F. User-Specific Policies
**The Problem**: How to support `p, user:2, news, delete`?
**Solution**:
1. **Model Support**: Added `|| p.role == ("user:" + r.sub.id)` to the matcher.
2. **Frontend Support**: Updated `getPermissionsForUser` to specifically query `user:{id}` policies using `getFilteredPolicy(0, 'user:' + id)`.

## 3. Best Practices Checklist for Future Updates

1. **Verify Logic with "Super-Powers"**: To test if your Authorization logic actually works, give a weak user (Reader) a specific powerful permission (delete) via policy. If it works, your logic is valid.
2.  **Linting is tricky**: `Delete ·` errors usually mean indentation mixed (Tabs vs Spaces) or trailing whitespace. Use `eslint --fix` liberally.
3.  **Restarting**: Changing `policy.conf` usually requires a server restart or explicitly calling `enforcer.loadPolicy()`. Do not assume hot-reload works for `.conf` files.
