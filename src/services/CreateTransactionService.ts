import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

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
    const transactionRepository = getRepository(Transaction);

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
        category_id: createCategory.id,
      });

      await transactionRepository.save(transaction);

      return transaction;
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: checkCategory.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
