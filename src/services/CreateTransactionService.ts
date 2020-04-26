import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: string;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Type is not valid');
    }

    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionRepository);

    let categoryExist = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryExist) {
      categoryExist = categoryRepository.create({ title: category });
      await categoryRepository.save(categoryExist);
    }

    const transaction = transactionRepository.create({
      title,
      value: Number(value),
      type,
      category: categoryExist,
    });
    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
