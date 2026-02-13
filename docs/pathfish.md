plan:
  uuid: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0'
  status: 'todo'
  title: 'Granular Multi-Select & Action Orchestration'
  introduction: |
    Show HN: We are refactoring the transaction stream to support high-fidelity multi-selection. 
    This isn't just adding checkboxes; it's about enabling "power user" flows—selecting 5 distinct transactions, 
    performing a batch revert, or exporting a deeply nested metadata report for auditing. 
    The architecture shifts from a singular "expanded view" state to a hybrid "selection set" state.
    
    We will implement a bulk-operations API layer, a client-side "Deep Copy" generator for granular metadata export, 
    and a contextual "Action Bar" that morphs based on user intent (Selection vs. Approval).
  parts:
    - uuid: 'b1c2d3e4-f5a6-7890-1234-56789abcdef1'
      status: 'todo'
      name: 'Part 1: Bulk Mutation Engine (Backend)'
      reason: |
        The backend currently handles transaction mutations individually. To support cohesive UX for multi-select, 
        we need atomic bulk endpoints. This prevents race conditions where 3 out of 5 reverts succeed, 
        leaving the UI in an inconsistent state. We will introduce a `/bulk` route and a store method 
        capable of transacting over multiple records simultaneously.
      steps:
        - uuid: 'c2d3e4f5-a6b7-7890-1234-56789abcdef2'
          status: 'todo'
          name: '1. Define Bulk Operation Models'
          reason: 'We need strict typing for the bulk request payload and response to ensure type safety across the monorepo.'
          files:
            - apps/api/src/models.ts
          operations:
            - 'Add `BulkActionRequest` type: `{ ids: string[], action: "revert" | "commit" | "apply" }`.'
            - 'Add `BulkActionResponse` type: `{ success: boolean; updatedIds: string[] }`.'
        - uuid: 'd3e4f5a6-b7c8-7890-1234-56789abcdef3'
          status: 'todo'
          name: '2. Implement Store Bulk Logic'
          reason: 'The in-memory store needs a method to filter and update status for an array of IDs efficiently.'
          files:
            - apps/api/src/store.ts
          operations:
            - 'Add `updateTransactionStatusBulk(ids: string[], status: TransactionStatus)` method.'
            - 'Iterate over `ids`, find transactions, update status, and notify subscribers (SSE) for each updated transaction to trigger real-time UI updates.'
        - uuid: 'e4f5a6b7-c8d9-7890-1234-56789abcdef4'
          status: 'todo'
          name: '3. Expose Bulk API Route'
          reason: 'Create the REST endpoint that the frontend will consume for batch actions.'
          files:
            - apps/api/src/routes/transactions.ts
          operations:
            - 'Add `POST /bulk` route to `transactionsRoutes`.'
            - 'Validate body against `BulkActionRequest`.'
            - 'Call `db.updateTransactionStatusBulk`.'
            - 'Return `BulkActionResponse`.'
      context_files:
        compact:
          - apps/api/src/models.ts
          - apps/api/src/store.ts
          - apps/api/src/routes/transactions.ts
        medium:
          - apps/api/src/models.ts
          - apps/api/src/store.ts
          - apps/api/src/routes/transactions.ts
        extended:
          - apps/api/src/models.ts
          - apps/api/src/store.ts
          - apps/api/src/routes/transactions.ts
          - apps/api/src/index.ts
    - uuid: 'f5a6b7c8-d9e0-7890-1234-56789abcdef5'
      status: 'todo'
      name: 'Part 2: Selection State Architecture (Frontend)'
      reason: |
        We need to introduce a "Selection Layer" to the global store. This decouples the UI view state 
        (expanded cards) from the action state (selected items). We will manage a `selectedIds` Set 
        for O(1) lookups and implement the API service hooks for the new bulk endpoints.
      steps:
        - uuid: 'a6b7c8d9-e0f1-7890-1234-56789abcdef6'
          status: 'todo'
          name: '1. Extend Transaction Slice'
          reason: 'Add state management for tracking selected transaction IDs.'
          files:
            - apps/web/src/store/slices/transaction.slice.ts
          operations:
            - 'Add state: `selectedIds: string[]` (default `[]`).'
            - 'Add action: `toggleSelection(id: string)` to add/remove IDs.'
            - 'Add action: `clearSelection()`.'
            - 'Add action: `executeBulkAction(action: string)` to call the API.'
        - uuid: 'b7c8d9e0-f1a2-7890-1234-56789abcdef7'
          status: 'todo'
          name: '2. Update API Service'
          reason: 'Wire up the frontend to the new backend bulk endpoint.'
          files:
            - apps/web/src/services/api.service.ts
          operations:
            - 'Export `bulkUpdateTransactions` function calling `POST /api/transactions/bulk`.'
        - uuid: 'c8d9e0f1-a2b3-7890-1234-56789abcdef8'
          status: 'todo'
          name: '3. Implement Deep Granular Copy Utility'
          reason: |
            Implement the "Super Granular Copy" feature. This utility formats selected transactions 
            into a rich Markdown/JSON report for clipboard export.
          files:
            - apps/web/src/utils/copy.util.ts
          operations:
            - 'Create `generateGranularReport(transactions: Transaction[]): string`.'
            - 'Format: Iterate transactions, extract diffs, metadata (author, timestamp, tokens).'
            - 'Return a formatted Markdown string.'
            - 'Use `navigator.clipboard.writeText()` inside a hook or store action.'
      context_files:
        compact:
          - apps/web/src/store/slices/transaction.slice.ts
          - apps/web/src/services/api.service.ts
        medium:
          - apps/web/src/store/slices/transaction.slice.ts
          - apps/web/src/services/api.service.ts
          - apps/web/src/types/app.types.ts
        extended:
          - apps/web/src/store/slices/transaction.slice.ts
          - apps/web/src/services/api.service.ts
          - apps/web/src/types/app.types.ts
          - apps/web/src/store/root.store.ts
    - uuid: 'd9e0f1a2-b3c4-7890-1234-56789abcdef9'
      status: 'todo'
      name: 'Part 3: UI Implementation & Interaction'
      reason: |
        Refactor the UI components to support selection. This involves adding checkboxes to cards, 
        handling "selection mode" visual cues (glows, borders), and refactoring the Floating Action Bar 
        to morph contextually based on selection vs. pending approval states.
      steps:
        - uuid: 'e0f1a2b3-c4d5-7890-1234-56789abcdefa'
          status: 'todo'
          name: '1. Refactor Transaction Card'
          reason: |
            Integrate the selection checkbox. The UI must distinguish between "Expanding" (view) 
            and "Selecting" (action).
          files:
            - apps/web/src/features/transactions/components/transaction-card.component.tsx
          operations:
            - 'Add a Checkbox component (custom styled) positioned absolute top-left or via a dedicated column.'
            - 'Connect `checked` state to `selectedIds.includes(id)`.'
            - 'On Checkbox click: stop propagation, dispatch `toggleSelection`.'
            - 'Visual: Add `ring-2 ring-indigo-500` class when `selected` is true.'
        - uuid: 'f1a2b3c4-d5e6-7890-1234-56789abcdefb'
          status: 'todo'
          name: '2. Morphing Action Bar'
          reason: |
            Upgrade the `FloatingActionBar` to handle multiple states. 
            Priority: Selection Mode > Pending Mode.
          files:
            - apps/web/src/features/transactions/components/action-bar.component.tsx
          operations:
            - 'Condition 1 (Selection Active): Show count badge, "Revert", "Copy Metadata", "Commit" buttons.'
            - 'Condition 2 (Pending Items): Show original "Approve All" interface.'
            - 'Add "Clear Selection" button in Selection Mode.'
            - 'Style: Use glassmorphism and Framer Motion for enter/exit transitions.'
      context_files:
        compact:
          - apps/web/src/features/transactions/components/transaction-card.component.tsx
          - apps/web/src/features/transactions/components/action-bar.component.tsx
        medium:
          - apps/web/src/features/transactions/components/transaction-card.component.tsx
          - apps/web/src/features/transactions/components/action-bar.component.tsx
          - apps/web/src/utils/cn.util.ts
        extended:
          - apps/web/src/features/transactions/components/transaction-card.component.tsx
          - apps/web/src/features/transactions/components/action-bar.component.tsx
          - apps/web/src/utils/cn.util.ts
          - apps/web/src/styles/main.style.css
  conclusion: |
    This refactor introduces a robust multi-select paradigm without disrupting the existing real-time workflow. 
    By isolating the selection state and creating a dedicated bulk API, we ensure the UI remains responsive 
    and the data consistent. The "Granular Copy" feature adds significant value for power users, 
    transforming the UI from a simple dashboard into an audit tool. The visual cohesion is maintained 
    by leveraging the existing dark theme and Framer Motion animations.
  context_files:
    compact:
      - apps/api/src/models.ts
      - apps/api/src/store.ts
      - apps/api/src/routes/transactions.ts
      - apps/web/src/store/slices/transaction.slice.ts
      - apps/web/src/features/transactions/components/transaction-card.component.tsx
      - apps/web/src/features/transactions/components/action-bar.component.tsx
    medium:
      - apps/api/src/models.ts
      - apps/api/src/store.ts
      - apps/api/src/routes/transactions.ts
      - apps/web/src/store/slices/transaction.slice.ts
      - apps/web/src/features/transactions/components/transaction-card.component.tsx
      - apps/web/src/features/transactions/components/action-bar.component.tsx
      - apps/web/src/services/api.service.ts
      - apps/web/src/utils/copy.util.ts
    extended:
      - apps/api/src/models.ts
      - apps/api/src/store.ts
      - apps/api/src/routes/transactions.ts
      - apps/api/src/index.ts
      - apps/web/src/store/slices/transaction.slice.ts
      - apps/web/src/store/root.store.ts
      - apps/web/src/features/transactions/components/transaction-card.component.tsx
      - apps/web/src/features/transactions/components/action-bar.component.tsx
      - apps/web/src/services/api.service.ts
      - apps/web/src/utils/copy.util.ts
      - apps/web/src/styles/main.style.css


USER PROMPT >>>>>>>>>>>>>>>>> execute part 1 with search-replace strategy only