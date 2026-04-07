# RecurVoice1

This is the standalone Next.js web app for RecurVoice.

## Local run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production build

```bash
npm install
npm run build
npm start
```

The app builds with no required environment variables. In that mode it runs as a demo with local fallback data.

## Environment variables

Copy `.env.example` to `.env.local` and set only the variables you need:

- `NEXT_PUBLIC_APP_URL`: your site URL.
- `GOOGLE_AI_API_KEY`: enables the RecurVoice AI chat route.
- `GOOGLE_AI_MODEL`: optional override for the chat model.
- `RECURVOICE_API_URL` and `RECURVOICE_API_KEY`: connect the app to the external analysis API.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`: enable Supabase auth and persistence.
- `RESEND_API_KEY`: enables caregiver email sending.

## Vercel settings

Use these project settings in Vercel:

- Framework Preset: `Next.js`
- Root Directory: `.`
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: leave empty
- Node.js Version: `20.x`

Minimum useful environment variable in Vercel:

- `NEXT_PUBLIC_APP_URL=https://<your-vercel-domain>`

Recommended optional variables:

- `GOOGLE_AI_API_KEY`
- `GOOGLE_AI_MODEL`
- `RECURVOICE_API_URL`
- `RECURVOICE_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
