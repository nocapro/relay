

===

everything should be react router 7 based.

===

also data be gathered as example

``` yaml
projectId: react-vite-tailwind
uuid: 54f9a2b8-9e1d-4c3f-8a5b-7d9e1f2a3b4c
parentTransaction: 4543754-342ete-esef4354-sefs
changeSummary:
  - edit: src/pages/dashboard.page.tsx
  - edit: src/features/transactions/components/action-bar.component.tsx
  - edit: src/features/transactions/components/transaction-card.component.tsx
promptSummary: Improve Dashboard page features and UI/UX based on readme.md philosophy (TUI style, shortcuts, stream view).
gitCommitMsg: "feat: enhance dashboard UI with TUI-inspired stream view and shortcut hints"
```
===

update transaction card UI UX and cohesiveness because the content of the changes contains markdown like this docs/relay.md

===

add grouping feature to transaction list.

so transaction items by default be grouped by prompt, yes single prompt has relation to one or many transactions, can also be grouped by date, commit author, status, files

don't forget to work on the architecture upon the changes.

give me the most comprehensive detailed diff patches with very valid accurate format and strategy in x parts... now start with part 1/x 

---

UI: now its conflicting with filter feature also user need to be able to collapse decollapse the group content

---

1. remove horizontal scrollbar of the group selection 2. we need more spacing to transaction card header with transaction list content

===

understand readme.md to improve dashboard page UI UX to be

1. more observability
2. more cohesive transaction card
3. amazing diffs showcase

don't forget to work on the architecture.

give me the most comprehensive detailed diff patches with very valid accurate format and strategy in x parts... now start with part 1/x 

=== DONE

1. I want vite-swc
2. file naming should like having special extension like domain.service.ts dashboard.page.tsx etc
3. project name is relay
4. state management should has slices not only stores
5. state management prefer global usage over local
6. state management should domain based

give me the most comprehensive detailed diff patches with very valid accurate format and strategy in x parts... now start with part 1/x


===

setup this as proper monorepoed project with amazing architecture and filenaming pattern, pages, with placeholders stubs of elysiajs client services to communicate with backend, zustand stores slices management, all without causing ui look regression... give me super valid diff patches