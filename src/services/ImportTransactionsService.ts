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
  async execute({ filename }: RequestService): Promise<any> {
    const categoryRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const filePath = path.resolve(__dirname, '..', '..', 'tmp', filename);

    const csvFileToJson = await csvtojson().fromFile(filePath);

    const jsonData = csvFileToJson.map(values => ({
      title: values.title,
      value: values.value,
      type: values.type,
      category: values.category,
    }));

    console.log(csvFileToJson);

    // Preciso separar todos os valores de category, pegar cada um e checar se existe no banco

    // let [allPhotos, photosCount] = await photoRepository.findAndCount();
    // console.log("All photos: ", allPhotos);
    // console.log("Photos count: ", photosCount);

    // const transaction = transactionsRepository.create(createTransaction);

    // await transactionsRepository.save(transaction);

    return csvFileToJson;
  }
}

export default ImportTransactionsService;
