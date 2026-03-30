# SitePilot API Documentation

## Overview
This document details all REST API endpoints for the SitePilot backend. The API follows a standard REST architecture with JSON request/response bodies, JWT-based authentication, and role-based access control.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

JWT tokens are obtained via the `/api/auth/register` or `/api/auth/login` endpoints and expire in 7 days.

---

## Health Check

### GET /health
Check server status.

**Request:**
```http
GET /api/health HTTP/1.1
```

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-03-30T10:30:00.000Z"
}
```

---

## Authentication Endpoints

### POST /auth/register
Create a new tenant and owner account.

**Request:**
```json
{
  "tenantName": "Acme Corp",
  "tenantSlug": "acme-corp",
  "ownerName": "John Doe",
  "ownerEmail": "john@acme.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "ok": true,
  "user": {
    "id": "67a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@acme.com",
    "role": "admin",
    "tenantId": "67a1b2c3d4e5f6g7h8i9j0k2"
  },
  "tenant": {
    "id": "67a1b2c3d4e5f6g7h8i9j0k2",
    "name": "Acme Corp",
    "slug": "acme-corp"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### POST /auth/login
Authenticate user and retrieve JWT token.

**Request:**
```json
{
  "email": "john@acme.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "ok": true,
  "user": {
    "id": "67a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@acme.com",
    "role": "admin",
    "tenantId": "67a1b2c3d4e5f6g7h8i9j0k2"
  },
  "tenant": {
    "id": "67a1b2c3d4e5f6g7h8i9j0k2",
    "name": "Acme Corp",
    "slug": "acme-corp"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (401):**
```json
{
  "error": "Invalid email or password."
}
```

---

### GET /auth/me
Retrieve current authenticated user details.

**Request:**
```http
GET /api/auth/me HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "ok": true,
  "user": {
    "id": "67a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@acme.com",
    "role": "admin",
    "tenantId": "67a1b2c3d4e5f6g7h8i9j0k2"
  },
  "tenant": {
    "id": "67a1b2c3d4e5f6g7h8i9j0k2",
    "name": "Acme Corp",
    "slug": "acme-corp"
  }
}
```

---

## Website Endpoints

### GET /websites
List all websites for the authenticated tenant.

**Request:**
```http
GET /api/websites HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "67a1b2c3d4e5f6g7h8i9j0k3",
      "name": "Portfolio Site",
      "slug": "portfolio-site",
      "description": "Personal portfolio",
      "businessType": "portfolio",
      "currentVersion": 3,
      "status": "draft",
      "generatedHTML": "<html>...</html>",
      "chatHistory": [],
      "promptHistory": [],
      "versions": [],
      "createdAt": "2026-03-20T08:00:00.000Z",
      "updatedAt": "2026-03-30T10:30:00.000Z"
    }
  ]
}
```

---

### GET /websites/:id
Retrieve a specific website.

**Request:**
```http
GET /api/websites/67a1b2c3d4e5f6g7h8i9j0k3 HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k3",
    "name": "Portfolio Site",
    "slug": "portfolio-site",
    "description": "Personal portfolio",
    "businessType": "portfolio",
    "currentVersion": 3,
    "status": "draft",
    "generatedHTML": "<html>...</html>",
    "chatHistory": [],
    "promptHistory": [],
    "createdAt": "2026-03-20T08:00:00.000Z",
    "updatedAt": "2026-03-30T10:30:00.000Z"
  }
}
```

---

### POST /websites
Create a new website.

**Request:**
```json
{
  "name": "E-Commerce Store",
  "description": "Online product marketplace",
  "businessType": "ecommerce"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k4",
    "name": "E-Commerce Store",
    "slug": "e-commerce-store",
    "description": "Online product marketplace",
    "businessType": "ecommerce",
    "currentVersion": 0,
    "status": "draft",
    "tenant": "67a1b2c3d4e5f6g7h8i9j0k2",
    "chatHistory": [],
    "promptHistory": [],
    "versions": [],
    "createdAt": "2026-03-30T10:30:00.000Z",
    "updatedAt": "2026-03-30T10:30:00.000Z"
  }
}
```

**Response (403):**
```json
{
  "success": false,
  "error": "Website limit reached. Upgrade your plan."
}
```

---

### PUT /websites/:id
Update an existing website.

**Request:**
```json
{
  "name": "Updated Store Name",
  "description": "Updated description",
  "status": "published"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k4",
    "name": "Updated Store Name",
    "slug": "e-commerce-store",
    "description": "Updated description",
    "status": "published",
    "updatedAt": "2026-03-30T11:00:00.000Z"
  }
}
```

---

### DELETE /websites/:id
Delete a website.

**Request:**
```http
DELETE /api/websites/67a1b2c3d4e5f6g7h8i9j0k4 HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Website deleted"
}
```

---

### GET /websites/:id/chat
Retrieve chat and generation history for a website.

**Request:**
```http
GET /api/websites/67a1b2c3d4e5f6g7h8i9j0k3/chat HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "chatHistory": [
      { "role": "user", "content": "Build a modern e-commerce site", "ts": 1711864800000 },
      { "role": "ai", "content": "Generated website v1", "ts": 1711864810000 }
    ],
    "promptHistory": [
      { "prompt": "Build a modern e-commerce site" }
    ],
    "generatedHTML": "<html>...</html>",
    "currentVersion": 1
  }
}
```

---

### GET /websites/:id/versions
List all versions of a website.

**Request:**
```http
GET /api/websites/67a1b2c3d4e5f6g7h8i9j0k3/versions HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "version": 1,
      "prompt": "Build a modern e-commerce website",
      "label": "v1",
      "createdAt": "2026-03-20T08:00:00.000Z",
      "htmlLength": 15234
    },
    {
      "version": 2,
      "prompt": "Add animations and hover effects",
      "label": "v2",
      "createdAt": "2026-03-25T10:00:00.000Z",
      "htmlLength": 15800
    },
    {
      "version": 3,
      "prompt": "Current",
      "label": "v3 (current)",
      "createdAt": "2026-03-30T10:30:00.000Z",
      "htmlLength": 16100,
      "isCurrent": true
    }
  ]
}
```

---

### POST /websites/:id/versions/:version/restore
Restore a previous version as the current version.

**Request:**
```http
POST /api/websites/67a1b2c3d4e5f6g7h8i9j0k3/versions/1/restore HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Restored to v1. Now at v4."
}
```

---

### GET /websites/view/:slug
View generated website by slug (public route, no auth required).

**Request:**
```http
GET /api/websites/view/portfolio-site HTTP/1.1
```

**Response (200):**
```html
<!DOCTYPE html>
<html>
  <head>...</head>
  <body>...</body>
