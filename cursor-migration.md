# Cursor Migration & Local Development Guide

This document provides an overview of the ReferdBy codebase (originally built in Lovable.dev) and instructions on how to set it up for local development in Cursor, disconnecting any Lovable-specific dependencies.

## Project Overview

- **Frontend**: React 18 with Vite and TypeScript.
- **UI Components**: Shadcn UI (Radix UI) and Tailwind CSS.
- **Backend/Database**: Supabase.
- **Mobile**: Capacitor (configured for iOS and Android).
- **State Management**: TanStack Query (React Query).
- **Routing**: React Router DOM v6.
- **Key Integrations**:
  - Google Maps & Mapbox for location services.
  - QR Code scanning and generation.
  - Internationalization (i18next).
  - Charts (Recharts).

## Removed Lovable Dependencies

The following Lovable-specific dependencies have been removed or updated to ensure a pure local development experience:

1.  **lovable-tagger**: (Removed) Uninstalled the package and removed its configuration from `vite.config.ts`.
2.  **GPT Engineer Script**: (Removed) Verified that no real-time editing scripts exist in `index.html`.
3.  **Hardcoded Supabase Credentials**: (Updated) The Supabase client now supports environment variables via `.env` (with hardcoded fallbacks removed/refactored).
4.  **Lovable Documentation**: (Updated) Replaced the Lovable-centric `README.md` with standard project documentation.

---

## Step-by-Step Disconnection & Setup Plan

### 1. Remove Lovable Tagger & GPT Engineer Script

- **Action**: The `lovable-tagger` package has been uninstalled, and its reference removed from `vite.config.ts`. The `gptengineer.js` script (if it existed) is also gone.
- **Status**: Completed.
- **Reason**: These are only useful within the Lovable.dev environment and add unnecessary overhead to your local development.

### 2. Configure Environment Variables

- **Action**: Create a `.env` file based on the provided `.env.example` and move the Supabase credentials there.
- **Status**: Code updated to support environment variables; `.env.example` file created.
- **Current Location**: `src/integrations/supabase/client.ts`
- **Setup**: 
  1. Copy `.env.example` to `.env`.
  2. The application will now prioritize variables in `.env` over the hardcoded fallbacks.
- **Update Client**: `src/integrations/supabase/client.ts` has been updated to use `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`.

### 3. Install Dependencies

Run the following command in your terminal:
```bash
npm install
```

### 4. Local Development Run

Start the Vite development server:
```bash
npm run dev
```
The app should now be running at `http://localhost:8080`.

### 5. Mobile Development (Capacitor)

If you wish to run the app on iOS or Android:
1. Build the project: `npm run build`
2. Sync with Capacitor: `npx cap sync`
3. Open in Xcode/Android Studio: `npx cap open ios` or `npx cap open android`

---

## Project Structure Overview

- `src/components/`: Contains reusable UI components, organized by feature.
- `src/pages/`: Main application routes and page-level components.
- `src/integrations/`: Third-party service configurations (currently just Supabase).
- `src/hooks/`: Custom React hooks for data fetching and logic.
- `src/contexts/`: React Context providers for global state (e.g., Auth).
- `src/services/`: Business logic and API calls.
- `src/utils/`: Helper functions and shared utilities.
- `supabase/`: Contains database migrations and edge functions (if any).
- `public/lovable-uploads/`: Assets uploaded via the Lovable editor, now stored locally.

## Key Scripts

- `npm run dev`: Starts the local development server.
- `npm run build`: Generates a production build in the `dist/` directory.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm run preview`: Previews the production build locally.

## Next Steps for You

1.  **Environment Variables**: A `.env.example` file has been created for you. Copy it to `.env` in the root directory to customize your Supabase credentials.
    ```bash
    cp .env.example .env
    ```
2.  **Authentication**: Test the login/signup flow to ensure the Supabase connection is working correctly.
3.  **Mobile Testing**: If you are targeting mobile, follow the Capacitor instructions to sync and open the project in Xcode or Android Studio.

