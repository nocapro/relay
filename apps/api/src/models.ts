import { t, type Static } from 'elysia';

export const TransactionStatus = t.Union([
  t.Literal('PENDING'),
  t.Literal('APPLYING'),
  t.Literal('APPLIED'),
  t.Literal('COMMITTED'),
  t.Literal('REVERTED'),
  t.Literal('FAILED')
]);
export type TransactionStatus = Static<typeof TransactionStatus>;

export const PromptStatus = t.Union([
  t.Literal('DRAFT'),
  t.Literal('ACTIVE'),
  t.Literal('COMPLETED'),
  t.Literal('ARCHIVED')
]);
export type PromptStatus = Static<typeof PromptStatus>;

export const FileStatus = t.Union([
  t.Literal('modified'),
  t.Literal('created'),
  t.Literal('deleted'),
  t.Literal('renamed')
]);
export type FileStatus = Static<typeof FileStatus>;

export const TransactionFile = t.Object({
  path: t.String(),
  status: FileStatus,
  language: t.String(),
  diff: t.String()
});
export type TransactionFile = Static<typeof TransactionFile>;

export const TransactionBlock = t.Union([
  t.Object({
    type: t.Literal('markdown'),
    content: t.String()
  }),
  t.Object({
    type: t.Literal('file'),
    file: TransactionFile
  })
]);
export type TransactionBlock = Static<typeof TransactionBlock>;

export const Transaction = t.Object({
  id: t.String(),
  status: TransactionStatus,
  description: t.String(),
  timestamp: t.String(),
  createdAt: t.String(),
  promptId: t.String(),
  parentId: t.Optional(t.String()),
  isChainRoot: t.Optional(t.Boolean()),
  author: t.String(),
  blocks: t.Array(TransactionBlock),
  files: t.Array(TransactionFile),
  provider: t.String(),
  model: t.String(),
  cost: t.String(),
  tokens: t.String(),
  reasoning: t.String()
});
export type Transaction = Static<typeof Transaction>;

export const BulkActionRequest = t.Object({
  ids: t.Array(t.String()),
  action: TransactionStatus
});
export type BulkActionRequest = Static<typeof BulkActionRequest>;

export const BulkActionResponse = t.Object({
  success: t.Boolean(),
  updatedIds: t.Array(t.String())
});
export type BulkActionResponse = Static<typeof BulkActionResponse>;

export const Prompt = t.Object({
  id: t.String(),
  title: t.String(),
  content: t.String(),
  timestamp: t.String(),
  status: PromptStatus
});
export type Prompt = Static<typeof Prompt>;

// SSE Event Types for Real-Time Simulation Updates
export const SimulationEvent = t.Object({
  transactionId: t.String(),
  status: TransactionStatus,
  timestamp: t.String(),
  progress: t.Optional(t.Number())
});
export type SimulationEvent = Static<typeof SimulationEvent>;

// Simulation Scenarios for testing different backend behaviors
// - fast-success: Quick completion (0.5-1s) for rapid testing
// - simulated-failure: Triggers FAILED status to test error handling
// - long-running: Extended duration (8-12s) to test loading states
export const SimulationScenario = t.Union([
  t.Literal('fast-success'),
  t.Literal('simulated-failure'),
  t.Literal('long-running')
]);
export type SimulationScenario = Static<typeof SimulationScenario>;