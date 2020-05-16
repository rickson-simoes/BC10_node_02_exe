import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transactionsData = await transactionsRepository.getAll();
  const balance = await transactionsRepository.getBalance();

  const transactions = transactionsData.map(data => ({
    id: data.id,
    title: data.title,
    value: data.value,
    type: data.type,
    category: data.category_id,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }));

  return response.status(200).json({
    transactions,
    balance,
  });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const transactionsService = new CreateTransactionService();

  const transactions = await transactionsService.execute({
    title,
    value,
    type,
    category,
  });

  return response.status(200).json(transactions);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const transactionsDelete = new DeleteTransactionService();

  await transactionsDelete.execute({
    id,
  });

  return response.status(200).json({ message: 'Transaction deleted.' });
});

transactionsRouter.post('/import', async (request, response) => {
  // TODO
});

export default transactionsRouter;
