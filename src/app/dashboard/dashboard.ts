import { Component } from '@angular/core';
import { TransactionService } from '../services/transaction';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  constructor(public service: TransactionService) {}

  get income() {
    return this.service.getTotalIncome();
  }

  get expense() {
    return this.service.getTotalExpense();
  }

  get balance() {
    return this.income - this.expense;
  }
}