import { getCustomRepository, DeleteResult } from 'typeorm';

import validate from 'uuid-validate';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface RequestService {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: RequestService): Promise<DeleteResult> {
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const checkId = validate(id);

    if (!checkId) {
      throw new AppError('This ID does not exist');
    }

    const transactionDelete = transactionRepository.delete(id);

    return transactionDelete;
  }
}

export default DeleteTransactionService;
