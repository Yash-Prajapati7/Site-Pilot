# SitePilot Frontend

## Overview
The frontend is a React and Vite application that provides the SitePilot user experience, including authentication, dashboard navigation, website builder workflows, and role-based access to project operations.

## Latest updates reflected in this version
- Builder page UI has been refreshed for a clearer generation workflow.
- Integration reliability has improved across website, backend generation, and version-related interactions.
- Route protection continues to enforce role-aware access for admin and editor users.

## Key pages and flows
- Public flows: home, register, login, IAM login.
- Authenticated dashboard: websites, website detail, builder, versions, branding, domains, deployments, team, analytics, and billing.
- Builder workflow includes prompt-driven generation, preview handling, version history support, and dynamic backend visibility.

## Tech stack
- React 18
- React Router
- Vite
- Axios
- Lucide React

## Local development
1. Install dependencies:
   npm install
2. Start development server:
   npm run dev
3. Build production bundle:
   npm run build
4. Preview production build:
   npm run preview

## Notes
- Frontend expects backend APIs to be available and reachable through configured service endpoints.
- Protected routes require a valid auth token and the correct user role.
