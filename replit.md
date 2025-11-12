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

- **2025-11-12**: Production-ready deployment setup
  - ✅ Migrated from localStorage to Supabase Database
  - ✅ Created `scripts` table with Row Level Security (RLS)
  - ✅ Configured Autoscale deployment (build + run commands)
  - ✅ Tested script saving/loading functionality
  - ✅ Fixed scrolling bug in SavedScriptsPage
  - ✅ Created deployment documentation (ИНСТРУКЦИЯ_ПО_ПУБЛИКАЦИИ.md)
  - ✅ Created security setup SQL (supabase-security-setup.sql)

## Running the Application

### Development
The dev workflow automatically runs `npm run dev` which starts the Vite development server on port 5000.

### Production Deployment
Ready to publish! See **ИНСТРУКЦИЯ_ПО_ПУБЛИКАЦИИ.md** for step-by-step instructions.

**Quick start:**
1. Enable RLS policies (run `supabase-security-setup.sql`)
2. Click "Deploy" button in Replit
3. Wait 2-5 minutes for build & deployment
4. Share the link with your users (5-7 people)

**Deployment config:**
- Type: Autoscale (web application)
- Build: `npm run build`
- Run: `npm run preview` (serves on port 5000)

## User Flow
1. Login/Register page (Supabase authentication)
2. Upload video for analysis
3. Processing page (AI analysis with mock data)
4. Results page (generated scripts)
5. Save scripts to Supabase Database
6. Saved scripts page (view previous analyses from database)
7. Help page

## Current Features
- ✅ User authentication with Supabase
- ✅ Video upload interface
- ✅ AI analysis with mock data (demo mode)
- ✅ **Persistent data storage** in Supabase Database
- ✅ Save and retrieve analyzed scripts
- ✅ Row Level Security (each user sees only their data)
- ✅ Success celebration animation
- ✅ Fully responsive mobile UI
- ✅ Search functionality in saved scripts
- ✅ Production deployment ready

## Data Storage
- **Development**: Supabase PostgreSQL (free tier)
- **User data**: Isolated per user with RLS policies
- **Capacity**: 500 MB database (sufficient for 5-7 users)
- **Scripts table**: Stores title, original transcription, keys, script scenes, recommendations

## Cost Estimate (for 5-7 users)
- **Supabase**: FREE (within free tier limits)
- **Replit Deployment**: FREE or ~$7/month (depends on traffic)
- **Total**: FREE or minimal cost

## Architecture Notes
- **Frontend**: React + TypeScript + Vite
- **Database**: Supabase PostgreSQL with RLS
- **Auth**: Supabase Auth (email/password)
- **Deployment**: Replit Autoscale
- **AI**: Mock data (real Gemini integration optional)