</html>
```

---

## AI Generation Endpoints

### POST /ai/generate
Generate website HTML using AI based on a prompt.

**Request:**
```json
{
  "prompt": "Build a modern SaaS landing page with pricing section and testimonials",
  "websiteId": "67a1b2c3d4e5f6g7h8i9j0k3",
  "previousHtml": "<html>...</html>"
}
```

**Response (200):**
```json
{
  "ok": true,
  "generation": {
    "target": "frontend",
    "provider": "gemini",
    "model": "gemini-3-flash-preview"
  },
  "version": {
    "versionNumber": 2,
    "htmlCode": "<!DOCTYPE html><html>...</html>"
  }
}
```

**Response (403):**
```json
{
  "success": false,
  "error": "AI generation limit reached. Upgrade your plan."
}
```

---

## Pages Endpoints

### GET /pages
List all pages with optional filtering by website.

**Request:**
```http
GET /api/pages?websiteId=67a1b2c3d4e5f6g7h8i9j0k3 HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "67a1b2c3d4e5f6g7h8i9j0k5",
      "title": "Home",
      "slug": "home",
      "website": "67a1b2c3d4e5f6g7h8i9j0k3",
      "tenant": "67a1b2c3d4e5f6g7h8i9j0k2",
      "components": [],
      "generatedHTML": "<html>...</html>",
      "version": 1,
      "status": "draft",
      "seo": { "title": "", "description": "", "keywords": "" },
      "versions": [],
      "createdAt": "2026-03-20T08:00:00.000Z",
      "updatedAt": "2026-03-30T10:30:00.000Z"
    }
  ]
}
```

---

### GET /pages/:id
Retrieve a specific page.

**Request:**
```http
GET /api/pages/67a1b2c3d4e5f6g7h8i9j0k5 HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k5",
    "title": "Home",
    "slug": "home",
    "website": "67a1b2c3d4e5f6g7h8i9j0k3",
    "components": [],
    "generatedHTML": "<html>...</html>",
    "version": 1,
    "status": "draft",
    "seo": { "title": "Home", "description": "", "keywords": "" }
  }
}
```

---

### POST /pages
Create a new page.

**Request:**
```json
{
  "title": "About Us",
  "websiteId": "67a1b2c3d4e5f6g7h8i9j0k3",
  "components": [],
  "generatedHTML": "<html>...</html>"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k6",
    "title": "About Us",
    "slug": "about-us",
    "website": "67a1b2c3d4e5f6g7h8i9j0k3",
    "tenant": "67a1b2c3d4e5f6g7h8i9j0k2",
    "components": [],
    "generatedHTML": "<html>...</html>",
    "version": 1,
    "status": "draft"
  }
}
```

---

### PUT /pages/:id
Update a page with components, HTML, or metadata.

**Request:**
```json
{
  "title": "About Us - Updated",
  "components": [
    { "type": "hero", "props": {} },
    { "type": "text", "props": { "content": "About our company..." } }
  ],
  "generatedHTML": "<html>...</html>",
  "status": "published",
  "seo": {
    "title": "About Our Company",
    "description": "Learn more about us",
    "keywords": "about, company"
  },
  "versionMessage": "Updated about section with new content"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k6",
    "title": "About Us - Updated",
    "slug": "about-us",
    "website": "67a1b2c3d4e5f6g7h8i9j0k3",
    "components": [
      { "type": "hero", "props": {} },
      { "type": "text", "props": { "content": "About our company..." } }
    ],
    "generatedHTML": "<html>...</html>",
    "version": 2,
    "status": "published",
    "seo": {
      "title": "About Our Company",
      "description": "Learn more about us",
      "keywords": "about, company"
    }
  }
}
```

---

### DELETE /pages/:id
Delete a page.

**Request:**
```http
DELETE /api/pages/67a1b2c3d4e5f6g7h8i9j0k6 HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Page deleted"
}
```

---

## Dynamic Backend (SiteBackends) Endpoints

### GET /site-backends/:websiteId
Retrieve generated backend configuration for a website.

**Request:**
```http
GET /api/site-backends/67a1b2c3d4e5f6g7h8i9j0k3 HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "generation": {
    "target": "backend",
    "provider": "groq",
    "model": "openai/gpt-oss-120b"
  },
  "data": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k7",
    "website": "67a1b2c3d4e5f6g7h8i9j0k3",
    "tenant": "67a1b2c3d4e5f6g7h8i9j0k2",
    "status": "active",
    "apiBaseUrl": "/api/site-backends/public/67a1b2c3d4e5f6g7h8i9j0k3",
    "apiDefinition": {
      "endpoints": [
        {
          "path": "/products",
          "method": "GET",
          "description": "List all products",
          "fields": ["id", "name", "price"]
        },
        {
          "path": "/products",
          "method": "POST",
          "description": "Create new product",
          "fields": ["name", "price", "description"]
        }
      ],
      "collections": ["products", "orders"]
    },
    "data": {
      "products": [
        { "_id": "1", "name": "Product A", "price": 99 },
        { "_id": "2", "name": "Product B", "price": 199 }
      ],
      "orders": []
    },
    "lastGenerated": "2026-03-30T10:30:00.000Z"
  }
}
```

**Response (404):**
```json
{
  "success": false,
  "error": "No backend generated yet"
}
```

---

### POST /site-backends/:websiteId/generate
Generate backend API schema and sample data.

**Request:**
```http
POST /api/site-backends/67a1b2c3d4e5f6g7h8i9j0k3/generate HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Response (200):**
```json
{
  "success": true,
  "generation": {
    "target": "backend",
    "provider": "groq",
    "model": "openai/gpt-oss-120b"
  },
  "data": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k7",
    "website": "67a1b2c3d4e5f6g7h8i9j0k3",
    "status": "active",
    "apiDefinition": {
      "endpoints": [
        {
          "path": "/products",
          "method": "GET",
          "description": "Fetch all products",
          "fields": ["id", "name", "price", "description"]
        },
        {
          "path": "/products",
          "method": "POST",
          "description": "Create a new product",
          "fields": ["name", "price", "description"]
        }
      ]
    },
    "data": {
      "products": [
        { "_id": "1", "name": "Sample Product", "price": 99.99, "description": "A great product" }
      ]
    }
  }
}
```

