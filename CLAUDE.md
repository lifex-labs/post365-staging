# Master Instructions for post365-mvp-2

## Project Scope
Build a full stack, fully secure, hack-proof web app.

## Design Style
Modern, minimalist, and very compact unless specified otherwise.
Design must be mobile-first and responsive.

## Typography Rules
- Default font: Inter (loaded via Google Fonts)
- Default font size: 14px
- Default font weight: normal (400)
- Minimum font size permitted without explicit user approval: 12px
- Maximum font size permitted without explicit user approval: 24px
- Never use em-dash or en-dash anywhere in the app: labels, descriptions, messages, tooltips, placeholders, or any other UI text
- Use a regular hyphen (-) where a dash is needed

## Page Typography Standards
- Page header (h1): font-size 20px, font-weight 700, color var(--text)
- Page description (subtitle): font-size 13px, color var(--text-2), line-height 1.5
- On desktop and tablet (min-width 769px): page description truncated to a single line (overflow hidden, text-overflow ellipsis, white-space nowrap)
- On mobile (max-width 768px): page description truncated to two lines (-webkit-line-clamp: 2)

## Navigation Typography
- Nav item font-size: 14px, font-weight: 500

## Approval Gate
For every change request, analyze it and present a concise Plan of Action (POA) covering: what will change, which files are affected, and any decisions or trade-offs. Wait for explicit user approval before executing. Do not begin any implementation until approval is confirmed.

## Security Requirements
- No API keys, secrets, env variables, or database access must be exposed in the frontend
- No sensitive information must be visible in the browser console
- App must be fully secure at all times
- No unauthorized access must be possible
- All backend routes that return protected data must verify a JWT token via middleware
- JWT secret must only live in server environment variables, never in the client

## Deployment
- Default target: apps must be easily deployable to cloud platforms like Netlify and Vercel
- Factor and structure code for clean cloud deployability (environment variable handling, correct build output, no server-only dependencies leaking into the frontend)
- Netlify config: netlify.toml at repo root, base = "client" (relative to version folder e.g. 2.2/)
- Vercel config: vercel.json at repo root (version folder e.g. 2.2/), outputDirectory = "client/dist"

## Code Structure
- Always build in a structured manner with reusable components
- Separate concerns clearly: frontend lives in client/, backend lives in server/
- Frontend: React + Vite in client/
- Backend: Node.js API in server/
- Never mix frontend and backend code across these directories

## Viewport & Layout
- App uses full available width up to 2000px (2K)
- Beyond 2K, content is centered with max-width: 2000px
- Fixed elements (sidebar) align with the centered container on ultra-wide screens using calc((100vw - 2000px) / 2)

## Theme
- Default theme is light
- Use CSS custom properties with [data-theme="dark"] on documentElement
- Persist theme in localStorage; prevent flash with an inline script in index.html before React mounts
- No theme toggle in the UI

## Navigation Structure
- Desktop (min-width 769px): visible left sidebar with nav items, settings, logout
- Mobile (max-width 768px): top nav bar with hamburger menu icon on the right side; tapping opens a full drawer containing nav items, settings and logout
- No bottom nav bar on any breakpoint

## Button Height
- Default button height is 32px for all buttons unless a specific height is required

## Icon Library
- Default icon library: lucide-react
- Only use a different icon library when explicitly requested

## CTA Button Colors
- Primary CTA: blue (var(--blue) background)
- Secondary CTA: black/dark (var(--text) background)
- Tertiary CTA: outline (transparent background, border)

## Spacing Defaults
- Default left and right padding for cards and buttons: 16px
- Default gap between cards: 8px

## Multi-thread / Non-blocking
- Frontend: use React.lazy + Suspense for code splitting so pages load in parallel and the rest of the UI stays usable while a page is loading
- Backend: use async/await and Promise.all for all I/O-bound operations so the server never blocks on a single request

## Local Development
- Node version managed with nvm; always source nvm before running node/npm: source ~/.nvm/nvm.sh && nvm use <version>
- Frontend runs from client/ with: npm run dev
- Backend runs from server/ with: node src/index.js

## Polling
When polling a service or API: retry every 10 seconds for a maximum of 10 minutes total. On timeout or transient failure before the 10-minute limit, retry gracefully without showing an error in the UI. Only surface an error after all retries are exhausted.

## Testing
Always use a testing agent to verify everything works as expected before delivering results.
