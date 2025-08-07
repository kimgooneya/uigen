# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Setup Commands

```bash
npm run setup        # Install dependencies, generate Prisma client, and run migrations
npm run dev          # Start development server with Turbopack
npm run dev:daemon   # Start dev server in background, logs to logs.txt
npm run build        # Build for production
npm run lint         # Run ESLint
npm run test         # Run tests with Vitest
npm run db:reset     # Reset database and run migrations
```

## Testing
- Uses Vitest with jsdom environment for testing
- Test files are located alongside components in `__tests__` directories
- Run individual tests: `npm run test -- <test-file-name>`

## Architecture Overview

UIGen is an AI-powered React component generator with the following key architectural components:

### Core System
- **Next.js 15** with App Router and React 19
- **Virtual File System**: In-memory file system (`VirtualFileSystem` class) that doesn't write to disk
- **AI Integration**: Uses Anthropic Claude via Vercel AI SDK with streaming responses
- **Database**: Prisma with SQLite for user authentication and project persistence

### Key Contexts
- **FileSystemProvider**: Manages virtual file operations and tool integrations
- **ChatProvider**: Handles AI chat interactions and tool calls via Vercel AI SDK
- **Authentication**: JWT-based auth with bcrypt password hashing

### Main Components
- **ChatInterface**: AI chat interface for component generation requests
- **CodeEditor**: Monaco-based editor for viewing/editing generated code
- **PreviewFrame**: Live preview of generated React components
- **FileTree**: Virtual file system navigator

### AI Tools Integration
The system uses custom AI tools for file operations:
- `str_replace_editor`: File creation, string replacement, and line insertion
- `file_manager`: File renaming and deletion

### Database Schema
- **User**: Basic auth (id, email, password)
- **Project**: Stores chat messages and virtual file system state as JSON
- The database schema is defined in the @prisma\schema.prisma file. Reference it anytime you need to understand the structure of data stored in the database.

### File Structure Patterns
- Actions in `src/actions/` for server-side operations
- Components organized by feature in `src/components/`
- Context providers in `src/lib/contexts/`
- AI tools in `src/lib/tools/`
- Database utilities in `src/lib/` (auth.ts, prisma.ts)

## Environment Variables
- `ANTHROPIC_API_KEY`: Required for AI functionality (app works with mock responses without it)
- Database connection automatically configured via Prisma schema

## Code Style Guidelines
- Use comments sparingly. Only comment complex code.