**Response (400):**
```json
{
  "success": false,
  "error": "Website has no HTML. Generate the frontend first."
}
```

---

### PUT /site-backends/:websiteId/data/:collection
Update data for a specific collection.

**Request:**
```json
{
  "data": [
    { "_id": "1", "name": "Product A", "price": 99 },
    { "_id": "2", "name": "Product B", "price": 199 },
    { "_id": "3", "name": "Product C", "price": 299 }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "_id": "1", "name": "Product A", "price": 99 },
    { "_id": "2", "name": "Product B", "price": 199 },
    { "_id": "3", "name": "Product C", "price": 299 }
  ]
}
```

---

### GET /site-backends/public/:websiteId/:endpoint
Fetch data from a specific endpoint (public route, no auth).

**Request:**
```http
GET /api/site-backends/public/67a1b2c3d4e5f6g7h8i9j0k3/products HTTP/1.1
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "_id": "1", "name": "Product A", "price": 99 },
    { "_id": "2", "name": "Product B", "price": 199 }
  ],
  "endpoint": "products"
}
```

---

### POST /site-backends/public/:websiteId/:endpoint
Submit data to an endpoint (public route, acts as form submission).

**Request:**
```json
{
  "name": "New Product",
  "price": 299.99,
  "description": "A new awesome product"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "1711894200",
    "name": "New Product",
    "price": 299.99,
    "description": "A new awesome product",
    "createdAt": "2026-03-30T10:30:00.000Z"
  },
  "message": "Submission received!"
}
```

