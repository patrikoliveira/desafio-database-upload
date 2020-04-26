import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const initialBalance: Balance = {
      income: 0,
      outcome: 0,
      total: 0,
    };
    const transactions = await this.find();

    const balance = transactions.reduce((b, t) => {
      const blc = b;

      const value = Number(t.value);
      if (t.type === 'income') {
        blc.income += value;
      } else {
        blc.outcome += value;
      }

      return blc;
    }, initialBalance);

    balance.total = balance.income - balance.outcome;

    return balance;
  }
}

export default TransactionsRepository;
