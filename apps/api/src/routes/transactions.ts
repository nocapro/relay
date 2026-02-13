import { Elysia, t } from 'elysia';
import { db } from '../store';
import { Transaction, TransactionStatus } from '../models';

export const transactionsRoutes = new Elysia({ prefix: '/transactions' })
  .get('/', ({ query }) => {
    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 15;
    return db.getTransactions(limit, page);
  }, {
    query: t.Object({
      page: t.Optional(t.String()),
      limit: t.Optional(t.String())
    }),
    response: t.Array(Transaction)
  })
  .patch('/:id/status', async ({ params: { id }, body: { status } }) => {
    // Simulate backend latency for "Applying" logic
    if (status === 'APPLIED') {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    const updated = db.updateTransactionStatus(id, status);
    if (!updated) throw new Error('Transaction not found');
    
    return updated;
  }, {
    body: t.Object({ status: TransactionStatus }),
    response: Transaction
  });