---

## Deployment Endpoints

### GET /deploy
List all deployments for the tenant with optional filtering.

**Request:**
```http
GET /api/deploy?websiteId=67a1b2c3d4e5f6g7h8i9j0k3 HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "67a1b2c3d4e5f6g7h8i9j0k8",
      "website": { "_id": "67a1b2c3d4e5f6g7h8i9j0k3", "name": "Portfolio Site", "slug": "portfolio-site" },
      "tenant": "67a1b2c3d4e5f6g7h8i9j0k2",
      "deployedBy": { "_id": "67a1b2c3d4e5f6g7h8i9j0k1", "name": "John Doe" },
      "version": 3,
      "environment": "production",
      "status": "live",
      "url": "https://spit-hack.app.n8n.cloud/webhook/tenantflow-hosting/site/portfolio-site",
      "changelog": "Updated hero section with new animations",
      "buildTime": 2.4,
      "createdAt": "2026-03-30T10:30:00.000Z"
    }
  ]
}
```

---

### POST /deploy
Create and trigger a new deployment.

**Request:**
```json
{
  "websiteId": "67a1b2c3d4e5f6g7h8i9j0k3",
  "environment": "production",
  "changelog": "Updated homepage with new features"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k9",
    "website": "67a1b2c3d4e5f6g7h8i9j0k3",
    "tenant": "67a1b2c3d4e5f6g7h8i9j0k2",
    "deployedBy": "67a1b2c3d4e5f6g7h8i9j0k1",
    "version": 3,
    "environment": "production",
    "status": "pending",
    "url": "https://spit-hack.app.n8n.cloud/webhook/tenantflow-hosting/site/portfolio-site",
    "changelog": "Updated homepage with new features",
    "createdAt": "2026-03-30T10:30:00.000Z"
  }
}
```

---

### GET /deploy/:id/stream
Stream deployment progress via Server-Sent Events.

**Request:**
```http
GET /api/deploy/67a1b2c3d4e5f6g7h8i9j0k9/stream HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
```

