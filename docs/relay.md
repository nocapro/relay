Here is the master plan to decouple the monolithic frontend into a robust monorepo architecture. We are extracting the simulation logic into a dedicated ElysiaJS backend, establishing a strict boundary between UI and data using OpenAPI contracts.

```yaml
plan:
  uuid: 'monorepo-migration-v1'
  status: 'todo'
  title: 'Refactor to Monorepo: Decoupling Frontend from Backend Logic'
  introduction: |
    The current architecture couples data persistence and simulation logic directly within the React/Vite frontend. This limits scalability and violates separation of concerns.

    We will transition to a workspace-based monorepo. The existing frontend will move to `apps/web`. A new high-performance backend using ElysiaJS will be instantiated at `apps/api`. State mutations and data retrieval will be handled via a strictly typed OpenAPI client (Eden Treaty), removing all mock data and simulation timers from the client-side stores.
  parts:
    - uuid: 'part-1-monorepo-structure'
      status: 'todo'
      name: 'Part 1: Infrastructure & API Skeleton'
      reason: |
        We need to establish the physical separation of concerns before writing logic. Moving the frontend to a dedicated workspace and initializing the Elysia server ensures clean boundaries.
      steps:
        - uuid: 'step-1-folder-restructure'
          status: 'todo'
          name: '1. Initialize Workspace & Move Frontend'
          reason: |
            Standardize the directory structure for a pnpm/bun workspace.
          files:
            - package.json
            - tsconfig.json
            - vite.config.ts
          operations:
            - 'Create root `package.json` with workspace configuration.'
            - 'Move current root files and `src` into `apps/web`.'
            - 'Update `apps/web/vite.config.ts` and `tsconfig.json` paths to reflect the new location.'
            - 'Ensure `apps/web` runs independently in the new location.'
        - uuid: 'step-2-init-elysia'
          status: 'todo'
          name: '2. Initialize ElysiaJS Backend'
          reason: |
            Set up the backend runtime environment with Swagger support.
          files: []
          operations:
            - 'Create `apps/api` directory.'
            - 'Initialize `apps/api/package.json` with `elysia`, `@elysiajs/swagger`, and `@elysiajs/cors`.'
            - 'Create `apps/api/src/index.ts` with a basic health check and Swagger documentation enabled.'
            - 'Define shared types (copied from `app.types.ts`) or setup a shared package (simplified: copy for now) to ensure model consistency.'
      context_files:
        compact:
          - package.json
          - vite.config.ts
        medium:
          - package.json
          - vite.config.ts
          - tsconfig.json
        extended:
          - package.json
          - vite.config.ts
          - tsconfig.json
          - src/types/app.types.ts

    - uuid: 'part-2-backend-logic'
      status: 'todo'
      name: 'Part 2: Backend Implementation & Simulation'
      reason: |
        The backend must serve as the single source of truth. We will port the JSON mock data into an in-memory store within Elysia and expose strict REST endpoints.
      steps:
        - uuid: 'step-1-port-data'
          status: 'todo'
          name: '1. Implement Data Store & Models'
          reason: |
            Move static JSON data to the server and strictly type it using Elysia `t` (TypeBox) for OpenAPI generation.
          files:
            - src/services/mock-data.json
            - src/types/app.types.ts
          operations:
            - 'Create `apps/api/src/store.ts` to load and manage the in-memory state derived from `mock-data.json`.'
            - 'Define Elysia models for `Transaction` and `Prompt` in `apps/api/src/models.ts` to match `app.types.ts`.'
        - uuid: 'step-2-api-endpoints'
          status: 'todo'
          name: '2. Create REST Routes'
          reason: |
            Frontend needs endpoints to fetch lists and mutate states (apply/revert).
          files:
            - src/services/api.service.ts
          operations:
            - 'Implement `GET /prompts` and `GET /transactions` in Elysia.'
            - 'Implement `PATCH /transactions/:id/status` to handle state transitions (e.g., PENDING -> APPLIED).'
            - 'Add artificial delay in the `PATCH` handler to mimic the "Apply" latency previously done in Redux/Zustand.'
            - 'Enable CORS for `localhost:5173` (or the web port).'
      context_files:
        compact:
          - src/services/mock-data.json
          - src/types/app.types.ts
        medium:
          - src/services/mock-data.json
          - src/types/app.types.ts
          - src/services/api.service.ts
        extended:
          - src/services/mock-data.json
          - src/types/app.types.ts
          - src/services/api.service.ts
          - src/store/slices/transaction.slice.ts

    - uuid: 'part-3-frontend-wiring'
      status: 'todo'
      name: 'Part 3: Frontend Integration (Eden Client)'
      reason: |
        The frontend must stop being a "god object" of logic. We replace local services with the auto-generated type-safe client from the backend.
      steps:
        - uuid: 'step-1-api-client'
          status: 'todo'
          name: '1. Setup Eden Client'
          reason: |
            Establish the type-safe bridge between Web and API.
          files:
            - src/services/api.service.ts
          operations:
            - 'Install `elysia` (as type dependency) and `@elysiajs/eden` in `apps/web`.'
            - 'Refactor `apps/web/src/services/api.service.ts` to export the Eden client instance pointed at the API URL.'
            - 'Delete `apps/web/src/services/mock-data.json`.'
        - uuid: 'step-2-clean-stores'
          status: 'todo'
          name: '2. Refactor Zustand Stores'
          reason: |
            Remove simulation logic from stores; delegate to async API calls.
          files:
            - src/store/slices/transaction.slice.ts
            - src/store/slices/prompt.slice.ts
          operations:
            - 'Update `fetchTransactions` and `fetchPrompts` to use the Eden client.'
            - 'Rewrite `applyTransactionChanges` in `transaction.slice.ts`. Remove `setTimeout` and local status toggling. Instead, await the API call to `PATCH /transactions/:id` and update state based on response.'
            - 'Remove the `socket` mock logic from `api.service.ts` (unless implementing real websockets, we will stick to REST polling or simple fetching for this iteration).'
      context_files:
        compact:
          - src/services/api.service.ts
          - src/store/slices/transaction.slice.ts
        medium:
          - src/services/api.service.ts
          - src/store/slices/transaction.slice.ts
          - src/store/slices/prompt.slice.ts
        extended:
          - src/services/api.service.ts
          - src/store/slices/transaction.slice.ts
          - src/store/slices/prompt.slice.ts
          - src/types/app.types.ts

  conclusion: |
    This refactor successfully separates the application concerns. The frontend is now a pure view layer consuming a documented API. The backend owns the data lifecycle and business logic (like simulated delays). The use of Eden/OpenAPI guarantees end-to-end type safety without manual type duplication.
  context_files:
    compact:
      - package.json
      - src/services/api.service.ts
      - src/store/slices/transaction.slice.ts
    medium:
      - package.json
      - src/services/api.service.ts
      - src/store/slices/transaction.slice.ts
      - src/services/mock-data.json
    extended:
      - package.json
      - vite.config.ts
      - src/services/api.service.ts
      - src/store/slices/transaction.slice.ts
      - src/services/mock-data.json
      - src/types/app.types.ts
```