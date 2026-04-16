import { Injectable, signal, OnDestroy, inject, effect } from '@angular/core';
import { Subscription } from 'rxjs';

import { Transaction } from '../models/transaction';
import { FirestoreService } from './firestore';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class TransactionService implements OnDestroy {

  private path = 'transactions';
  private authService = inject(AuthService);

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
    // React to auth state changes and reload transactions
    effect(() => {
      const userId = this.authService.currentUser()?.uid;
      console.log('Auth state changed, userId:', userId);
      this.loadTransactions();
    });
  }

  // =========================
  // 🔄 LOAD DATA FROM FIRESTORE
  // =========================
  loadTransactions() {
    // Unsubscribe from previous subscription
    if (this.sub) {
      this.sub.unsubscribe();
    }

    const userId = this.authService.currentUser()?.uid;
    
    if (!userId) {
      console.log('No user logged in, clearing transactions');
      this.transactions.set([]);
      return;
    }

    console.log('Loading transactions for userId:', userId);
    this.sub = this.fs.getCollection<Transaction>(this.path)
      .subscribe(data => {
        console.log('Received all transactions, filtering for userId:', userId);
        const filtered = data.filter(t => t.userId === userId);
        console.log('Filtered transactions:', filtered);
        this.transactions.set(filtered);
      });
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
  // 📊 ANALYTICS (DASHBOARD)
  // =========================

  // Get current month's spending
  getCurrentMonthSpending() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return this.transactions()
      .filter(t => {
        // Fix: Parse date safely assuming YYYY-MM-DD format
        const [yearStr, monthStr, dayStr] = t.date.split('-');
        const date = new Date(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr));
        return !isNaN(date.getTime()) && date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear &&
               t.type === 'Expense';
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }

  // Get current month's income
  getCurrentMonthIncome() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return this.transactions()
      .filter(t => {
        // Fix: Parse date safely assuming YYYY-MM-DD format
        const [yearStr, monthStr, dayStr] = t.date.split('-');
        const date = new Date(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr));
        return !isNaN(date.getTime()) && date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear &&
               t.type === 'Income';
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }

  // Get spending by category for current month
  getSpendingByCategory() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const categoryMap = new Map<string, number>();

    this.transactions()
      .filter(t => {
        // Fix: Parse date safely assuming YYYY-MM-DD format
        const [yearStr, monthStr, dayStr] = t.date.split('-');
        const date = new Date(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr));
        return !isNaN(date.getTime()) && date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear &&
               t.type === 'Expense';
      })
      .forEach(t => {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + t.amount);
      });

    return Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount
    }));
  }

  // Get last 6 months income vs expense
  getMonthlyIncomeVsExpense() {
    const data: { month: string; income: number; expense: number }[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth();
      const year = date.getFullYear();
      
      const income = this.transactions()
        .filter(t => {
          // Fix: Parse date safely assuming YYYY-MM-DD format
          const [yearStr, monthStr, dayStr] = t.date.split('-');
          const d = new Date(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr));
          return !isNaN(d.getTime()) && d.getMonth() === month && d.getFullYear() === year && t.type === 'Income';
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = this.transactions()
        .filter(t => {
          // Fix: Parse date safely assuming YYYY-MM-DD format
          const [yearStr, monthStr, dayStr] = t.date.split('-');
          const d = new Date(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr));
          return !isNaN(d.getTime()) && d.getMonth() === month && d.getFullYear() === year && t.type === 'Expense';
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      data.push({ month: monthName, income, expense });
    }

    return data;
  }

  // Budget vs actual for current month
  getBudgetVsActual(monthlyBudget: number) {
    const spent = this.getCurrentMonthSpending();
    const remaining = Math.max(0, monthlyBudget - spent);
    const percentUsed = monthlyBudget > 0 ? Math.round((spent / monthlyBudget) * 100) : 0;

    return {
      budget: monthlyBudget,
      spent,
      remaining,
      percentUsed,
      isOverBudget: spent > monthlyBudget
    };
  }

  // Category budget vs actual for current month
  getCategoryBudgetVsActual(category: string, budget: number) {
    const spent = this.getSpendingByCategory().find((s: { category: string; amount: number }) => s.category === category)?.amount || 0;
    const remaining = Math.max(0, budget - spent);
    const percentUsed = budget > 0 ? Math.round((spent / budget) * 100) : 0;

    return {
      category,
      budget,
      spent,
      remaining,
      percentUsed,
      isOverBudget: spent > budget,
      isNearBudget: percentUsed >= 80 && percentUsed < 100
    };
  }

  // Get all categories with budget alerts
  getCategoryBudgetAlerts(categoryBudgets: Map<string, number>) {
    const alerts = [];

    for (const [category, budget] of categoryBudgets) {
      const vs = this.getCategoryBudgetVsActual(category, budget);
      if (vs.isOverBudget || vs.isNearBudget) {
        alerts.push(vs);
      }
    }

    return alerts;
  }

  // =========================
  // 🧹 CLEANUP
  // =========================
  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}