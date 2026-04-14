import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { TransactionService } from '../services/transaction';
import { CategoryService } from '../services/category';

type TransactionForm = {
  amount: number;
  category: string;
  date: string;
  notes: string;
  type: 'Expense' | 'Income';
};

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './transaction-form.html',
  styleUrls: ['./transaction-form.css']
})
export class TransactionFormComponent {

  editingId: string | null = null;

  form = new FormGroup({
    amount: new FormControl<number>(0, { nonNullable: true }),
    category: new FormControl<string>('', { nonNullable: true }),
    date: new FormControl<string>('', { nonNullable: true }),
    notes: new FormControl<string>('', { nonNullable: true }),
    type: new FormControl<'Expense' | 'Income'>('Expense', { nonNullable: true })
  });

  constructor(
    private service: TransactionService,
    public categoryService: CategoryService
  ) {}

  editTransaction(t: any) {
    this.editingId = t.id;

    this.form.patchValue({
      amount: t.amount,
      category: t.category,
      date: t.date,
      notes: t.notes,
      type: t.type
    });
  }

  submit() {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();

    const data: TransactionForm = {
      amount: raw.amount,
      category: raw.category,
      date: raw.date,
      notes: raw.notes,
      type: raw.type
    };

    if (this.editingId) {
      this.service.update(this.editingId, data);
      this.editingId = null;
    } else {
      this.service.add(data);
    }

    this.form.reset({
      amount: 0,
      category: '',
      date: '',
      notes: '',
      type: 'Expense'
    });
  }

  cancelEdit() {
    this.editingId = null;

    this.form.reset({
      amount: 0,
      category: '',
      date: '',
      notes: '',
      type: 'Expense'
    });
  }
}