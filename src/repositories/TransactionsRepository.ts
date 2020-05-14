import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<number> {
    const { incomes } = await getRepository(Transaction)
      .createQueryBuilder('transactions')
      .select('SUM(transactions.value)', 'incomes')
      .where('transactions.type = :type', { type: 'income' })
      .getRawOne();

    const { outcomes } = await getRepository(Transaction)
      .createQueryBuilder('transactions')
      .select('SUM(transactions.value)', 'outcomes')
      .where('transactions.type = :type', { type: 'outcome' })
      .getRawOne();

    const total = incomes - outcomes;

    return total;
  }
}

export default TransactionsRepository;