**Response (200, streaming):**
```
data: {"type":"init","state":{"status":"pending","url":"https://...","steps":[...]}}

data: {"type":"update","state":{"status":"building","steps":[...]}}

data: {"type":"done"}
```

---

### POST /deploy/:id/rollback
Rollback to a previous deployment version.

**Request:**
```http
POST /api/deploy/67a1b2c3d4e5f6g7h8i9j0k9/rollback HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k10",
    "website": "67a1b2c3d4e5f6g7h8i9j0k3",
    "tenant": "67a1b2c3d4e5f6g7h8i9j0k2",
    "deployedBy": "67a1b2c3d4e5f6g7h8i9j0k1",
    "version": 2,
    "status": "live",
    "rollbackFrom": 3,
    "url": "https://spit-hack.app.n8n.cloud/webhook/tenantflow-hosting/site/portfolio-site",
    "createdAt": "2026-03-30T10:45:00.000Z"
  }
}
```

---

## Export Endpoints

### GET /export/:websiteId/docker
Download a Docker bundle containing the website and backend.

**Request:**
```http
GET /api/export/67a1b2c3d4e5f6g7h8i9j0k3/docker HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
- Content-Type: application/zip
- Content includes:
  - `public/index.html` - Generated website HTML
  - `database.json` - Backend schema and sample data
  - `server.js` - Express server code
  - `package.json` - Node.js dependencies
  - `Dockerfile` - Docker configuration

---

## Branding Endpoints

### GET /branding/:tenantId
Retrieve tenant branding configuration.

**Request:**
```http
GET /api/branding/67a1b2c3d4e5f6g7h8i9j0k2 HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "ok": true,
  "branding": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k11",
    "tenantId": "67a1b2c3d4e5f6g7h8i9j0k2",
    "companyName": "Acme Corp",
    "companyDescription": "Leading software solutions",
    "logo": "https://res.cloudinary.com/...",
    "favicon": "https://res.cloudinary.com/...",
    "primaryColor": "#1f2937",
    "secondaryColor": "#3b82f6",
    "accentColor": "#06b6d4",
    "backgroundColor": "#ffffff",
    "textColor": "#1f2937",
    "fontHeading": "Inter",
    "fontBody": "Inter",
    "images": [
      { "url": "https://res.cloudinary.com/...", "alt": "Office", "uploadedAt": "2026-03-20T08:00:00.000Z" }
    ],
    "services": [
      {
        "_id": "67a1b2c3d4e5f6g7h8i9j0k12",
        "name": "Web Development",
        "description": "Custom web applications for your business",
        "price": 5000,
        "icon": "🌐"
      }
    ],
    "createdAt": "2026-03-01T08:00:00.000Z",
    "updatedAt": "2026-03-30T10:30:00.000Z"
  }
}
```

---

### PUT /branding/:tenantId
Update branding fields.

**Request:**
```json
{
  "companyName": "Updated Corp",
  "primaryColor": "#ff5733",
  "secondaryColor": "#33ff57",
  "fontHeading": "Outfit",
  "fontBody": "Poppins"
}
```

**Response (200):**
```json
{
  "ok": true,
  "branding": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k11",
    "tenantId": "67a1b2c3d4e5f6g7h8i9j0k2",
    "companyName": "Updated Corp",
    "primaryColor": "#ff5733",
    "secondaryColor": "#33ff57",
    "fontHeading": "Outfit",
    "fontBody": "Poppins",
    "updatedAt": "2026-03-30T11:00:00.000Z"
  }
}
```

---

### POST /branding/:tenantId/upload-logo
Upload or replace the tenant logo.

**Request:**
```
POST /api/branding/67a1b2c3d4e5f6g7h8i9j0k2/upload-logo HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data

[Binary image file]
```

**Response (200):**
```json
{
  "ok": true,
  "logo": "https://res.cloudinary.com/your-cloud/image/upload/..."
}
```

---

### POST /branding/:tenantId/upload-image
Upload a gallery image.

**Request:**
```
POST /api/branding/67a1b2c3d4e5f6g7h8i9j0k2/upload-image HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data

