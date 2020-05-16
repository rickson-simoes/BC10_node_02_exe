import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionRepository from '../repositories/TransactionsRepository';

interface RequestService {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestService): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionRepository);

    if (!['income', 'outcome'].includes(type)) {
      throw new AppError('Type can only have income or outcome options', 400);
    }

    const checkTotal = (await transactionRepository.getBalance()).total;

    if (type === 'outcome' && value > checkTotal) {
      throw new AppError(`Damn! You don't have enough money :(`, 400);
    }

    const checkCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!checkCategory) {
      const createCategory = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(createCategory);

      const transaction = transactionRepository.create({
        title,
        value,
        type,
        category_id: {
          id: createCategory.id,
        },
      });

      await transactionRepository.save(transaction);

      return transaction;
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: {
        id: checkCategory.id,
      },
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
