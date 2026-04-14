export interface Transaction {
  id?: string;
  userId: string;
  amount: number;
  category: string;
  date: string;
  notes: string;
  type: 'Income' | 'Expense';
}
