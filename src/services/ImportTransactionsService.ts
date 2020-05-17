import csvtojson from 'csvtojson';
import path from 'path';
import { getCustomRepository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface RequestService {
  filename: string;
}

class ImportTransactionsService {
  async execute({ filename }: RequestService): Promise<Transaction[]> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const filePath = path.resolve(__dirname, '..', '..', 'tmp', filename);

    // const csvFileToJson = await csvtojson().fromFile(filePath);

    const csvFileToJson = csvtojson()
      .fromFile(filePath)
      .subscribe(json => {
        return new Promise(async (resolve, _) => {
          const checkCategory = await categoryRepository.findOne({
            where: { title: json.category },
          });
          if (!checkCategory) {
            const createCategory = categoryRepository.create({
              title: json.category,
            });
            await categoryRepository.save(createCategory);
            const Arr = {
              title: json.title,
              value: json.value,
              type: json.type,
              category_id: {
                id: createCategory.id,
              },
            };
            const transaction = transactionRepository.create(Arr);
            await transactionRepository.save(transaction);
            return transaction;
          }
          const Arr = {
            title: json.title,
            value: json.value,
            type: json.type,
            category_id: {
              id: checkCategory.id,
            },
          };
          const transaction = transactionRepository.create(Arr);
          await transactionRepository.save(transaction);
          return resolve(transaction);
        }).then();
      });

    // const createTransaction = csvFileToJson.map(values => ({
    //   title: values.title,
    //   value: values.value,
    //   type: values.type,
    //   category: values.category,
    // }));

    console.log(csvFileToJson);

    // Preciso separar todos os valores de category, pegar cada um e checar se existe no banco

    // const teste = await photoRepository.findAndCount();
    // console.log('All photos: ', allPhotos);
    // console.log('Photos count: ', photosCount);

    // const transaction = transactionsRepository.create(csvFileToJson);

    // await transactionsRepository.save(transaction);

    return csvFileToJson;
  }
}

export default ImportTransactionsService;
