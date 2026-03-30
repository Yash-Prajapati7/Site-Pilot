# Site Pilot Multi-Tenant Backend Architecture

## Overview

The backend is fully multi-tenant with a hierarchical, website-centric structure:

```
TENANT (Organization)
  ├── BRANDING (tenant-level, shared across all websites)
  ├── USERS (admin & editor roles)
  │   ├── Admin: Manage branding, users, view all websites, team operations, billing
  │   └── Editor: Create/view own websites, generate content, manage pages
  ├── WEBSITES (website projects, identified by slug)
  │   ├── PAGES (individual pages within a website, e.g., home, about, services)
  │   ├── VERSIONS (immutable snapshots of generated website HTML)
  │   ├── CHAT_HISTORY (conversation context during generation)
  │   └── PROMPT_HISTORY (log of prompts used for generation)
  ├── SITE_BACKENDS (optional dynamic backend configuration per website)
  │   ├── API_DEFINITION (auto-generated endpoint schema)
  │   └── DATA (sample/mock data for endpoints)
  ├── DEPLOYMENTS (published website instances)
  │   └── DEPLOYMENT_STATUS (tracks build and deployment steps)
  ├── ACTIVITY_LOGS (audit trail of user actions)
  └── INVOICES (billing and subscription records)
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

## Key Architectural Changes

### Multi-Tenant Website Model (Updated)
- Project entities have been replaced with **Website** entities for clearer naming.
- Each Website can contain multiple **Page** entities (e.g., home, about, services).
- Websites support full version history and incremental updates via chat-driven generation.
- Dynamic backends are optional and generated on-demand via **SiteBackend** entities.
- Deployments are tracked independently with status and history.

### Enhanced Feature Support
- **Chat-based Generation**: Conversation history is persisted per website, enabling contextual prompts.
- **Page-level Management**: Pages have independent component trees, versioning, and SEO metadata.
- **Dynamic Backends**: Auto-generated API schemas with sample data, deployable via Docker bundle.
- **Deployment Tracking**: Detailed deployment status, logs, and rollback capability.
- **Activity Auditing**: All user actions logged for compliance and analytics.

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
  plan: 'free' | 'starter' | 'professional' | 'enterprise',
  limits: {
    websites: Number,        // -1 means unlimited
    pages: Number,
    aiGenerations: Number,
    teamMembers: Number
  },
  usage: {
    websites: Number,
    pages: Number,
    aiGenerations: Number,
    teamMembers: Number
  },
  createdAt, updatedAt
}
```

### User
```javascript
{
  _id: ObjectId,
  name: String,              // "John Doe"
  email: String,             // unique per tenant
  password: String,          // bcrypt hashed
  tenant: ObjectId,          // ref: Tenant (required)
  role: 'editor' | 'admin',  // default: 'editor'
  avatar: String,
  status: 'active' | 'invited',
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
  backgroundColor: String,   // "#ffffff"
  bgColor: String,           // alias for backgroundColor
  textColor: String,         // "#1f2937"
  fontHeading: String,       // "Outfit"
  fontBody: String,          // "Inter"
  images: [
    { url: String, alt: String, uploadedAt: Date }
  ],
  services: [
    { 
      _id: ObjectId,
      name: String, 
      description: String, 
      price: Number, 
      icon: String 
    }
  ],
  createdAt, updatedAt
}
```

### Website
```javascript
{
  _id: ObjectId,
  name: String,              // "Portfolio Site"
  slug: String,              // "portfolio-site" (unique per tenant)
  description: String,
  businessType: String,      // "portfolio", "ecommerce", "saas", etc.
  tenant: ObjectId,          // ref: Tenant (required)
  owner: ObjectId,           // ref: User (creator)
  generatedHTML: String,     // Current/active generated HTML
  currentVersion: Number,    // Version counter
  status: 'draft' | 'published',
  chatHistory: [
    { role: 'user' | 'ai', content: String, ts: Number }
  ],
  promptHistory: [
    { prompt: String }
  ],
  versions: [
    {
      version: Number,
      html: String,
      prompt: String,
      label: String,
      createdAt: Date
    }
  ],
  createdAt, updatedAt
}
```

