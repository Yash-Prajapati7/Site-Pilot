# SitePilot
[Site Pilot](https://sp.yaash.dev)
## Problem Statement

Organizations frequently need to launch websites rapidly; however, conventional workflows fragment responsibilities across design, content creation, frontend development, backend integration, deployment, and version control. This fragmentation introduces delays, increases handoff friction, and often results in inconsistent branding and reduced operational efficiency.

## Proposed Solution

SitePilot is an AI-assisted, multi-tenant website builder platform designed to streamline the end-to-end website creation lifecycle within a unified workspace. It enables teams to generate, refine, and deploy websites efficiently by integrating tenant-aware access control, prompt-driven content generation, version management, branding customization, and deployment workflows into a cohesive system.

## Key Features

* Multi-tenant architecture ensuring complete isolation between organizations.
* Role-based access control with clearly defined admin and editor permissions.
* AI-powered website generation using prompts, supporting iterative refinements.
* Interactive builder interface with real-time preview and version restoration capabilities.
* Centralized tenant-level branding and reusable design assets.
* Support for dynamic backend generation tailored to project requirements.
* Deployment export functionality with Docker-ready packaging.
* Comprehensive modules for team management, analytics, billing, and project governance.

## Architecture Overview
<img width="1927" height="627" alt="SitePilot Architecture" src="https://github-production-user-asset-6210df.s3.amazonaws.com/157267869/571405112-fd88aca3-70d4-49ca-be31-b6edc4efb245.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20260403%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260403T073226Z&X-Amz-Expires=300&X-Amz-Signature=fb204ab9034827bc337b034e77496790c7fe5661db44c85429955a5f376f0319&X-Amz-SignedHeaders=host" />
The system architecture is designed with a clear separation of concerns across multiple layers to ensure scalability, maintainability, and performance:

* **Frontend (React + Vite):** Manages authentication, dashboard navigation, builder interactions, and role-based user experiences.
* **Backend (Node.js + Express):** Provides modular APIs for authentication, project management, branding, website generation, deployment, analytics, billing, and team operations.
* **AI Services:** Handle prompt-based generation of frontend components and optional backend artifacts, enabling intelligent automation.
* **Database (MongoDB):** Stores tenant-scoped data including users, projects, versions, deployments, and activity logs.
* **Media Storage (Cloudinary):** Manages assets related to branding and generated content.

## UI Screenshots

### Landing Page
<img width="1919" height="873" alt="Landing page" src="https://github.com/user-attachments/assets/0a2c8f01-cd71-46f5-9023-621ec63afe44" />

### Dashboard
<img width="1909" height="873" alt="Dashboard" src="https://github.com/user-attachments/assets/f3354c97-76f8-46b3-b502-b2773479cd92" />

### Website Screen
<img width="1920" height="881" alt="Website screen" src="https://github.com/user-attachments/assets/46d0330f-2536-4afd-86e7-0e98feaed7f3" />

### Builder - Design Selection Screen
<img width="1920" height="874" alt="Builder - Design selection screen" src="https://github.com/user-attachments/assets/494bc4d0-6fbd-45b2-8fc1-af82eebe6777" />

### Builder - AI Generation Interface
<img width="1897" height="885" alt="Builder interface - Portfolio website generation" src="https://github.com/user-attachments/assets/11c6770b-dceb-48d4-904d-94bbd60ea096" />

### Builder - Backend Generation Example
<img width="1918" height="883" alt="Builder - Backend generation example" src="https://github.com/user-attachments/assets/3fcbb79c-9179-46ad-a0a6-ef957d7c639a" />

## Process Flow & Technology Stack

### Process Flow

1. An organization registers and initializes a tenant with an owner account.
2. Administrators configure branding and manage team access within the tenant.
3. Users (admins/editors) create and manage website projects.
4. The builder interface sends structured prompts to AI services for generation.
5. Generated outputs are stored as versioned artifacts, enabling preview and rollback.
6. Optional backend generation and deployment export processes are executed as required.

### Technology Stack

* **Frontend:** React 18, React Router, Vite, Axios, Lucide Icons
* **Backend:** Node.js, Express, Mongoose, JWT, bcrypt, Multer, CORS
* **AI Integration:** Gemini API and Groq-based model workflows
* **Database & Storage:** MongoDB, Cloudinary
* **Tooling:** Nodemon, Vite build system

## Conclusion

SitePilot delivers a comprehensive, scalable solution for rapid website development in multi-tenant environments. By consolidating design, development, and deployment workflows into a single platform and augmenting them with AI capabilities, it significantly reduces time-to-launch while maintaining governance, consistency, and operational control. Recent enhancements have further strengthened the builder experience and improved system reliability across the platform.
