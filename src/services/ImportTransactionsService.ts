import { getCustomRepository, getRepository, In } from 'typeorm';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parse';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionRepository from '../repositories/TransactionsRepository';

import uploadConfig from '../config/upload';
import AppError from '../errors/AppError';

interface Request {
  fileName: string;
}

interface TransactionCSV {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute({ fileName }: Request): Promise<Transaction[]> {
    // checar se o aquivo exist
    const filePath = path.join(uploadConfig.directory, fileName);
    const filePathExists = await fs.promises.stat(filePath);

    if (!filePathExists) {
      throw new AppError('File not found');
    }

    const transactionsCsv = fs.createReadStream(filePath);

    const parsers = csv({ from_line: 2 });

    const csvParse = transactionsCsv.pipe(parsers);

    const transactions: TransactionCSV[] = [];
    const categories: string[] = [];

    csvParse.on('data', async line => {
      const [title, type, value, category] = line.map((c: string) => c.trim());

      if (!title || !type || !value) return;

      categories.push(category);

      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => csvParse.on('end', resolve));

    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionRepository);

    // deletar ao final
    await fs.promises.unlink(filePath);

    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    const existentCategoriesTitles = existentCategories.map(
      (category: Category) => category.title,
    );

    const addCategoryTitles = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      addCategoryTitles.map(title => ({
        title,
      })),
    );

    await categoriesRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existentCategories];

    const createdTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(createdTransactions);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