### Page
```javascript
{
  _id: ObjectId,
  title: String,             // "Home", "About", "Services"
  slug: String,              // "home", "about", "services"
  website: ObjectId,         // ref: Website (required)
  tenant: ObjectId,          // ref: Tenant (required)
  components: [Object],      // Component tree definitions
  generatedHTML: String,     // Rendered HTML for the page
  version: Number,           // Page version counter
  status: 'draft' | 'published',
  seo: {
    title: String,
    description: String,
    keywords: String
  },
  versions: [
    {
      version: Number,
      components: [Object],
      generatedHTML: String,
      createdBy: ObjectId,   // ref: User
      message: String,
      createdAt: Date
    }
  ],
  createdAt, updatedAt
}
```

### SiteBackend
```javascript
{
  _id: ObjectId,
  website: ObjectId,         // ref: Website (required, unique)
  tenant: ObjectId,          // ref: Tenant (required)
  status: 'idle' | 'generating' | 'active' | 'error',
  apiDefinition: {
    endpoints: [
      {
        path: String,        // "/products"
        method: String,      // "GET", "POST", "PUT", "DELETE"
        description: String,
        fields: [String],
        sampleData: [Object]
      }
    ],
    collections: [String]    // ["products", "orders"]
  },
  data: Object,              // { products: [...], orders: [...] }
  apiBaseUrl: String,        // Base URL for generated APIs
  lastGenerated: Date,
  createdAt, updatedAt
}
```

### Deployment
```javascript
{
  _id: ObjectId,
  website: ObjectId,         // ref: Website (required)
  tenant: ObjectId,          // ref: Tenant (required)
  deployedBy: ObjectId,      // ref: User
  version: Number,           // Website version deployed
  environment: String,       // "production", "staging"
  status: 'pending' | 'building' | 'live' | 'failed',
  url: String,               // Public deployment URL
  changelog: String,         // Release notes
  buildTime: Number,         // Duration in seconds
  rollbackFrom: Number,      // Previous version if this is a rollback
  createdAt, updatedAt
}
```

### ActivityLog
```javascript
{
  _id: ObjectId,
  user: {
    id: ObjectId,
    name: String,
    email: String
  },
  tenant: ObjectId,          // ref: Tenant
  action: String,            // "website.create", "ai.generate", "deploy.create"
  entityType: String,        // "website", "page", "deployment", "billing"
  entityId: ObjectId,        // ref to the entity being acted upon
  details: Object,           // Additional context
  ipAddress: String,
  createdAt: Date
}
```

