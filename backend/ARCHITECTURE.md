# Site Pilot Multi-Tenant Backend Architecture

## Overview

The backend is now fully multi-tenant with hierarchical structure:

```
TENANT (Organization)
  ├── BRANDING (tenant-level, admin-only modification)
  ├── USERS (admin & editor roles)
  │   ├── Admin: Can manage branding, users, view all projects
  │   └── Editor: Can only create/view their own projects, generate websites
  └── PROJECTS (per-user, contain versions)
      └── VERSIONS (immutable snapshots of generated HTML)
```

---

## Key Features

### 1. Multi-Tenancy
- **Tenant** = Organization/Company
- One or more **Users** per Tenant
- **Branding** is shared across entire Tenant (single instance)
- **Projects** are per-User but visible to Admins

### 2. Role-Based Access Control (RBAC)
- **Admin**: Create/delete users, modify branding, manage tenant settings, view all projects
- **Editor**: Create projects, generate websites, view only own projects

### 3. Branding Management
- **Tenant-Level**: One branding document per tenant
- **Admin-Only Modification**: Only admins can update colors, 
fonts, logo, images, services
- **Shared Resources**: All projects in the tenant use the same branding

### 4. Project & Generation Flow
1. User (editor or admin) creates a Project
2. Admin sets up Branding (colors, fonts, logo, services)
3. User generates website via AI (Gemini) using the prompt
4. Each generation creates a new immutable Version
5. User can rollback to previous versions

---

## Database Schemas

### Tenant
```javascript
{
  _id: ObjectId,
  name: String,              // "Acme Corp"
  slug: String,              // "acme-corp" (unique)
  description: String,
  logo: String,              // Cloudinary URL
  ownerUserId: ObjectId,     // ref: User (first admin)
  status: 'active' | 'inactive',
  createdAt, updatedAt
}
```

### User
```javascript
{
  _id: ObjectId,
  name: String,              // "John Doe"
  email: String,             // "john@acme.com" (unique per tenant)
  password: String,          // bcrypt hashed
  tenantId: ObjectId,        // ref: Tenant (required)
  role: 'editor' | 'admin',  // default: 'editor'
  avatar: String,
  createdAt, updatedAt
}
```

### Branding (Tenant-Level)
```javascript
{
  _id: ObjectId,
  tenantId: ObjectId,        // ref: Tenant (unique - one per tenant)
  companyName: String,
  companyDescription: String,
  logo: String,              // Cloudinary URL
  favicon: String,           // Cloudinary URL
  primaryColor: String,      // "#8b5cf6"
  secondaryColor: String,    // "#6d28d9"
  accentColor: String,       // "#06b6d4"
  backgroundColor: String,   // "#1a1a2e"
  fontHeading: String,       // "Outfit"
  fontBody: String,          // "Inter"
  images: [
    { url: String, alt: String, uploadedAt: Date }
  ],
  services: [
    { name: String, description: String, price: Number, icon: String }
  ],
  createdAt, updatedAt
}
```

### Project
```javascript
{
  _id: ObjectId,
  tenantId: ObjectId,        // ref: Tenant (required)
  userId: ObjectId,          // ref: User (project owner)
  name: String,              // "E-Commerce Store"
  description: String,
  activeVersionId: ObjectId, // ref: VersionHistory
  status: 'draft' | 'published',
  createdAt, updatedAt
}
```

