# Crystal Events Full-Stack Application

This is a monorepo containing the frontend (React + Vite) and backend (Node.js + Express) for Crystal Events.

## Architecture
- `/client`: Frontend built with React, Vite, Tailwind CSS, Framer Motion, React Query, React Hook Form.
- `/server`: Backend API built with Express and local JSON seed data.

## Local Development

From the root directory, install all dependencies:
```bash
npm run install:all
```

Start both the client and server concurrently:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`
The backend will run on `http://localhost:5000`

## Deployment to Railway

This project is structured as a monorepo and is ready for deployment on Railway.

### Step-by-Step Guide

1. Push this repository to GitHub.
2. In Railway, create a new project from your GitHub repo.
3. **Backend Service:**
   - Create a service from the repo and set the Root Directory to `/server`.
   - Railway will automatically detect the Node.js environment.
   - Add environment variable `PORT=5000` (or leave it empty and let Railway assign one).
4. **Frontend Service:**
   - Create another service from the same repo and set the Root Directory to `/client`.
   - Railway will detect Vite.
   - Under Settings > Build Command, ensure it's `npm run build`.
   - Under Settings > Start Command, set it to serve the static files, or use Railway's static site deployment option.
   - **Important:** Add an environment variable to the frontend (e.g., `VITE_API_URL`) pointing to your backend service's public URL, and update `client/vite.config.js` or API call logic to use this URL in production.

## Future Enhancements
- Integrate a real database like PostgreSQL (using Prisma).
- Build an Admin Dashboard for managing bookings.
- Implement Nodemailer for real email notifications on the `/api/enquiries` endpoint.
- Add image upload capabilities for halls and gallery.