### Invoice
```javascript
{
  _id: ObjectId,
  tenant: ObjectId,          // ref: Tenant
  amount: Number,
  plan: String,              // "free", "starter", "professional", "enterprise"
  status: 'pending' | 'paid' | 'failed',
  description: String,
  period: {
    start: Date,
    end: Date
  },
  paymentMethod: {
    type: String,            // "card", "invoice"
    last4: String,
    brand: String
  },
  createdAt: Date
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

**Example Response:**
```json
{
  "ok": true,
  "user": { "id": "...", "name": "John", "email": "john@acme.com", "role": "admin", "tenantId": "..." },
  "tenant": { "id": "...", "name": "Acme Corp", "slug": "acme-corp" },
  "token": "eyJhbGc..."
}
```

---

### Websites
| Method | Endpoint | Body | Auth | Role | Description |
|--------|----------|------|------|------|-------------|
| `GET` | `/api/websites` | — | ✓ | any | List tenant's websites |
| `POST` | `/api/websites` | `{name, description?, businessType?}` | ✓ | any | Create website |
| `GET` | `/api/websites/:id` | — | ✓ | any | Get website details |
| `PUT` | `/api/websites/:id` | `{name?, description?, status?}` | ✓ | owner/admin | Update website |
| `DELETE` | `/api/websites/:id` | — | ✓ | owner/admin | Delete website |
| `GET` | `/api/websites/:id/chat` | — | ✓ | owner/admin | Get chat & prompt history |
| `GET` | `/api/websites/:id/versions` | — | ✓ | owner/admin | List all versions |
| `POST` | `/api/websites/:id/versions/:version/restore` | — | ✓ | owner/admin | Restore previous version |
| `GET` | `/api/websites/view/:slug` | — | — | — | View published website (public) |

---

### Pages
| Method | Endpoint | Body | Auth | Role | Description |
|--------|----------|------|------|------|-------------|
| `GET` | `/api/pages` | — | ✓ | any | List pages (filter by websiteId) |
| `POST` | `/api/pages` | `{title, websiteId, components?, generatedHTML?}` | ✓ | any | Create page |
| `GET` | `/api/pages/:id` | — | ✓ | any | Get page details |
| `PUT` | `/api/pages/:id` | `{title?, components?, generatedHTML?, status?, seo?}` | ✓ | owner/admin | Update page with versioning |
| `DELETE` | `/api/pages/:id` | — | ✓ | owner/admin | Delete page |

---

### AI Generation
| Method | Endpoint | Body | Auth | Role | Description |
|--------|----------|------|------|------|-------------|
| `POST` | `/api/ai/generate` | `{prompt, websiteId?, previousHtml?}` | ✓ | any | Generate website HTML via Gemini |

**Response includes version number, generated HTML, and generation metadata.**

---

### Dynamic Backends (SiteBackends)
| Method | Endpoint | Body | Auth | Description |
|--------|----------|------|------|-------------|
| `GET` | `/api/site-backends/:websiteId` | — | ✓ | Get backend schema and data |
| `POST` | `/api/site-backends/:websiteId/generate` | — | ✓ | Generate backend from HTML |
| `PUT` | `/api/site-backends/:websiteId/data/:collection` | `{data: [...]}` | ✓ | Update collection data |
| `GET` | `/api/site-backends/public/:websiteId/:endpoint` | — | — | Fetch data (public) |
| `POST` | `/api/site-backends/public/:websiteId/:endpoint` | `{...fields}` | — | Submit data (public) |

---

### Deployments
| Method | Endpoint | Body | Auth | Role | Description |
|--------|----------|------|------|------|-------------|
| `GET` | `/api/deploy` | — | ✓ | any | List deployments (filter by websiteId) |
| `POST` | `/api/deploy` | `{websiteId, environment, changelog}` | ✓ | any | Create deployment |
| `GET` | `/api/deploy/:id/stream` | — | ✓ | — | Stream deployment progress (SSE) |
| `POST` | `/api/deploy/:id/rollback` | — | ✓ | any | Rollback to previous version |

---

### Export
| Method | Endpoint | Query | Auth | Description |
|--------|----------|-------|------|-------------|
| `GET` | `/api/export/:websiteId/docker` | — | ✓ | Download Docker bundle |

**Returns a ZIP file containing HTML, backend schema, server.js, Dockerfile, and dependencies.**

---

### Branding (Tenant-Level)
| Method | Endpoint | Body/Form | Auth | Role | Description |
|--------|----------|-----------|------|------|-------------|
| `GET` | `/api/branding/:tenantId` | — | ✓ | any | Get tenant branding |
| `PUT` | `/api/branding/:tenantId` | `{companyName?, colors?, fonts?}` | ✓ | editor | Update branding |
| `POST` | `/api/branding/:tenantId/upload-logo` | `file` | ✓ | editor | Upload logo |
| `POST` | `/api/branding/:tenantId/upload-image` | `file, alt?` | ✓ | editor | Add gallery image |
| `DELETE` | `/api/branding/:tenantId/images/:imageId` | — | ✓ | editor | Remove image |
| `POST` | `/api/branding/:tenantId/services` | `{name, description?, price?, icon?}` | ✓ | editor | Add service |
| `PUT` | `/api/branding/:tenantId/services/:serviceId` | `{name?, price?, ...}` | ✓ | editor | Update service |
| `DELETE` | `/api/branding/:tenantId/services/:serviceId` | — | ✓ | editor | Delete service |

---

### Team
| Method | Endpoint | Body | Auth | Role | Description |
|--------|----------|------|------|------|-------------|
| `GET` | `/api/team` | — | ✓ | any | List team members |
| `POST` | `/api/team/invite` | `{name, email, role}` | ✓ | admin | Invite team member |
| `PUT` | `/api/team/:id/role` | `{role}` | ✓ | admin | Change user role |
| `DELETE` | `/api/team/:id` | — | ✓ | admin | Remove team member |
| `GET` | `/api/team/permissions` | — | ✓ | any | Get user permissions |

---

### Analytics
| Method | Endpoint | Query | Auth | Role | Description |
|--------|----------|-------|------|------|-------------|
| `GET` | `/api/analytics` | — | ✓ | any | Get tenant metrics and traffic |
| `GET` | `/api/analytics/logs` | `page, limit, action, entityType` | ✓ | any | List activity logs |

---

### Billing
| Method | Endpoint | Body | Auth | Role | Description |
|--------|----------|------|------|------|-------------|
| `GET` | `/api/billing` | — | ✓ | any | Get plan, limits, usage, invoices |
| `POST` | `/api/billing/change-plan` | `{plan}` | ✓ | admin | Change subscription plan |

**Plans:** free, starter, professional, enterprise
**Limits:** websites, pages, aiGenerations, teamMembers (-1 = unlimited)

---

### Health
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | — | Server health check |

---

## JWT Token Payload
```javascript
{
  userId: String,            // User ObjectId as string
  tenantId: String,          // Tenant ObjectId as string
  role: 'admin' | 'editor',
  iat: timestamp,
  exp: timestamp (7 days)
}
```

---

## Access Control Summary

| Action | Editor | Admin |
|--------|--------|-------|
| View own websites | ✓ | ✓ |
| Create websites | ✓ | ✓ |
| Generate HTML via AI | ✓ | ✓ |
| Manage pages | ✓ | ✓ |
| Generate dynamic backend | ✓ | ✓ |
| View branding | ✓ | ✓ |
| Modify branding | ✓ | ✓ |
| Upload logos/images | ✓ | ✓ |
| Manage services | ✓ | ✓ |
| Deploy websites | ✓ | ✓ |
| View all websites | ✗ | ✓ |
| View team members | ✓ | ✓ |
| Invite team members | ✗ | ✓ |
| Remove team members | ✗ | ✓ |
| Change user roles | ✗ | ✓ |
| View billing/invoices | ✗ | ✓ |
| Change subscription plan | ✗ | ✓ |

---

## Frontend Integration Patterns

### Authentication Flow
```javascript
import { loginUser, registerTenant } from '@/services/authService';