### VersionHistory
```javascript
{
  _id: ObjectId,
  tenantId: ObjectId,        // ref: Tenant
  projectId: ObjectId,       // ref: Project
  userId: ObjectId,          // ref: User (who generated)
  versionNumber: Number,     // 1, 2, 3...
  userPrompt: String,        // "Build a SaaS landing page..."
  htmlCode: String,          // Complete HTML/CSS/JS
  brandingSnapshot: {
    companyName: String,
    logo: String,
    primaryColor, secondaryColor, accentColor, fontHeading, fontBody,
    services: [{ name, description, price }],
    images: [String]         // URLs
  },
  status: 'active' | 'inactive',
  createdAt
}
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Body | Auth | Description |
|--------|----------|------|------|-------------|
| `POST` | `/api/auth/register` | `{tenantName, tenantSlug, ownerName, ownerEmail, password}` | — | Create tenant + owner account |
| `POST` | `/api/auth/login` | `{email, password}` | — | Login → returns JWT + tenant info |
| `GET` | `/api/auth/me` | — | ✓ | Get current user + tenant |

**Response Example:**
```json
{
  "ok": true,
  "user": { "id": "...", "name": "John", "email": "john@acme.com", "role": "admin", "tenantId": "..." },
  "tenant": { "id": "...", "name": "Acme Corp", "slug": "acme-corp" },
  "token": "eyJhbGc..."
}
```

---

### Tenant Management
| Method | Endpoint | Body | Auth | Role | Description |
|--------|----------|------|------|------|-------------|
| `GET` | `/api/tenants/:tenantId` | — | ✓ | any | Get tenant details |
| `PUT` | `/api/tenants/:tenantId` | `{name?, description?, logo?}` | ✓ | admin | Update tenant |

---

### User Management (Admin-Only)
| Method | Endpoint | Body | Auth | Role | Description |
|--------|----------|------|------|------|-------------|
| `GET` | `/api/tenants/:tenantId/users` | — | ✓ | admin | List all users in tenant |
| `POST` | `/api/tenants/:tenantId/users` | `{name, email, password, role}` | ✓ | admin | Create new user |
| `PUT` | `/api/tenants/:tenantId/users/:userId` | `{name?, email?, role?}` | ✓ | admin | Update user |
| `DELETE` | `/api/tenants/:tenantId/users/:userId` | — | ✓ | admin | Remove user (not last admin) |

---

### Projects
| Method | Endpoint | Body | Auth | Role | Description |
|--------|----------|------|------|------|-------------|
| `GET` | `/api/projects/:tenantId` | — | ✓ | any | List user's projects |
| `POST` | `/api/projects/:tenantId` | `{name, description?}` | ✓ | any | Create project |
| `GET` | `/api/projects/:tenantId/:projectId` | — | ✓ | owner/admin | Get project |
| `PUT` | `/api/projects/:tenantId/:projectId` | `{name?, description?, status?}` | ✓ | owner/admin | Update project |
| `DELETE` | `/api/projects/:tenantId/:projectId` | — | ✓ | owner/admin | Delete project |
| `POST` | `/api/projects/:tenantId/:projectId/generate` | `{prompt}` | ✓ | owner/admin | **Generate website via AI** |
| `GET` | `/api/projects/:tenantId/:projectId/versions` | — | ✓ | owner/admin | List versions |
| `PUT` | `/api/projects/:tenantId/:projectId/versions/:versionId/rollback` | — | ✓ | owner/admin | Set version as active |

---

### Branding (Tenant-Level, Admin-Only)
| Method | Endpoint | Body/Form | Auth | Role | Description |
|--------|----------|-----------|------|------|-------------|
| `GET` | `/api/branding/:tenantId` | — | ✓ | any | Get branding |
| `PUT` | `/api/branding/:tenantId` | `{companyName?, primaryColor?, ...}` | ✓ | admin | Update branding |
| `POST` | `/api/branding/:tenantId/upload-logo` | `file` | ✓ | admin | Upload logo |
| `POST` | `/api/branding/:tenantId/upload-image` | `file, alt?` | ✓ | admin | Add gallery image |
| `DELETE` | `/api/branding/:tenantId/images/:imageId` | — | ✓ | admin | Remove image |
| `POST` | `/api/branding/:tenantId/services` | `{name, description?, price?, icon?}` | ✓ | admin | Add service |
| `PUT` | `/api/branding/:tenantId/services/:serviceId` | `{name?, price?, ...}` | ✓ | admin | Update service |
| `DELETE` | `/api/branding/:tenantId/services/:serviceId` | — | ✓ | admin | Delete service |

---

## JWT Token Payload
```javascript
{
  userId: ObjectId,
  tenantId: ObjectId,
  role: 'admin' | 'editor',
  iat: timestamp,
  exp: timestamp (7 days)
}
```

---

## Frontend Axios Usage

### Import Services
```javascript
import { registerTenant, loginUser, getMe } from '@/services/authService';
import { getProjects, createProject, generateWebsite } from '@/services/projectService';
import { getBranding, updateBranding, uploadLogo, addService } from '@/services/brandingService';
import { getTenant, updateTenant } from '@/services/tenantService';
import { listUsers, inviteUser } from '@/services/userService';
```

### Registration Flow
```javascript
const response = await registerTenant(
  'Acme Corp',           // tenantName
  'acme-corp',           // tenantSlug
  'John Doe',            // ownerName
  'john@acme.com',       // ownerEmail
  'password123'          // password
);
const { token, user, tenant } = response.data;
localStorage.setItem('authToken', token);
localStorage.setItem('tenantId', tenant.id);
localStorage.setItem('user', JSON.stringify(user));
```

### Login Flow
```javascript
const response = await loginUser('john@acme.com', 'password123');
const { token, user, tenant } = response.data;
localStorage.setItem('authToken', token);
localStorage.setItem('tenantId', tenant.id);
localStorage.setItem('user', JSON.stringify(user));
```

### Get Projects (with tenantId)
```javascript
const tenantId = localStorage.getItem('tenantId');
const response = await getProjects(tenantId);
const projects = response.data.projects;
```

### Generate Website
```javascript
const response = await generateWebsite(
  tenantId,
  projectId,
  'Build a modern e-commerce store...'
);
const htmlCode = response.data.version.htmlCode;
```

### Update Branding (Admin Only)
```javascript
await updateBranding(tenantId, {
  companyName: 'Acme Corp',
  primaryColor: '#ff0000'
});
```

### Create User (Admin Only)
```javascript
await inviteUser(tenantId, 'Jane', 'jane@acme.com', 'pass123', 'editor');
```

---

## Access Control Summary

| Action | Editor | Admin |
|--------|--------|-------|
| View own projects | ✓ | ✓ |
| Create projects | ✓ | ✓ |
| Generate websites | ✓ | ✓ |
| View branding | ✓ | ✓ |
| Modify branding | ✗ | ✓ |
| Upload logo/images | ✗ | ✓ |
| Manage services | ✗ | ✓ |
| View all projects | ✗ | ✓ |
| Create users | ✗ | ✓ |
| Delete users | ✗ | ✓ |
| Update tenant | ✗ | ✓ |

---

## Environment Setup

### Backend `.env`
```bash
PORT=5000
MONGO_URI=mongodb://localhost:27017/site-pilot
JWT_SECRET=your_super_secret_key_change_me_in_production
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Frontend `.env`
```bash
VITE_API_URL=http://localhost:5000/api
```

