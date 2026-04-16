import { Component, computed, inject, ViewChild } from '@angular/core';
import { TransactionFiltersComponent } from '../transaction-filters/transaction-filters';
import { TransactionListComponent } from '../transaction-list/transaction-list';
import { TransactionFormComponent } from '../transaction-form/transaction-form'; // Fix: Add import
import { TransactionService } from '../services/transaction';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [TransactionFiltersComponent, TransactionListComponent, TransactionFormComponent], // Fix: Add import
  templateUrl: './transactions.html',
  styleUrl: './transactions.css'
})
export class TransactionsComponent {
  private transactionService = inject(TransactionService);

  // Fix: Reference to form for editing
  @ViewChild('formRef') form!: TransactionFormComponent;

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

  // Fix: Handle edit event
  onEdit(transaction: any) {
    this.form.editTransaction(transaction);
  }
}
