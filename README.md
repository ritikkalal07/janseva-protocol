# JanSeva Protocol

Open-source civic infrastructure for AI-assisted public services, anonymous reporting, and transparent governance.

## Overview

JanSeva Protocol is a capture-resistant civic platform built to help people navigate government systems, request benefits, report corruption, and access legal guidance without gatekeepers.

The app combines:

- AI-powered civic assistance with language-aware responses
- transparent, immutable submission logging
- anonymous reporting and audit trails
- community governance and open-source accountability

## Key Features

- **AI Civic Assistant**: Ask for help with RTI, welfare, legal aid, corruption reporting, and government services.
- **Offline Civic Library**: Free, always-on guidance for common civic problems when AI is unavailable.
- **Transparent Audit Log**: Every submission is recorded in a public ledger for verification.
- **Anonymous by Default**: User identity is not stored unless explicitly provided.
- **Multilingual Support**: Built to help users across regions and languages.
- **Ongoing Governance**: Governance and community review flows are included in the platform.

## Tech Stack

- **Frontend**: React 19, Vite 7, Tailwind CSS 4
- **Routing / SSR**: @tanstack/react-start and @tanstack/react-router
- **AI**: `ai` SDK with a custom Lovable AI gateway provider
- **Auth / Data**: Supabase
- **Deployment**: Vercel with custom SSR routing via `vercel.json`

## Project Structure

- `src/` — application source code
- `src/routes/` — route pages for `/`, `/chat`, `/audit`, `/governance`, and `/submit`
- `src/lib/` — AI gateway, server functions, utilities, and configuration
- `src/integrations/supabase/` — Supabase client, auth middleware, and types
- `src/server.ts` — SSR server entrypoint
- `vercel.json` — Vercel build and routing configuration

## Getting Started

### Requirements

- Node.js 20 or later
- npm
- A public Supabase project
- AI gateway API key (`LOVABLE_API_KEY` or `AI_GATEWAY_API_KEY`)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root with the following values:

```env
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-key>
SUPABASE_URL=<your-supabase-url>
SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-key>
AI_GATEWAY_API_KEY=<your-ai-gateway-key>
# or
LOVABLE_API_KEY=<your-ai-gateway-key>
# Optional: override the AI model used by the gateway
AI_MODEL=google/gemini-3-flash-preview
```

### Run Locally

```bash
npm run dev -- --port 3000
```

Open `http://localhost:3000` in the browser.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Deployment

This repository includes `vercel.json` for Vercel deployment. The current configuration builds the app and routes all traffic through the custom SSR entrypoint at `src/server.ts`.

To deploy using Vercel:

```bash
npx vercel
```

## Contribution

Contributions are welcome. Please follow these steps:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add ..."`
4. Push to your fork and open a pull request.

## Hackathon Submission Notes

This README is built to satisfy open-source hackathon submission guidelines:

- clear project description
- installation and run instructions
- feature overview
- deployment and contribution details

For the Elite Coders Open Source Hackathon 2026, please refer to the submission guide at: https://github.com/elite-coders-xyz/Open-Source-Hackathon-Submissions

## License

This project is licensed under the MIT License. See `LICENSE` for details.
