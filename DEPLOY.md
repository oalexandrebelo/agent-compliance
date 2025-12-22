# Deployment Instructions

## Prerequisites
- GitHub Account connected to Vercel
- Circle Developer Account (for API Key)
- Gemini API Key

## Deploy to Vercel

1. **Push to GitHub**: Ensure all code is committed and pushed to your repository.
2. **Import Project**: Go to Vercel Dashboard > Add New > Project > Import from GitHub.
3. **Environment Variables**: Add the following variables in the Vercel setup screen:
   - `DATABASE_URL`: Your PostgreSQL connection string (Supabase/Neon/Railway)
   - `GEMINI_API_KEY`: Google AI Studio API Key
   - `CIRCLE_API_KEY`: Circle Developer Console API Key
   - `NEXT_PUBLIC_CIRCLE_APP_ID`: Your Circle App ID
   - `CIRCLE_WALLET_SET_ID`: (Optional) Your Wallet Set ID
   - `COMPLIANCE_OFFICER_KEY`: A secure random string for admin actions
4. **Build Settings**:
   - Framework Preset: Next.js
   - Build Command: `npx prisma generate && next build` (Already configured in package.json)
5. **Windows Users**: Local builds may fail with `os error 1314`. This is normal on Windows; the code will deploy correctly on Vercel.
6. **Deploy**: Click Deploy!

## Post-Deployment
- Go to `/settings` to configure your initial risk thresholds.
- Go to `/agents` to register your first autonomous agent.
- Run the "Deep Scan" to verify Gemini integration.

## Troubleshooting
- **Prisma Error**: If you see "Prisma Client not found", go to Settings > General > Build & Development Settings and ensure the build command is `npx prisma generate && next build`.
- **Lint Errors during Build**: The project is configured to bypass non-critical lint errors during production builds (`ignoreBuildErrors: true`), so minor warnings will not block deployment.
