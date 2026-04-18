# Deploy Backend To Render

## Option A: Blueprint (Recommended)

1. Push this repository to GitHub.
2. In Render, click New +, then Blueprint.
3. Select this repository.
4. Render reads [render.yaml](../render.yaml) and creates the service.
5. Fill all required environment variables before first deploy.

## Option B: Manual Web Service

1. In Render, click New +, then Web Service.
2. Connect this repository.
3. Configure:

- Root Directory: backend
- Runtime: Node
- Build Command: npm install
- Start Command: npm start
- Health Check Path: /healthz

## Required Environment Variables

- DATABASE_URL
- CLERK_SECRET_KEY
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

## Optional Environment Variable

- EXPO_PUBLIC_API_URL (recommended so Swagger points to your deployed API URL)

## Recommended Variable

- NODE_ENV=production

## Verify Deployment

After deploy, open:

- https://YOUR-RENDER-URL/healthz

Expected response:

{"success":true,"status":"ok"}

If health check fails, first confirm DATABASE_URL and Cloudinary variables are set correctly.
