# SitePilot Backend

## Overview
The backend is a Node.js and Express service for SitePilot. It powers authentication, tenant and user management, website projects, versioning, branding, deployment export, analytics, and AI-assisted generation workflows.

## Latest updates reflected in this version
- API structure is organized by domain routes for improved maintainability.
- Builder and generation integrations have been aligned with current frontend workflows.
- Dynamic backend generation and export flows are available for generated website projects.

## Core capabilities
- Multi-tenant data model with tenant-scoped operations.
- Role-based access control for admin and editor permissions.
- JWT-based authentication and protected routes.
- Website generation, version management, and restore support.
- Branding asset and content management with media upload handling.
- Deployment and export endpoints for packaged output.

## Main route groups
- /api/auth
- /api/projects
- /api/branding
- /api/tenants
- /api/websites
- /api/pages
- /api/site-backends
- /api/ai
- /api/deploy
- /api/billing
- /api/analytics
- /api/team
- /api/export

## Tech stack
- Node.js
- Express
- MongoDB with Mongoose
- JSON Web Token (JWT)
- bcryptjs
- Multer
- Cloudinary integration
- Gemini and Groq SDK integrations

## Local development
1. Install dependencies:
   npm install
2. Configure environment variables in .env (database, JWT secret, AI keys, Cloudinary credentials, port).
3. Start development server:
   npm run dev
4. Start production mode:
   npm start

## Health check
- GET /api/health returns service status and timestamp.