file: [Binary image file]
alt: "Company office photo"
```

**Response (200):**
```json
{
  "ok": true,
  "image": {
    "url": "https://res.cloudinary.com/your-cloud/image/upload/...",
    "alt": "Company office photo",
    "uploadedAt": "2026-03-30T11:00:00.000Z"
  }
}
```

---

### DELETE /branding/:tenantId/images/:imageId
Remove an image from the gallery.

**Request:**
```http
DELETE /api/branding/67a1b2c3d4e5f6g7h8i9j0k2/images/67a1b2c3d4e5f6g7h8i9j0k13 HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "ok": true,
  "message": "Image deleted"
}
```

---

### POST /branding/:tenantId/services
Add a service offering.

**Request:**
```json
{
  "name": "Mobile Development",
  "description": "iOS and Android application development",
  "price": 7500,
  "icon": "📱"
}
```

**Response (201):**
```json
{
  "ok": true,
  "service": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k14",
    "name": "Mobile Development",
    "description": "iOS and Android application development",
    "price": 7500,
    "icon": "📱"
  }
}
```

---

### PUT /branding/:tenantId/services/:serviceId
Update a service.

**Request:**
```json
{
  "price": 8000,
  "description": "Updated description"
}
```

**Response (200):**
```json
{
  "ok": true,
  "service": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k14",
    "name": "Mobile Development",
    "description": "Updated description",
    "price": 8000,
    "icon": "📱"
  }
}
```

---

### DELETE /branding/:tenantId/services/:serviceId
Remove a service.

**Request:**
```http
DELETE /api/branding/67a1b2c3d4e5f6g7h8i9j0k2/services/67a1b2c3d4e5f6g7h8i9j0k14 HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "ok": true,
  "message": "Service deleted"
}
```

---

## Team Endpoints

### GET /team
List all team members in the tenant.

**Request:**
```http
GET /api/team HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "members": [
      {
        "_id": "67a1b2c3d4e5f6g7h8i9j0k1",
        "name": "John Doe",
        "email": "john@acme.com",
        "role": "admin",
        "tenant": "67a1b2c3d4e5f6g7h8i9j0k2",
        "status": "active",
        "createdAt": "2026-03-01T08:00:00.000Z"
      },
      {
        "_id": "67a1b2c3d4e5f6g7h8i9j0k15",
        "name": "Jane Smith",
        "email": "jane@acme.com",
        "role": "editor",
        "tenant": "67a1b2c3d4e5f6g7h8i9j0k2",
        "status": "active",
        "createdAt": "2026-03-15T10:00:00.000Z"
      }
    ],
    "limit": 10
  }
}
```

---

### POST /team/invite
Invite a new team member.

**Request:**
```json
{
  "name": "Sarah Johnson",
  "email": "sarah@acme.com",
  "role": "editor"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k16",
    "name": "Sarah Johnson",
    "email": "sarah@acme.com",
    "role": "editor",
    "tenant": "67a1b2c3d4e5f6g7h8i9j0k2",
    "status": "invited",
    "createdAt": "2026-03-30T11:00:00.000Z"
  }
}
```

**Response (403):**
```json
{
  "success": false,
  "error": "Team member limit reached. Upgrade your plan."
}
```

---

### PUT /team/:id/role
Change a team member's role.

**Request:**
```json
{
  "role": "admin"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k15",
    "name": "Jane Smith",
    "email": "jane@acme.com",
    "role": "admin",
    "tenant": "67a1b2c3d4e5f6g7h8i9j0k2",
    "status": "active"
  }
}
```

---

### DELETE /team/:id
Remove a team member.

**Request:**
```http
DELETE /api/team/67a1b2c3d4e5f6g7h8i9j0k15 HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Team member removed"
}
```

**Response (400):**
```json
{
  "success": false,
  "error": "Cannot remove yourself"
}
```

---

### GET /team/permissions
Retrieve permissions for the current user's role.

**Request:**
```http
GET /api/team/permissions HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "role": "admin",
    "permissions": [
      "website.create",
      "website.edit",
      "website.delete",
      "page.create",
      "page.edit",
      "page.delete",
      "ai.generate",
      "deploy.create",
      "billing.view",
      "billing.manage",
      "analytics.view",
      "team.invite",
      "team.changeRole",
      "team.remove"
    ]
  }
}
```

---

## Analytics Endpoints

### GET /analytics
Retrieve tenant analytics and metrics.

**Request:**
```http
GET /api/analytics HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "websites": 5,
      "published": 3,
      "deployments": 2,
      "totalVisitors": 15420,
      "totalPageViews": 42890,
      "avgBounceRate": 28
    },
    "traffic": [
      {
        "date": "2026-03-01",
        "visitors": 450,
        "pageViews": 1200,
        "bounceRate": 25
      },
      {
        "date": "2026-03-02",
        "visitors": 520,
        "pageViews": 1450,
        "bounceRate": 22
      }
    ],
    "topPages": [
      { "path": "/", "views": 8200, "avgTime": "2m 15s" },
      { "path": "/services", "views": 3400, "avgTime": "3m 10s" },
      { "path": "/about", "views": 2100, "avgTime": "1m 45s" }
    ],
    "topReferrers": [
      { "source": "Google", "visitors": 6168 },
      { "source": "Direct", "visitors": 3855 },
      { "source": "Twitter", "visitors": 2313 }
    ],
    "webVitals": {
      "lcp": "2.1s",
      "fid": "45ms",
      "cls": "0.052"
    }
  }
}
```

---

### GET /analytics/logs
Retrieve activity logs with filtering and pagination.

**Request:**
```http
GET /api/analytics/logs?page=1&limit=20&action=ai.generate&entityType=website HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "_id": "67a1b2c3d4e5f6g7h8i9j0k17",
        "user": {
          "id": "67a1b2c3d4e5f6g7h8i9j0k1",
          "name": "John Doe",
          "email": "john@acme.com"
        },
        "tenant": "67a1b2c3d4e5f6g7h8i9j0k2",
        "action": "ai.generate",
        "entityType": "website",
        "entityId": "67a1b2c3d4e5f6g7h8i9j0k3",
        "details": {
          "prompt": "Build a modern e-commerce website",
          "version": 3,
          "htmlLength": 16100
        },
        "ipAddress": "192.168.1.100",
        "createdAt": "2026-03-30T10:30:00.000Z"
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 20
  }
}
```

---

## Billing Endpoints

### GET /billing
Retrieve billing information, plan details, and invoices.

**Request:**
```http
GET /api/billing HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "plan": "professional",
    "price": 79,
    "limits": {
      "websites": 50,
      "pages": 500,
      "aiGenerations": 1000,
      "teamMembers": 10
    },
    "usage": {
      "websites": 5,
      "pages": 28,
      "aiGenerations": 342,
      "teamMembers": 2
    },
    "invoices": [
      {
        "_id": "67a1b2c3d4e5f6g7h8i9j0k18",
        "tenant": "67a1b2c3d4e5f6g7h8i9j0k2",
        "amount": 79,
        "plan": "professional",
        "status": "paid",
        "description": "Monthly subscription - Professional",
        "period": {
          "start": "2026-03-01T00:00:00.000Z",
          "end": "2026-03-31T23:59:59.999Z"
        },
        "paymentMethod": {
          "type": "card",
          "last4": "4242",
          "brand": "Visa"
        },
        "createdAt": "2026-03-01T08:00:00.000Z"
      }
    ]
  }
}
```

---

### POST /billing/change-plan
Upgrade or downgrade subscription plan.

**Request:**
```json
{
  "plan": "enterprise"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "plan": "enterprise",
    "limits": {
      "websites": -1,
      "pages": -1,
      "aiGenerations": -1,
      "teamMembers": -1
    },
    "usage": {
      "websites": 5,
      "pages": 28,
      "aiGenerations": 342,
      "teamMembers": 2
    }
  }
}
```

**Response (400):**
```json
{
  "success": false,
  "error": "Invalid plan"
}
```

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

### Common HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden (access denied)
- 404: Not Found
- 500: Internal Server Error

---

## Rate Limiting
Currently, no explicit rate limiting is enforced. Implement based on deployment requirements.

---

## Versioning
API version 1.0 - March 2026

---
