

=== DONE

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

we need multi select feature for transaction list. 

===

we dont need transaction history page, change with prompt management page that prompt relate also with transactions

===

dashboard: implement lazy loading on bottom scroll 

===

simulated backend with json mock data, logic , and services , real elysiajs server and client. monorepoed backend frontend structure. should be no backend logic at all in frontend

===

transaction:
lets change the data and naming convention shape, card title = git commit message (truncated) 

===

please think about amazing UI cohesive UX about each transaction sometimes has one parent transaction. so something like transaction chainning. of course in single prompt can having many chanis of transactions 

====

2. 

===

we want DRY for less LOC

=== DONE

1. remove Approve implementation CTA button
2. action bar having horizontal gap on right side after button only on desktop view
3. only on mobiel view: action bar should hide on scroll down/up and show on stop scroll  
4. need more height spacing between data group labels

=== DONE

update transaction card UI UX to be simpler and cohesiveness because the content of the changes contains markdown like this docs/relay.md so I want basically showin rendered markdown but with interactive code block and cool observability

---

1. no sticky part on scroll? 
2. the examples or data should be as realistic as docs/relay.md, even between files there is reasoning text right?
3. also should has many file changes per transaction, not 0 not below 5

now give me the most comprehensive detailed diff patches with very valid accurate format and strategy in x parts... now start with part 1/x 

=== DONE

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


=== DONE

setup this as proper monorepoed project with amazing architecture and filenaming pattern, pages, with placeholders stubs of elysiajs client services to communicate with backend, zustand stores slices management, all without causing ui look regression... give me super valid diff patches