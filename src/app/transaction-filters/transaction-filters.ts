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