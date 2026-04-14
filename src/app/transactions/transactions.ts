import { Component, computed, inject } from '@angular/core';
import { TransactionFiltersComponent } from '../transaction-filters/transaction-filters';
import { TransactionListComponent } from '../transaction-list/transaction-list';
import { TransactionService } from '../services/transaction';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [TransactionFiltersComponent, TransactionListComponent],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css'
})
export class TransactionsComponent {
  private transactionService = inject(TransactionService);

  // Computed values for summary stats
  totalIncome = computed(() => {
    return this.transactionService.transactions()
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);
  });

  totalExpense = computed(() => {
    return this.transactionService.transactions()
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);
  });

  netBalance = computed(() => {
    return this.totalIncome() - this.totalExpense();
  });

  transactionCount = computed(() => {
    return this.transactionService.transactions().length;
  });
}