// Register new tenant
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

// Or login existing user
const loginResp = await loginUser('john@acme.com', 'password123');
// Same storage pattern as above
```

### Website Creation and Generation
```javascript
// 1. Create website
const createResp = await apiClient.post('/websites', {
  name: 'My Online Store',
  description: 'E-commerce platform',
  businessType: 'ecommerce'
});
const websiteId = createResp.data.data._id;

// 2. Generate website via AI
const genResp = await apiClient.post('/ai/generate', {
  prompt: 'Build a modern e-commerce website with products, cart, and checkout',
  websiteId: websiteId
});
const htmlCode = genResp.data.version.htmlCode;

// 3. View versions
const versResp = await apiClient.get(`/websites/${websiteId}/versions`);
const versions = versResp.data.data;

// 4. Restore previous version
await apiClient.post(`/websites/${websiteId}/versions/1/restore`);
```

### Page Management
```javascript
// Create page
const pageResp = await apiClient.post('/pages', {
  title: 'About Us',
  websiteId: websiteId,
  components: [
    { type: 'hero', props: { title: 'Our Story' } }
  ],
  generatedHTML: '<html>...</html>'
});

// Update page with versioning
await apiClient.put(`/pages/${pageId}`, {
  title: 'About Us - Updated',
  components: [...],
  status: 'published',
  seo: {
    title: 'About Our Company',
    description: 'Learn about us'
  },
  versionMessage: 'Updated copy and structure'
});
```

### Dynamic Backend Generation
```javascript
// Generate backend from frontend
const backendResp = await apiClient.post(`/site-backends/${websiteId}/generate`);
const apiDef = backendResp.data.data.apiDefinition;

