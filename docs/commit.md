feat: restructure to monorepo with ElysiaJS backend

- Moved frontend to apps/web with React Router + Vite
- Created apps/api with ElysiaJS backend and Swagger
- Added in-memory store with mock data for transactions/prompts
- Configured Eden Treaty client for type-safe API calls
- Fixed build: react-router.config.ts, tsconfig.json, tsc issues
- Updated .idx/dev.nix with workspace filters and api preview
- Updated repomix.config.json for new monorepo paths
