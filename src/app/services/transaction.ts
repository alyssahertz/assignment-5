import { Injectable, signal, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { Transaction } from '../models/transaction';
import { FirestoreService } from './firestore';

@Injectable({ providedIn: 'root' })
export class TransactionService implements OnDestroy {

  private path = 'transactions';

  // ✅ FILTER STATE (USED FOR REQUIREMENT #6)
  filters = {
    category: '',
    startDate: '',
    endDate: '',
    minAmount: null as number | null,
    maxAmount: null as number | null
  };

  // ✅ MAIN DATA STORE
  transactions = signal<Transaction[]>([]);

  private sub?: Subscription;

  constructor(private fs: FirestoreService) {
    this.loadTransactions();
  }

  // =========================
  // 🔄 LOAD DATA FROM FIRESTORE
  // =========================
  loadTransactions() {
    this.sub = this.fs.getCollection<Transaction>(this.path)
      .subscribe(data => this.transactions.set(data));
  }

  // =========================
  // ➕ CREATE
  // =========================
  add(transaction: Transaction) {
    return this.fs.addItem(this.path, transaction);
  }

  // =========================
  // ✏️ UPDATE
  // =========================
  update(id: string, transaction: Transaction) {
    return this.fs.updateItem(this.path, id, transaction);
  }

  // =========================
  // 🗑 DELETE
  // =========================
  delete(id: string) {
    return this.fs.deleteItem(this.path, id);
  }

  // =========================
  // 📊 TOTALS
  // =========================
  getTotalExpense() {
    return this.transactions()
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalIncome() {
    return this.transactions()
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  // =========================
  // 🔎 FILTER LOGIC (REQUIREMENT #6)
  // =========================
  getFilteredTransactions() {
    return this.transactions().filter(t => {

      const f = this.filters;

      // Category filter
      const matchCategory =
        !f.category || t.category === f.category;

      // Date range filter
      const matchDate =
        (!f.startDate || new Date(t.date) >= new Date(f.startDate)) &&
        (!f.endDate || new Date(t.date) <= new Date(f.endDate));

      // Amount range filter (SAFE NULL CHECKS)
      const matchAmount =
        (f.minAmount === null || t.amount >= f.minAmount) &&
        (f.maxAmount === null || t.amount <= f.maxAmount);

      return matchCategory && matchDate && matchAmount;
    });
  }

  // =========================
  // 🧹 CLEANUP
  // =========================
  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}