// Update collection data
await apiClient.put(`/site-backends/${websiteId}/data/products`, {
  data: [
    { _id: '1', name: 'Product A', price: 99 },
    { _id: '2', name: 'Product B', price: 199 }
  ]
});

// Websites can fetch public data client-side
const productsResp = await fetch(
  '/api/site-backends/public/${websiteId}/products'
);
const products = await productsResp.json();
```

### Deployment Workflow
```javascript
// Create deployment
const deployResp = await apiClient.post('/deploy', {
  websiteId: websiteId,
  environment: 'production',
  changelog: 'Updated homepage with new hero section'
});
const deploymentId = deployResp.data.data._id;

// Stream deployment progress
const eventSource = new EventSource(
  `/api/deploy/${deploymentId}/stream`
);
eventSource.onmessage = (event) => {
  const { type, state } = JSON.parse(event.data);
  console.log(`Status: ${state.status}`);
};

// Rollback if needed
await apiClient.post(`/deploy/${deploymentId}/rollback`);
```

### Export Docker Bundle
```javascript
// Download Docker bundle for local deployment
const token = localStorage.getItem('authToken');
const downloadUrl = `
  /api/export/${websiteId}/docker?token=${token}
`;
window.location.href = downloadUrl;

// User receives a ZIP containing:
// - public/index.html (generated website)
// - database.json (backend schema and sample data)
// - server.js (Express server)
// - Dockerfile
// - package.json
```

### Team & Permissions
```javascript
// List team members
const teamResp = await apiClient.get('/team');
const members = teamResp.data.data.members;

// Invite new member
await apiClient.post('/team/invite', {
  name: 'Jane Smith',
  email: 'jane@acme.com',
  role: 'editor'
});

// Change role
await apiClient.put('/team/{userId}/role', { role: 'admin' });

// Get current user's permissions
const permResp = await apiClient.get('/team/permissions');
const permissions = permResp.data.data.permissions;
```

---

## Rate Limiting & Quotas

### Plan Limits
- **Free**: 5 websites, 25 pages, 50 AI generations, 1 team member
- **Starter**: 25 websites, 250 pages, 500 AI generations, 5 team members
- **Professional**: 100 websites, 1000 pages, 2000 AI generations, 10 team members
- **Enterprise**: Unlimited

### Enforcement
- Tenant limits are checked before each create operation.
- Usage counters are incremented on successful operations.
- Quota overflow returns HTTP 403 with upgrade suggestion.

---

## Key Implementation Notes

1. **Multi-Tenancy**: All queries filter by `tenant` or `tenantId` to ensure data isolation.
2. **Versioning**: Website and page changes create immutable version records.
3. **Chat Context**: Chat history is persisted to enable contextual AI refinement.
4. **Dynamic Backends**: Generated from website HTML via Groq-powered schema analysis.
5. **Activity Auditing**: All actions logged for compliance and analytics.
6. **Deployment Pipeline**: Simulated build process with step-by-step progress streaming.
7. **Export Capability**: Docker bundles are self-contained and portable.

---

## Frontend Axios Usage

### Import Services
```javascript
import apiClient from '@/services/apiClient';
import { loginUser, registerTenant, getMe } from '@/services/authService';
import { fetchWebsites, createWebsite, generateAIWebsite } from '@/services/api';
import { getBranding, updateBranding } from '@/services/brandingService';
```

---

## Production Deployment Checklist

- [ ] Update `JWT_SECRET` to strong random value
- [ ] Use MongoDB Atlas (not local)
- [ ] Configure environment variables: MONGO_URI, GEMINI_API_KEY, CLOUDINARY_*, JWT_SECRET
- [ ] Enable HTTPS on frontend and backend
- [ ] Set appropriate CORS origin
- [ ] Configure rate limiting on API
- [ ] Set up error logging and monitoring
- [ ] Enable database backups
- [ ] Test deployment export and Docker build process
- [ ] Configure webhook URL for N8N deployment integration

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
