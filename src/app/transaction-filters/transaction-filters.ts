import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../services/transaction';
import { CategoryService } from '../services/category';

@Component({
  selector: 'app-transaction-filters',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './transaction-filters.html',
  styleUrls: ['./transaction-filters.css']
})
export class TransactionFiltersComponent {

  constructor(
    public service: TransactionService,
    public categoryService: CategoryService
  ) {}

  update() {
    // Fix: Parse dates to ensure consistent comparison (e.g., convert to Date objects or ISO strings)
    if (this.service.filters.startDate) {
      const start = new Date(this.service.filters.startDate);
      if (isNaN(start.getTime())) {
        console.error('Invalid start date format');
        return;
      }
      this.service.filters.startDate = start.toISOString().split('T')[0]; // Normalize to YYYY-MM-DD
    }
    if (this.service.filters.endDate) {
      const end = new Date(this.service.filters.endDate);
      if (isNaN(end.getTime())) {
        console.error('Invalid end date format');
        return;
      }
      this.service.filters.endDate = end.toISOString().split('T')[0];
    }
    // triggers UI refresh automatically via object mutation
  }

  clear() {
    this.service.filters = {
      category: '',
      startDate: '',
      endDate: '',
      minAmount: null,
      maxAmount: null
    };
  }
}