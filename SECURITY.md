# Security Implementation

This document describes the authentication and authorization security measures implemented in the e-commerce dashboard.

## Overview

The application implements a multi-layered security approach:
1. **Edge Middleware** - Protects routes at the Next.js edge level
2. **Server-side API Guards** - Validates sessions and permissions in API handlers
3. **Client-side Route Protection** - Redirects unauthorized users on the frontend
4. **Role-based Access Control** - Restricts features based on user roles

## Authentication Flow

### NextAuth.js Configuration
- Located in `src/lib/auth.ts`
- Uses credential-based authentication
- Session management with JWT tokens
- User roles: `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `STAFF`, `VIEWER`

### Environment Variables Required
```bash
NEXTAUTH_SECRET=your-long-random-secret-here
NEXTAUTH_URL=http://localhost:3000  # or your production URL
DATABASE_URL=your-database-connection-string
```

## Route Protection

### 1. Edge Middleware (`src/middleware.ts`)
Protects all routes at the edge level before they reach the application:

**Protected Routes:**
- `/dashboard/*` - Redirects to `/auth/signin` if unauthenticated
- `/api/*` - Returns 401 JSON if unauthenticated

**Allowed Routes:**
- `/api/auth/*` - NextAuth endpoints (signin, signout, callbacks)
- `/_next/*` - Next.js static assets
- `/static/*`, `/public/*` - Public assets
- `/favicon.ico` - Favicon

**Example unauthorized response:**
```json
{
  "error": "Unauthorized",
  "message": "กรุณาเข้าสู่ระบบก่อนดำเนินการ"
}
```

### 2. API Route Protection
Most API routes use one of these patterns:

**Pattern 1: Direct session check**
```typescript
const session = await getServerSession(authOptions)
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

**Pattern 2: Permission-based check**
```typescript
import { checkPermission } from '@/lib/permission-middleware'

const permissionCheck = await checkPermission('USERS', 'READ')
if (!permissionCheck.success) {
  return NextResponse.json({ error: 'Forbidden', message: permissionCheck.message }, { status: 403 })
}
```

### 3. Page-level Protection
Client-side pages implement redirects and permission checks:

```typescript
// Example from dashboard pages
useEffect(() => {
  if (status === 'loading') return
  if (!session) {
    router.push('/auth/signin')
  } else if (!allowedRoles.includes(session.user?.role)) {
    router.push('/dashboard/unauthorized')
  }
}, [session, status, router])
```

## Role-based Access Control

### User Roles (Hierarchy)
1. **SUPER_ADMIN** - Full system access, can manage settings
2. **ADMIN** - Can manage users, products, orders
3. **MANAGER** - Can view reports, manage inventory
4. **STAFF** - Can process orders, view customers
5. **VIEWER** - Read-only access to most data

### Special Access Rules

#### Settings Page (`/dashboard/settings`)
- **Access:** SUPER_ADMIN only
- **Protection:** 
  - API endpoint (`/api/settings`) returns 403 for non-SUPER_ADMIN
  - Page renders access denied message for unauthorized users
  - Sidebar link only visible to SUPER_ADMIN

#### Permission Helper (`src/lib/permissions.ts`)
The `canAccess()` function determines if a role can perform an action on a resource.

#### Sidebar Navigation
The sidebar automatically filters navigation items based on user permissions:
- Standard permissions checked via `canAccess()`
- Special case: `superadmin.only` permission requires `SUPER_ADMIN` role

## Testing Authentication

### Manual Testing Commands

1. **Start development server:**
```bash
bun dev
```

2. **Test unauthenticated access:**
```bash
# Should redirect to signin
curl -i http://localhost:3000/dashboard

# Should return 401
curl -i http://localhost:3000/api/users
```

3. **Test settings access (requires SUPER_ADMIN):**
```bash
# Should return 403 for non-SUPER_ADMIN users
curl -i http://localhost:3000/api/settings
```

### Expected Behaviors

| User Type | Dashboard Access | API Access | Settings Access |
|-----------|-----------------|------------|-----------------|
| Unauthenticated | Redirect to signin | 401 Error | Redirect to signin |
| VIEWER | ✅ Limited | ✅ Read-only | ❌ 403 Forbidden |
| STAFF | ✅ Standard | ✅ Standard | ❌ 403 Forbidden |
| ADMIN | ✅ Full | ✅ Full | ❌ 403 Forbidden |
| SUPER_ADMIN | ✅ Full | ✅ Full | ✅ Full Access |

## Security Best Practices Implemented

1. **Defense in Depth:** Multiple layers of protection (middleware + API + client)
2. **Principle of Least Privilege:** Users only see what they're authorized to access
3. **Secure by Default:** All routes require authentication unless explicitly allowed
4. **Session Management:** Proper JWT token validation and expiration
5. **Error Handling:** Consistent error responses without information leakage

## Customization

### Adding New Protected Routes
To protect new routes, they're automatically covered by the middleware pattern. For API routes requiring specific permissions:

```typescript
// Add to API route handler
import { requireSuperAdmin } from '@/lib/permission-middleware'

const adminCheck = await requireSuperAdmin()
if (!adminCheck.success) {
  return NextResponse.json({ error: 'Forbidden', message: adminCheck.message }, { status: 403 })
}
```

### Whitelisting Public Routes
To allow public access to specific routes, update `src/middleware.ts`:

```typescript
// Add your public routes here
if (pathname.startsWith('/public-api') || pathname === '/health') {
  return NextResponse.next()
}
```

### Adjusting Role Permissions
Update the permission logic in `src/lib/permissions.ts` to modify what each role can access.

## Security Considerations

- Keep `NEXTAUTH_SECRET` secure and rotate regularly
- Monitor failed authentication attempts
- Implement rate limiting for production
- Use HTTPS in production
- Regularly audit user permissions
- Log security events for monitoring

## Emergency Access

In case of lockout, you can:
1. Access the database directly to promote a user to SUPER_ADMIN
2. Use the `/api/test-db` endpoint to verify admin user exists (requires authentication)
3. Check the user table in your database management tool