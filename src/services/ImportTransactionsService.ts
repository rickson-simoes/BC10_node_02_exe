import csvParse from 'csv-parse';
import fs from 'fs';

import { getCustomRepository, getRepository, In } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface RequestService {
  filename: string;
}

interface TransactionCSV {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute({ filename }: RequestService): Promise<Transaction[]> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const fsReadStream = fs.createReadStream(filename);

    const csvFileConfig = csvParse({
      from_line: 2,
    });

    const csvFile = fsReadStream.pipe(csvFileConfig);

    const dataTransactions: TransactionCSV[] = [];
    const dataCategories: string[] = [];

    csvFile.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      dataCategories.push(category);

      dataTransactions.push({ title, type, value, category });
    });

    await new Promise(resolve => csvFile.on('end', resolve));

    const checkCategories = await categoryRepository.find({
      where: {
        title: In(dataCategories),
      },
    });

    const categoriesFound = checkCategories.map(
      (category: Category) => category.title,
    );

    const addCategories = dataCategories
      .filter(category => !categoriesFound.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoryRepository.create(
      addCategories.map(title => ({
        title,
      })),
    );

    await categoryRepository.save(newCategories);

    const finalCategories = [...newCategories, ...checkCategories];

    const createdTransactions = transactionRepository.create(
      dataTransactions.map(data => ({
        title: data.title,
        type: data.type,
        value: data.value,
        category_id: finalCategories.find(
          category => category.title === data.category,
        ),
      })),
    );

    await transactionRepository.save(createdTransactions);
    await fs.promises.unlink(filename);
    return createdTransactions;
  }
}

export default ImportTransactionsService;
