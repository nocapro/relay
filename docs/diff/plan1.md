plan:
  uuid: 'f2a9e8b1-7c5d-4e2a-9f1b-3d6e8a7c2b4f'
  status: 'todo'
  title: 'Unified Document-Style Transaction UI with Markdown & Observability'
  introduction: |
    We're ditching the "dashboard" feel for a "technical report" feel. The current tabbed interface is a cognitive burden. By moving to a single-column document flow, we allow the user to read the AI's intent (Markdown) and implementation (Code) in one fluid motion.

    We'll integrate `react-markdown` for the reasoning block and treat each file change as a first-class "Interactive Block" with built-in observability metrics. This isn't just a UI update; it's about making the AI's work observable and auditable at a glance.
  parts:
    - uuid: 'd3b2a1c0-f9e8-4d7c-8b6a-543210fedcba'
      status: 'todo'
      name: 'Part 1: Core Dependencies & The Document Shell'
      reason: |
        We need the right primitives. Adding `react-markdown` for the content and refactoring the card to support a vertical, non-tabbed layout.
      steps:
        - uuid: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'
          status: 'todo'
          name: '1. Add Markdown Support'
          reason: |
            Enable rich text rendering for AI reasoning and logic descriptions.
          files:
            - package.json
          operations:
            - 'Add `react-markdown` and `remark-gfm` to dependencies.'
        - uuid: 'b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e'
          status: 'todo'
          name: '2. Refactor TransactionCard to Vertical Flow'
          reason: |
            Move away from the sidebar/tab model. Every card becomes a vertical "post" with a header, markdown body, and code blocks.
          files:
            - src/features/transactions/components/transaction-card.component.tsx
          operations:
            - 'Remove `activeTab` and `selectedFileIndex` states.'
            - 'Implement a "Hero Meta" section showing Provider (e.g. Anthropic), Model, and a "Token Burn" visualization.'
            - 'Wrap `tx.reasoning` in a `ReactMarkdown` component with custom styling (zinc-300, leading-relaxed).'
            - 'Map through `tx.files` to render each as a "Code Window" with a header containing the file path and a copy button.'
            - 'Use a subtle "pulse" border or glow for `PENDING` transactions to emphasize the "Observability" aspect.'
    - uuid: 'e5f4d3c2-b1a0-4c9b-8d7e-6f5a4b3c2d1e'
      status: 'todo'
      name: 'Part 2: Visual Polish & Code Interactivity'
      reason: |
        The code blocks need to feel like professional tools. We'll refine the `DiffViewer` integration and the metadata display.
      steps:
        - uuid: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f'
          status: 'todo'
          name: '1. Enhance Code Block Header'
          reason: |
            Provide better context for each file change within the document flow.
          files:
            - src/features/transactions/components/transaction-card.component.tsx
            - src/components/ui/diff-viewer.ui.tsx
          operations:
            - 'Add a "Language Badge" and "Change Stats" (+/- lines) to each code block header.'
            - 'Ensure `DiffViewer` handles internal scrolling so long diffs don’t break the document flow.'
        - uuid: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a'
          status: 'todo'
          name: '2. Floating Action Refresh'
          reason: |
            Since the card is now longer, ensure the "Approve" actions remain accessible or logically placed.
          files:
            - src/features/transactions/components/transaction-card.component.tsx
          operations:
            - 'Implement a "Sticky Meta Bar" that stays at the top of the card during scroll, housing the Status and the Approve button.'
  conclusion: |
    By combining Markdown rendering with a flat, document-style layout, we transform the UI from a "data browser" into a "narrative review tool." It’s cleaner, more cohesive, and looks significantly more "pro" for developers who are used to GitHub PRs and technical docs.
  context_files:
    compact:
      - src/features/transactions/components/transaction-card.component.tsx
      - package.json
    medium:
      - src/features/transactions/components/transaction-card.component.tsx
      - src/components/ui/diff-viewer.ui.tsx
      - src/types/app.types.ts
    extended:
      - src/features/transactions/components/transaction-card.component.tsx
      - src/components/ui/diff-viewer.ui.tsx
      - src/types/app.types.ts
      - src/pages/dashboard.page.tsx
      - src/styles/main.style.css