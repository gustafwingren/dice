# Azure Static Web Apps Deployment

This directory contains the GitHub Actions workflow for deploying the Digital Dice Creator to Azure Static Web Apps.

## Overview

The CI/CD pipeline automatically:
- ✅ Runs type checking (`npm run type-check`)
- ✅ Runs linting (`npm run lint`)
- ✅ Runs unit tests with coverage (`npm run test:coverage`)
- ✅ Runs E2E tests (`npm run test:e2e`)
- ✅ Builds the Next.js application (`npm run build`)
- ✅ Deploys to Azure Static Web Apps
- ✅ Creates PR preview deployments

## Setup Instructions

### 1. Create Azure Static Web App

You can create an Azure Static Web App either through the Azure Portal or Azure CLI:

#### Option A: Azure Portal
1. Go to [Azure Portal](https://portal.azure.com)
2. Create a new **Static Web App**
3. Choose the **Free** plan
4. Connect to your GitHub repository
5. Set build configuration:
   - **App location**: `/`
   - **API location**: *(leave empty)*
   - **Output location**: `out`

#### Option B: Azure CLI
```bash
# Login to Azure
az login

# Create resource group
az group create --name dice-rg --location eastus2

# Create Static Web App
az staticwebapp create \
  --name dice-app \
  --resource-group dice-rg \
  --source https://github.com/YOUR_USERNAME/dice \
  --location eastus2 \
  --branch main \
  --app-location "/" \
  --output-location "out" \
  --login-with-github
```

### 2. Get Deployment Token

After creating the Static Web App:

1. Go to your Static Web App in the Azure Portal
2. Navigate to **Settings** → **Configuration**
3. Copy the **Deployment token**

Or use Azure CLI:
```bash
az staticwebapp secrets list --name dice-app --resource-group dice-rg --query "properties.apiKey" -o tsv
```

### 3. Add GitHub Secret

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
5. Value: *paste your deployment token*
6. Click **Add secret**

## Development Workflow

### Recommended Git Flow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/my-feature-name
   ```

2. **Make your changes and commit**:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin feature/my-feature-name
   ```

3. **Create a Pull Request** on GitHub targeting `main`:
   - GitHub Actions automatically runs all tests
   - If tests pass, deploys to a **preview environment**
   - Azure bot comments on the PR with preview URL (e.g., `https://dice-app-123.azurestaticapps.net`)

4. **Test your changes** on the preview URL:
   - Fully functional environment
   - Independent from production
   - Perfect for stakeholder review

5. **Merge the PR**:
   - Automatically deploys to **production**
   - Preview environment is automatically cleaned up
   - Production URL updated with your changes

### Workflow Triggers

The workflow runs on:
- **Pull requests to `main`** (opened, synchronized, reopened, closed)
  - Creates preview environment for testing
  - Runs full test suite before deployment
- **Push to `main`** (merged PRs or direct commits)
  - Deploys to production environment

### Jobs

#### `build_and_test`
Runs on push and PR open/sync:
1. Checkout code
2. Setup Node.js 20 with npm cache
3. Install dependencies (`npm ci`)
4. Type checking
5. Linting
6. Unit tests with coverage
7. E2E tests (Playwright)
8. Build Next.js app
9. Deploy to Azure

#### `close_pull_request`
Runs when PR is closed:
- Removes PR preview deployment from Azure

### Artifacts

The workflow uploads test results as artifacts:
- **coverage-report**: Unit test coverage (7 days retention)
- **playwright-report**: E2E test results (7 days retention)

## Configuration Files

### `public/staticwebapp.config.json`

Configures Azure Static Web Apps behavior:

**Routing**:
- `/styleguide` → Static page
- `/library` → Static page
- `/set` → Static page
- `/share/*` → Dynamic route with URL parameter
- `/*` → SPA fallback to index.html

**Security Headers**:
- Content-Security-Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy
- Permissions-Policy
- Strict-Transport-Security (HSTS)

**SPA Support**:
- Navigation fallback to index.html
- 404 errors return index.html with 200 status

## Local Testing

Before pushing, verify locally:

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Build
npm run build

# Check output
ls -la out/
```

## Deployment URLs

### Production
After merging to `main`, your app deploys to:
- **Production URL**: `https://dice-app.azurestaticapps.net` (or your custom domain)

### Preview Environments (Pull Requests)
Each PR gets its own preview environment:
- **Preview URL**: `https://dice-app-{pr-number}.azurestaticapps.net`
- URL is automatically commented on the PR by the Azure Static Web Apps bot
- Preview environment is active while PR is open
- Automatically deleted when PR is closed or merged

### Finding Your URLs
- **Azure Portal**: Static Web App → Overview
- **GitHub Actions**: Workflow logs show deployment URLs
- **PR Comments**: Azure bot automatically posts preview URLs
- **CLI**: `az staticwebapp show --name dice-app --resource-group dice-rg --query "defaultHostname" -o tsv`

## Monitoring

Monitor deployments:
1. **GitHub Actions**: Check workflow runs in the Actions tab
2. **Azure Portal**: View deployment history and logs
3. **Azure Monitor**: Set up alerts for errors or performance issues

## Custom Domains

To add a custom domain:

1. Go to Azure Portal → Static Web App → Custom domains
2. Click **Add** and follow the wizard
3. Update DNS records at your domain provider:
   - **CNAME**: Point to Azure Static Web App URL
   - Or **TXT**: For domain verification

## Troubleshooting

### Workflow fails at type-check
- Check for TypeScript errors locally: `npm run type-check`
- Review the GitHub Actions logs for specific errors

### Workflow fails at linting
- Run locally: `npm run lint`
- Fix linting errors or add exceptions to `.eslintrc.json`

### Workflow fails at unit tests
- Run locally: `npm run test`
- Check coverage report artifact in GitHub Actions
- Review failed test details in the workflow logs

### Workflow fails at E2E tests
- Download the Playwright report artifact from GitHub Actions
- Run locally with UI: `npm run test:e2e:headed`
- Check if tests pass locally but fail in CI (timing issues)

### Deployment fails
- **Secret not set**: Verify `AZURE_STATIC_WEB_APPS_API_TOKEN` exists in repository secrets
- **Token expired**: Regenerate deployment token in Azure Portal
- **Build output issue**: Verify `out/` directory contains built files
- **Azure quota**: Check if Free tier limits are exceeded

### Preview environment not created
- Check if PR targets `main` branch
- Verify GitHub Actions workflow completed successfully
- Look for Azure bot comment (may take 2-3 minutes)
- Check Azure Portal for staging environments

### 404 errors in production/preview
- Verify `staticwebapp.config.json` routes are correct
- Check Next.js static export: `ls -la out/`
- Test routing locally: `npx serve out`
- Check browser console and network tab for errors

### Changes not visible after deployment
- **Cache issue**: Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
- **Wrong environment**: Confirm you're viewing the correct URL
- **Deployment incomplete**: Check GitHub Actions for completion status
- **Build issue**: Verify `npm run build` succeeds locally

## Cost

Azure Static Web Apps pricing:
- **Free tier**: Included in Azure subscription
  - 100 GB bandwidth/month
  - 0.5 GB storage
  - Custom domains
  - Automatic HTTPS
  
- **Standard tier**: $9/month (if needed)
  - Unlimited bandwidth
  - 2 GB storage
  - Custom authentication
  - SLA 99.95%

The Digital Dice Creator uses the **Free tier** by default.

## Additional Resources

- [Azure Static Web Apps Documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
