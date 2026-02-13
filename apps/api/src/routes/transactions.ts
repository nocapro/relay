import { Elysia, t } from 'elysia';
import { db } from '../store';
import { Transaction, TransactionStatus, BulkActionRequest, BulkActionResponse } from '../models';

export const transactionsRoutes = new Elysia({ prefix: '/transactions' })
  .get('/', ({ query }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 15;
    return db.getTransactions(limit, page, query.search, query.status);
  }, {
    query: t.Object({
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
      search: t.Optional(t.String()),
      status: t.Optional(t.String())
    }),
    response: t.Array(Transaction)
  })
  .patch('/:id/status', async ({ params: { id }, body: { status, scenario } }) => {
    // If transitioning to APPLYING, start the background simulation instead of immediate update
    if (status === 'APPLYING') {
      // Trigger the async simulation with optional scenario (runs in background, returns immediately)
      db.startSimulation(id, scenario);
      
      // Return the transaction in its current state (now APPLYING)
      const tx = db.getTransactions(1, 1).find((t: any) => t.id === id);
      if (!tx) throw new Error('Transaction not found');
      return tx;
    }
    
    // For other status changes, update immediately
    const updated = db.updateTransactionStatus(id, status);
    if (!updated) throw new Error('Transaction not found');
    
    return updated;
  }, {
    body: t.Object({ 
      status: TransactionStatus,
      scenario: t.Optional(t.Union([
        t.Literal('fast-success'),
        t.Literal('simulated-failure'),
        t.Literal('long-running')
      ]))
    }),
    response: Transaction
  })
  .post('/bulk', ({ body: { ids, action } }) => {
    const updatedIds = db.updateTransactionStatusBulk(ids, action);
    return { success: true, updatedIds };
  }, {
    body: BulkActionRequest,
    response: BulkActionResponse
  });