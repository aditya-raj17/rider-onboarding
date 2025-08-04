# Deployment Guide

## GitHub Pages Deployment

This project is configured to deploy to GitHub Pages automatically.

### Prerequisites

1. Your repository must be public (or you need GitHub Pro for private repos)
2. The repository name should be `rider_onboarding` (or update the base path in `vite.config.ts`)

### Automatic Deployment (Recommended)

The project uses GitHub Actions for automatic deployment:

1. Push your changes to the `main` branch
2. GitHub Actions will automatically:
   - Install dependencies
   - Build the project
   - Deploy to GitHub Pages

### Manual Deployment

If you prefer manual deployment:

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```

### Configuration

- **Base Path**: The app is configured for repository name `rider_onboarding`
- **Backend URL**: Points to your Render.com deployment at `https://rider-onboarding.onrender.com/api`

### GitHub Pages Settings

1. Go to your repository settings
2. Navigate to "Pages" section
3. Set source to "GitHub Actions"
4. The site will be available at: `https://yourusername.github.io/rider_onboarding/`

### Troubleshooting

- If the site doesn't load, check that the base path in `vite.config.ts` matches your repository name
- Ensure your backend is running on Render.com
- Check GitHub Actions logs for build errors 