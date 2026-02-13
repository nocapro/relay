plan:
  uuid: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0'
  status: 'todo'
  title: 'The Boilerplate Exorcism: DRY Enforcement'
  introduction: |
    We are drowning in unnecessary verbosity. The backend manually parses query strings like it's 2010, and the frontend transaction component is a 500-line monstrosity mixing presentation with observation logic.
    
    This refactor targets the elimination of low-value code. We will force the backend schema validator to do the heavy lifting, extracting query parsing logic entirely. On the frontend, we will decouple the 'observer' pattern from the 'view' pattern, moving IntersectionObserver logic into a dedicated hook to slash the component size.
    
    Less code means fewer bugs. Let the framework work for you.
  parts:
    - uuid: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1'
      status: 'todo'
      name: 'Backend: Schema-Driven Query Parsing'
      reason: |
        Manual query parsing is brittle and verbose. Elysia provides powerful validation schemas that can handle defaults and type coercion automatically. 
        
        Currently, `transactions.ts` manually extracts and casts `page` and `limit`. We will define these constraints in the route's schema, removing the need for manual guards inside the handler function.
      steps:
        - uuid: 'c3d4e5f6-a7b8-9012-3456-78901abcdef2'
          status: 'todo'
          name: 'Define Query Schema in Routes'
          reason: |
            Replace manual destructuring with a strict schema definition. This moves validation to the framework layer and removes defensive coding lines.
          files:
            - apps/api/src/routes/transactions.ts
            - apps/api/src/models.ts
          operations:
            - 'Import `t` from `elysia` is already present.'
            - 'In `apps/api/src/routes/transactions.ts`, update the `query` object in the route definition to include `page: t.Numeric({ default: 1 })` and `limit: t.Numeric({ default: 15 })`.'
            - 'Refactor the handler signature to destructure `{ query }`.'
            - 'Delete the manual parsing lines: `const page = Number(query.page) || 1;` and `const limit = ...`. Use `query.page` and `query.limit` directly.'
            - 'Remove the manual check for `undefined` strings in `store.ts` as the schema enforces types and defaults before the store is called.'
      context_files:
        compact:
          - apps/api/src/routes/transactions.ts
          - apps/api/src/store.ts
        medium:
          - apps/api/src/routes/transactions.ts
          - apps/api/src/store.ts
          - apps/api/src/models.ts
        extended:
          - apps/api/src/routes/transactions.ts
          - apps/api/src/store.ts
          - apps/api/src/models.ts
          - apps/api/src/index.ts

    - uuid: 'd4e5f6a7-b8c9-0123-4567-89012abcdef3'
      status: 'todo'
      name: 'Frontend: Extract Observer Logic into Custom Hook'
      reason: |
        The `TransactionCard` component is too fat. It manages UI, state, AND intersection observation logic for the "active file" outline feature.
        
        We will extract the entire `IntersectionObserver` setup, the `useEffect`, and the `activeFileIndex` state into a `useScrollSpy` hook. This reduces the component complexity and makes the logic reusable.
      steps:
        - uuid: 'e5f6a7b8-c9d0-1234-5678-90123abcdef4'
          status: 'todo'
          name: 'Create useScrollSpy Hook'
          reason: |
            Isolate the scroll tracking logic.
          files:
            - apps/web/src/hooks/scroll-spy.hook.ts
          operations:
            - 'Create `apps/web/src/hooks/scroll-spy.hook.ts`.'
            - 'Export a function `useScrollSpy` accepting `refs: Map<number, HTMLDivElement>`.'
            - 'Implement the `IntersectionObserver` logic currently residing in `TransactionCard` inside this hook.'
            - 'Return `activeFileIndex` and `scrollToBlock` function.'
        - uuid: 'f6a7b8c9-d0e1-2345-6789-01234abcdef5'
          status: 'todo'
          name: 'Refactor TransactionCard to use Hook'
          reason: |
            Remove the logic from the component and consume the hook.
          files:
            - apps/web/src/features/transactions/components/transaction-card.component.tsx
            - apps/web/src/hooks/scroll-spy.hook.ts
          operations:
            - 'Import `useScrollSpy` in `transaction-card.component.tsx`.'
            - 'Remove the `activeFileIndex` state and the `useEffect` containing `IntersectionObserver` logic.'
            - 'Replace local `scrollToBlock` logic with the one returned by the hook.'
            - 'Verify the "Outline" sidebar still highlights correctly by passing the refs from the component to the hook.'
      context_files:
        compact:
          - apps/web/src/features/transactions/components/transaction-card.component.tsx
          - apps/web/src/hooks/scroll-spy.hook.ts
        medium:
          - apps/web/src/features/transactions/components/transaction-card.component.tsx
          - apps/web/src/hooks/scroll-spy.hook.ts
          - apps/web/src/features/transactions/components/file-section.component.tsx
        extended:
          - apps/web/src/features/transactions/components/transaction-card.component.tsx
          - apps/web/src/hooks/scroll-spy.hook.ts
          - apps/web/src/features/transactions/components/file-section.component.tsx
          - apps/web/src/hooks/mobile.hook.ts

    - uuid: 'a7b8c9d0-e1f2-3456-7890-12345abcdef6'
      status: 'todo'
      name: 'UI: Unify Card Styling Primitives'
      reason: |
        `TransactionCard` and `PromptCard` repeat identical styling boilerplate (zinc backgrounds, border opacity, rounded corners).
        
        We will create a generic `ContentCard` wrapper component (or update existing UI primitives) to consume these common styles, reducing the inline class noise in feature components.
      steps:
        - uuid: 'b8c9d0e1-f2a3-4567-8901-23456abcdef7'
          status: 'todo'
          name: 'Create Generic Card Component'
          reason: |
            Abstract the `bg-zinc-900 border-zinc-800 rounded-xl` pattern.
          files:
            - apps/web/src/components/ui/card.ui.tsx
            - apps/web/src/utils/cn.util.ts
          operations:
            - 'Create `apps/web/src/components/ui/card.ui.tsx` (Note: check if exists from context, if not create).'
            - 'Define a `Card` component accepting `className` and children.'
            - 'Apply base styles: `bg-zinc-900/40 border border-zinc-800 rounded-xl transition-all`.'
            - 'Export `Card`.'
        - uuid: 'c9d0e1f2-a3b4-5678-9012-34567abcdef8'
          status: 'todo'
          name: 'Apply Card Primitive to Features'
          reason: |
            Consume the new primitive to reduce LOC in feature files.
          files:
            - apps/web/src/features/prompts/components/prompt-card.component.tsx
            - apps/web/src/features/transactions/components/transaction-card.component.tsx
            - apps/web/src/components/ui/card.ui.tsx
          operations:
            - 'Refactor `PromptCard` to wrap content in the new `Card` component, removing redundant classes.'
            - 'Refactor `TransactionCard` to use the `Card` component for its outer wrapper.'
            - 'Remove hard-coded string classes related to card backgrounds/borders from both files.'
      context_files:
        compact:
          - apps/web/src/components/ui/card.ui.tsx
          - apps/web/src/features/prompts/components/prompt-card.component.tsx
        medium:
          - apps/web/src/components/ui/card.ui.tsx
          - apps/web/src/features/prompts/components/prompt-card.component.tsx
          - apps/web/src/features/transactions/components/transaction-card.component.tsx
        extended:
          - apps/web/src/components/ui/card.ui.tsx
          - apps/web/src/features/prompts/components/prompt-card.component.tsx
          - apps/web/src/features/transactions/components/transaction-card.component.tsx
          - apps/web/src/utils/cn.util.ts

  conclusion: |
    By forcing the backend schema to handle the "plumbing" of validation and extracting frontend observation logic into hooks, we achieve a significant reduction in Lines of Code (LOC).
    
    The codebase becomes more declarative: the backend describes *what* valid data looks like, not how to parse it. The frontend components describe *what* to render, not how to calculate scroll positions. This is the essence of maintainable architecture.
  context_files:
    compact:
      - apps/api/src/routes/transactions.ts
      - apps/web/src/features/transactions/components/transaction-card.component.tsx
    medium:
      - apps/api/src/routes/transactions.ts
      - apps/web/src/features/transactions/components/transaction-card.component.tsx
      - apps/web/src/hooks/scroll-spy.hook.ts
      - apps/web/src/components/ui/card.ui.tsx
    extended:
      - apps/api/src/routes/transactions.ts
      - apps/web/src/features/transactions/components/transaction-card.component.tsx
      - apps/web/src/hooks/scroll-spy.hook.ts
      - apps/web/src/components/ui/card.ui.tsx
      - apps/api/src/store.ts
      - apps/web/src/features/prompts/components/prompt-card.component.tsx