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
<img width="1927" height="627" alt="SitePilot Architecture" src="https://github.com/user-attachments/assets/fd88aca3-70d4-49ca-be31-b6edc4efb245" />
The system architecture is designed with a clear separation of concerns across multiple layers to ensure scalability, maintainability, and performance:

* **Frontend (React + Vite):** Manages authentication, dashboard navigation, builder interactions, and role-based user experiences.
* **Backend (Node.js + Express):** Provides modular APIs for authentication, project management, branding, website generation, deployment, analytics, billing, and team operations.
* **AI Services:** Handle prompt-based generation of frontend components and optional backend artifacts, enabling intelligent automation.
* **Database (MongoDB):** Stores tenant-scoped data including users, projects, versions, deployments, and activity logs.
* **Media Storage (Cloudinary):** Manages assets related to branding and generated content.

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
