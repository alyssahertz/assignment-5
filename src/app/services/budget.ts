import { Injectable, inject, signal, effect } from '@angular/core';
import { Subscription } from 'rxjs';
import { CategoryBudget } from '../models/budget';
import { FirestoreService } from './firestore';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private path = 'budgets';
  private authService = inject(AuthService);
  private fs = inject(FirestoreService);

  budgets = signal<CategoryBudget[]>([]);
  private sub?: Subscription;

  constructor() {
    // React to auth state changes
    effect(() => {
      const userId = this.authService.currentUser()?.uid;
      if (userId) {
        this.loadBudgets();
      } else {
        this.budgets.set([]);
      }
    });
  }

  loadBudgets() {
    if (this.sub) {
      this.sub.unsubscribe();
    }

    const userId = this.authService.currentUser()?.uid;
    if (!userId) return;

    this.sub = this.fs.getCollection<CategoryBudget>(this.path)
      .subscribe(data => {
        const filtered = data.filter(b => b.userId === userId);
        this.budgets.set(filtered);
      });
  }

  async setBudget(category: string, monthlyBudget: number): Promise<void> {
    const userId = this.authService.currentUser()?.uid;
    if (!userId) throw new Error('User not logged in');

    // Check if budget exists for this category
    const existing = this.budgets().find(b => b.category === category && b.userId === userId);

    if (existing) {
      // Update existing
      await this.fs.updateItem(this.path, existing.id!, { monthlyBudget });
    } else {
      // Create new
      await this.fs.addItem(this.path, {
        userId,
        category,
        monthlyBudget,
        createdAt: new Date()
      });
    }
  }

  getBudgetForCategory(category: string): number {
    const budget = this.budgets().find(b => b.category === category);
    return budget?.monthlyBudget || 0;
  }

  async deleteBudget(id: string): Promise<void> {
    await this.fs.deleteItem(this.path, id);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
