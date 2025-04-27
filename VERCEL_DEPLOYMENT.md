# Deploying IMS to Vercel

This guide will walk you through deploying both the frontend and backend of the Inventory Management System to Vercel.

## Prerequisites

- A [Vercel](https://vercel.com) account (sign up for free)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (free tier available)
- The repository code pushed to GitHub at: https://github.com/lucasdmarshall/IMS

## Deploying the Backend

1. **Log in to Vercel**:
   - Go to [Vercel](https://vercel.com) and log in with your account.

2. **Create a new project**:
   - Click "Add New" > "Project".
   - Import your GitHub repository (IMS).
   - If you don't see your repo, you might need to configure Vercel to access your GitHub account.

3. **Configure the backend deployment**:
   - Select the repository root directory as your project.
   - Set the following options:
     - Framework Preset: `Other`
     - Root Directory: `backend`
     - Build Command: `npm install`
     - Output Directory: `.`
     - Install Command: `npm install`

4. **Set environment variables**:
   - You need to add all the same environment variables from your `.env` file:
     - `MONGODB_URI`: Your MongoDB connection string (from MongoDB Atlas)
     - `JWT_SECRET`: A secure random string for JWT tokens
     - `PORT`: Not required on Vercel (it's ignored)
     - Add any other environment variables your app uses

5. **Deploy**:
   - Click "Deploy".
   - Vercel will build and deploy your backend application.
   - Once deployed, note the URL (e.g., `https://ims-backend.vercel.app`).

## Deploying the Frontend

1. **Create another new project in Vercel**:
   - Click "Add New" > "Project".
   - Import the same GitHub repository.

2. **Configure the frontend deployment**:
   - Set the following options:
     - Framework Preset: `Create React App`
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Output Directory: `build`
     - Install Command: `npm install`

3. **Set environment variables**:
   - Add the following environment variables:
     - `REACT_APP_API_URL`: The URL of your deployed backend API plus `/api/v1` (e.g., `https://ims-backend.vercel.app/api/v1`)

4. **Deploy**:
   - Click "Deploy".
   - Vercel will build and deploy your frontend application.
   - Once deployed, note the URL (e.g., `https://ims-frontend.vercel.app`).

## Alternative Approach: Deploy as a Monorepo

If you prefer to deploy both applications from a single Vercel project:

1. **Create a `vercel.json` file in the root directory**:

```json
{
  "buildCommand": "cd frontend && npm install && npm run build && cd ../backend && npm install",
  "outputDirectory": "frontend/build",
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" }
  ],
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  }
}
```

2. **Deploy the project as a whole**.

3. **Remember to set all required environment variables**.

## Common Deployment Issues

1. **CORS errors**: Ensure your backend allows requests from your frontend domain.

2. **Environment variables**: Double-check that all required environment variables are set correctly.

3. **MongoDB connection**: Make sure your MongoDB Atlas cluster is:
   - Properly configured
   - Has network access allowed for Vercel's IP ranges (or set to allow access from anywhere for testing)
   - Has a database user with the correct permissions

4. **Build errors**: If you encounter build errors, check the Vercel deployment logs.

## Verifying the Deployment

1. Visit your frontend URL (e.g., `https://ims-frontend.vercel.app`).
2. Try to log in or perform other operations that interact with the backend.
3. Check the Network tab in your browser's developer tools to ensure API requests are going to the correct URL.
4. Monitor logs in the Vercel dashboard for any errors.

## Updating Your Deployment

Any changes pushed to your GitHub repository will automatically trigger a new deployment on Vercel if you've configured automatic deployments (the default setting). 