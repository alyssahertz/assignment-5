import { Component } from '@angular/core';

import { DashboardComponent } from './dashboard/dashboard';
import { TransactionFormComponent } from './transaction-form/transaction-form';
import { TransactionListComponent } from './transaction-list/transaction-list';
import { CategoryManagerComponent } from './category-manager/category-manager';
import { TransactionFiltersComponent } from './transaction-filters/transaction-filters';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    DashboardComponent,
    TransactionFormComponent,
    TransactionListComponent,
    CategoryManagerComponent,
    TransactionFiltersComponent
  ],
  template: `
  <div class="container">

    <h1>💰 Expense Tracker</h1>

    <div class="grid">

      <div class="card">
        <app-dashboard />
      </div>

      <!-- 🔥 ADD FILTERS HERE -->
      <div class="card full">
        <app-transaction-filters />
      </div>

      <div class="card">
        <app-category-manager />
      </div>

      <div class="card">
        <app-transaction-form #formRef />
      </div>

      <div class="card full">
        <app-transaction-list
          (edit)="formRef.editTransaction($event)">
        </app-transaction-list>
      </div>

    </div>

  </div>
`,
  styleUrls: ['./app.css']
})
export class AppComponent {}