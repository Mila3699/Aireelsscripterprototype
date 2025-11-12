# AI Reels Scripter Prototype

## Overview
A React-based web application for analyzing video content and generating scripts using Google Gemini AI. The application uses Supabase for authentication, database, and storage.

## Tech Stack
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6
- **UI Components**: Radix UI, Tailwind CSS
- **Backend Services**: Supabase (Auth, Database, Storage)
- **AI Integration**: Google Gemini AI for video analysis

## Project Structure
```
src/
├── components/       # React components
│   ├── auth/        # Authentication components
│   ├── ui/          # Reusable UI components (Radix UI)
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── UploadPage.tsx
│   ├── ProcessingPage.tsx
│   ├── ResultsPage.tsx
│   ├── SavedScriptsPage.tsx
│   └── HelpPage.tsx
├── lib/             # Utility libraries
│   ├── supabase.ts  # Supabase client configuration
│   ├── api-supabase.ts  # Supabase API functions
│   └── validation.ts
├── styles/          # Global styles
└── App.tsx         # Main application component
```

## Development Setup
The application is configured to run on Replit with:
- **Dev Server**: Vite running on port 5000
- **Host**: 0.0.0.0 (required for Replit proxy)
- **Allowed Hosts**: Enabled for Replit iframe support

## Environment Variables
The application requires Supabase credentials:
- Supabase URL is hardcoded in the source
- Supabase key is managed in the application

## Recent Changes
- **2025-11-12**: Initial Replit setup
  - Configured Vite to run on port 5000
  - Set host to 0.0.0.0 for Replit compatibility
  - Enabled allowedHosts for proxy support
  - Fixed ES module compatibility (__dirname issue)
  - Created workflow for development server
  - Added .gitignore for Node.js project

## Running the Application
The dev workflow automatically runs `npm run dev` which starts the Vite development server on port 5000.

## User Flow
1. Login/Register page (Supabase authentication)
2. Upload video for analysis
3. Processing page (AI analysis)
4. Results page (generated scripts)
5. Saved scripts page (view previous analyses)
6. Help page

## Known Features
- Video upload and analysis
- User authentication with Supabase
- Script generation using Google Gemini AI
- Save and retrieve analyzed scripts
- Demo mode with mock data for testing
- Success celebration animation on analysis completion
