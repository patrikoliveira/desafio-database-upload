import { Router } from 'express';

// import TransactionsRepository from '../repositories/TransactionsRepository';
// import CreateTransactionService from '../services/CreateTransactionService';
// import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  response.json({ ok: true });
});

transactionsRouter.post('/', async (request, response) => {
  response.json(request.body);
});

transactionsRouter.delete('/:id', async (request, response) => {
  response.status(204).send();
});

transactionsRouter.post('/import', async (request, response) => {
  response.json(request.body);
});

export default transactionsRouter;
