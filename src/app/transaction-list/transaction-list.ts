import { Component, inject, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransactionService } from '../services/transaction';
import { CategoryService } from '../services/category';
import { BudgetService } from '../services/budget';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-list.html',
  styleUrls: ['./transaction-list.css']
})
export class TransactionListComponent {
  private transactionService = inject(TransactionService);
  private budgetService = inject(BudgetService);

  @Output() edit = new EventEmitter<any>();

  constructor(
    public service: TransactionService,
    public categoryService: CategoryService
  ) {}

  // ✅ IMPORTANT CHANGE (FILTER SUPPORT)
  get transactions() {
    return this.service.getFilteredTransactions();
  }

  getCategoryColor(categoryName: string): string {
    const category = this.categoryService.categories()
      .find(c => c.name === categoryName);

    return category?.color || '#3498db';
  }

  getCategoryBudget(categoryName: string): number {
    return this.budgetService.getBudgetForCategory(categoryName);
  }

  getCategoryBudgetStatus(categoryName: string): string {
    const budget = this.getCategoryBudget(categoryName);
    if (budget === 0) return 'no-budget';

    const budgetInfo = this.transactionService.getCategoryBudgetVsActual(categoryName, budget);
    if (budgetInfo.isOverBudget) return 'over-budget';
    if (budgetInfo.isNearBudget) return 'near-budget';
    return 'on-track';
  }

  delete(id: string) {
    this.service.delete(id);
  }

  editTransaction(transaction: any) {
    this.edit.emit(transaction);
  }
}