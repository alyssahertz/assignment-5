import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransactionService } from '../services/transaction';
import { CategoryService } from '../services/category';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-list.html',
  styleUrls: ['./transaction-list.css']
})
export class TransactionListComponent {

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

  delete(id: string) {
    this.service.delete(id);
  }

  editTransaction(transaction: any) {
    this.edit.emit(transaction);
  }
}