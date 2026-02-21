# Site Pilot Backend Setup Guide

## Quick Start

### 1. Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API key
- Cloudinary account

### 2. Environment Setup

#### Clone & Install
```bash
cd backend
npm install
```

#### Configure `.env`
```bash
# Database
MONGO_URI=mongodb://localhost:27017/site-pilot

# JWT
JWT_SECRET=your_super_secret_key_change_this_in_prod

# AI (Gemini)
GEMINI_API_KEY=sk-proj-...

# Image Hosting (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=5000
```

### 3. Run the Server
```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

Server will be at: `http://localhost:5000`

---

## API Testing Workflow

### 1. Register New Tenant
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "tenantName": "Acme Corp",
  "tenantSlug": "acme-corp",
  "ownerName": "John Doe",
  "ownerEmail": "john@acme.com",
  "password": "password123"
}
```

**Response:**
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

Save the `token` for subsequent requests.

---

### 2. Update Branding (Admin Only)
```bash
PUT http://localhost:5000/api/branding/67a1b2c3d4e5f6g7h8i9j0k2
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "companyName": "Acme Corp",
  "companyDescription": "Leading software solutions",
  "primaryColor": "#1f2937",
  "secondaryColor": "#3b82f6",
  "fontHeading": "Outfit",
  "fontBody": "Inter"
}
```

---

### 3. Add Services (Admin Only)
```bash
POST http://localhost:5000/api/branding/67a1b2c3d4e5f6g7h8i9j0k2/services
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Web Development",
  "description": "Custom web applications for your business",
  "price": 5000,
  "icon": "🌐"
}
```

---

### 4. Create Project
```bash
POST http://localhost:5000/api/projects/67a1b2c3d4e5f6g7h8i9j0k2
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "E-Commerce Store",
  "description": "Online product marketplace"
}
```

**Response includes:** `id`, `name`, `userId`, `status: 'draft'`

---

### 5. Generate Website via AI
```bash
POST http://localhost:5000/api/projects/67a1b2c3d4e5f6g7h8i9j0k2/67a1b2c3d4e5f6g7h8i9j0k3/generate
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "prompt": "Build a modern e-commerce website with a hero section, product grid, testimonials, and call-to-action buttons. Make it professional and sleek."
}
```

**Response includes:**
```json
{
  "ok": true,
  "version": {
    "versionNumber": 1,
    "htmlCode": "<!DOCTYPE html>...",
    "userPrompt": "Build a modern e-commerce...",
    "status": "active",
    "brandingSnapshot": { /* branding at generation time */ }
  }
}
```

---

### 6. Get Version History
```bash
GET http://localhost:5000/api/projects/67a1b2c3d4e5f6g7h8i9j0k2/67a1b2c3d4e5f6g7h8i9j0k3/versions
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Returns array of all versions with timestamps and status.

---

### 7. Rollback to Previous Version
```bash
PUT http://localhost:5000/api/projects/67a1b2c3d4e5f6g7h8i9j0k2/67a1b2c3d4e5f6g7h8i9j0k3/versions/67a1b2c3d4e5f6g7h8i9j0k5/rollback
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Sets the specified version as `active` and all others as `inactive`.

---

### 8. Invite Team Member (Admin Only)
```bash
POST http://localhost:5000/api/tenants/67a1b2c3d4e5f6g7h8i9j0k2/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@acme.com",
  "password": "securepass123",
  "role": "editor"
}
```

---

### 9. Upload Logo (Admin Only)
```bash
POST http://localhost:5000/api/branding/67a1b2c3d4e5f6g7h8i9j0k2/upload-logo
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

[Binary image file]
```

---

## Database Initialization

The backend automatically creates indexes and validates data on first run. No manual migration needed.

To reset MongoDB:
```bash
mongo
> use site-pilot
> db.dropDatabase()
```

---

## Troubleshooting

### "No token provided"
- Add `Authorization: Bearer <token>` header to requests
- Token must be from `/auth/register` or `/auth/login`

### "Admin role required"
- User must have `role: 'admin'` in the database
- Only first registered user (tenant owner) has admin role
- Admin can invite other admins via `/tenants/:tenantId/users`

### "Tenant not found"
- Verify tenantId is correct
- tenantId must match the URL param
- User's token tenantId must match URL tenantId

### Gemini API Error
- Check `GEMINI_API_KEY` is valid and has quota
- Verify internet connection
- Check API is enabled in Google Cloud Console

### Cloudinary Upload Fails
- Verify credentials in `.env`
- Check file size < 5MB
- Ensure file is image/video format

---

## Production Deployment Checklist

- [ ] Update `JWT_SECRET` to strong random value
- [ ] Use MongoDB Atlas (not local)
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS on frontend URL
- [ ] Add CORS whitelist for frontend domain
- [ ] Configure rate limiting on sensitive endpoints
- [ ] Set up error logging (Sentry, LogRocket, etc.)
- [ ] Add request validation middleware
- [ ] Create database backups
- [ ] Monitor API performance and errors

---

## File Structure
```
backend/
├── models/          (Mongoose schemas)
├── routes/          (API endpoints)
├── middleware/      (Auth, validation)
├── services/        (Gemini, Cloudinary)
├── config/          (Database config)
├── server.js        (Express entry point)
├── package.json
├── .env
└── ARCHITECTURE.md  (This file)
```

---

## Useful Commands

### Check MongoDB Connection
```bash
mongo "mongodb://localhost:27017/site-pilot"
> db.tenants.find()
```

### View API Logs
```bash
npm run dev 2>&1 | tee logs.txt
```

### Test Gemini API
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';
const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });
const result = await model.generateContent('Hello');
console.log(result.response.text());
```

---

For more details, see [ARCHITECTURE.md](./ARCHITECTURE.md)
