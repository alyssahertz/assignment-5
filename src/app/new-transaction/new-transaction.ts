import { Component } from '@angular/core';
import { TransactionFormComponent } from '../transaction-form/transaction-form';

@Component({
  selector: 'app-new-transaction',
  standalone: true,
  imports: [TransactionFormComponent],
  templateUrl: './new-transaction.html',
  styleUrl: './new-transaction.css'
})
export class NewTransactionComponent {}