---

## Security Notes

1. **Tenant Isolation**: All queries filter by `tenantId` to prevent cross-tenant data leakage
2. **Token Validation**: Every protected route verifies JWT and extracts `tenantId` + `role`
3. **Admin Checks**: Sensitive operations (branding, user management) enforce `requireAdmin` middleware
4. **Password Hashing**: Uses bcrypt (12 rounds) for all user passwords
5. **Unique Email per Tenant**: Email is unique within a tenant, not globally

---

## Middleware Chain Example
```javascript
// Route: PUT /api/branding/:tenantId
router.put(
  '/:tenantId',
  verifyToken,       // ✓ Checks JWT, extracts userId/tenantId/role
  checkTenantAccess, // ✓ Verifies request.tenantId matches URL param
  requireAdmin,      // ✓ Checks req.userRole === 'admin'
  async (req, res) => { /* update branding */ }
);
```

---

## Error Responses

### 401 Unauthorized
```json
{ "error": "Authentication required. No token provided." }
```

### 403 Forbidden
```json
{ "error": "Admin role required." }
```

### 404 Not Found
```json
{ "error": "Project not found." }
```

### 409 Conflict
```json
{ "error": "User already exists in this tenant." }
```

---

This architecture ensures:
- ✓ Complete tenant isolation
- ✓ Granular role-based access control
- ✓ Shared branding across organization
- ✓ Individual user project ownership
- ✓ Admin oversight and user management
- ✓ Secure API with JWT + role validation
