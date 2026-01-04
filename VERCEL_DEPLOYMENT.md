# Deploying Evaluation Branch to Vercel

This guide explains how to deploy the `evaluation` branch to Vercel without merging to main.

## Option 1: Deploy from Vercel Dashboard (Recommended)

### Step 1: Push the evaluation branch to GitHub/GitLab/Bitbucket

```bash
git push origin evaluation
```

### Step 2: Connect/Select Branch in Vercel Dashboard

1. **If this is your first deployment:**

   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your Git repository
   - In the "Configure Project" step, click on the branch dropdown
   - Select `evaluation` branch instead of `main`
   - Configure your build settings (see below)
   - Click "Deploy"

2. **If you already have a Vercel project:**
   - Go to your project dashboard on Vercel
   - Click on the "Settings" tab
   - Go to "Git" section
   - Under "Production Branch", you can temporarily change it to `evaluation`
   - OR create a new deployment by:
     - Going to "Deployments" tab
     - Click "Create Deployment"
     - Select branch: `evaluation`
     - Click "Deploy"

### Step 3: Configure Build Settings

In the Vercel project settings, ensure these build settings:

**Build Command:**

```bash
npm run build
```

**Output Directory:**

```
dist
```

**Install Command:**

```bash
npm install
```

**Root Directory:**

```
./  (leave empty or use .)
```

### Step 4: Set Environment Variables (if needed)

If your app requires environment variables:

1. Go to Project Settings → Environment Variables
2. Add any required variables
3. Make sure to select the environment (Production, Preview, Development)

For the evaluation branch, you typically don't need environment variables since it uses mock data.

## Option 2: Deploy Using Vercel CLI

### Step 1: Install Vercel CLI (if not installed)

```bash
npm i -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Make sure you're on the evaluation branch

```bash
git checkout evaluation
```

### Step 4: Deploy the branch

```bash
vercel --prod
```

Or to create a preview deployment:

```bash
vercel
```

## Option 3: Create a Separate Project for Evaluation

If you want to keep evaluation deployments separate from main:

1. In Vercel Dashboard, click "Add New Project"
2. Select the same repository
3. Name it something like: `pest-i-evaluation`
4. Select `evaluation` branch as the production branch
5. Configure build settings as above
6. Deploy

This way, you'll have:

- `your-project.vercel.app` → main branch (production)
- `pest-i-evaluation.vercel.app` → evaluation branch (testing)

## Important Notes

### Evaluation Mode is Already Enabled

The `evaluation` branch is configured with:

- ✅ Auto-login (no authentication required)
- ✅ Mock data for all features
- ✅ All functionality works without backend

### Branch Protection

After evaluation is complete:

- You can simply switch back to `main` branch in Vercel settings
- Or create a new branch from `main` for production deployments
- The evaluation branch remains available for future testing

### Custom Domain (Optional)

If you want a custom domain for evaluation:

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Troubleshooting

### Build Fails

- Check that Node.js version in Vercel matches your local version
- Verify build command is correct
- Check build logs in Vercel dashboard for errors

### Missing Environment Variables

- Evaluation branch doesn't need backend API URLs (uses mocks)
- But if you have other env vars, add them in Vercel settings

### Deployment Not Updating

- Make sure you've pushed latest changes: `git push origin evaluation`
- Trigger a new deployment in Vercel dashboard

## Quick Commands Summary

```bash
# 1. Ensure you're on evaluation branch
git checkout evaluation

# 2. Make sure all changes are committed
git add .
git commit -m "Enhanced dummy data for evaluation"

# 3. Push to remote
git push origin evaluation

# 4. Deploy via CLI (optional)
vercel --prod

# OR deploy via dashboard (recommended)
# Go to vercel.com → Your Project → Deployments → Create Deployment → Select 'evaluation'
```

## After Deployment

Once deployed, share the Vercel URL with your client:

- Preview deployments: `your-project-{hash}.vercel.app`
- Production: `your-project.vercel.app` (if evaluation is set as production branch)

The evaluation site will:

- ✅ Load directly to dashboard (no login)
- ✅ Show rich, realistic data
- ✅ Work fully without backend connection
- ✅ Be perfect for UI/UX evaluation
