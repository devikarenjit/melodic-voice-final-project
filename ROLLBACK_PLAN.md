# Melodic Voice — Rollback & Monitoring Plan

## Deployment platform

The frontend is deployed through Vercel from the GitHub repository.

## Monitoring

For the MVP, deployment health is checked through:

- Vercel deployment status
- Live production URL
- Manual smoke testing of the main user journey
- Lighthouse audits
- WAVE accessibility audits
- GitHub repository history

## Smoke test after deployment

After a deployment:

1. Open the production URL.
2. Confirm the application loads.
3. Open the Dashboard.
4. Open AI Stories.
5. Confirm story cards are displayed.
6. Test the main navigation.
7. Check the mobile layout.
8. Check for visible error states.

## Rollback plan

If a new deployment introduces a critical problem:

1. Identify the last known-good commit on the `main` branch.
2. Revert the problematic change in GitHub.
3. Push the reverted commit to `main`.
4. Vercel creates a new deployment from the updated `main` branch.
5. Open the production URL and repeat the smoke test.
6. Confirm the application is working again.

## Recovery principle

The `main` branch is treated as the source of truth for the production frontend.

Rollback method:

GitHub `main` → revert bad change → push → Vercel redeploy → smoke test.