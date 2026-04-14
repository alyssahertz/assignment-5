import { Injectable, signal, inject, effect, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DEFAULT_CATEGORIES } from '../data/default-categories';
import { Category } from '../models/category';
import { FirestoreService } from './firestore';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class CategoryService implements OnDestroy {
  private path = 'categories';
  private authService = inject(AuthService);

  categories = signal<Category[]>([]);
  private sub?: Subscription;

  constructor(private fs: FirestoreService) {
    // React to auth state changes and reload categories
    effect(() => {
      const userId = this.authService.currentUser()?.uid;
      console.log('Auth state changed in CategoryService, userId:', userId);
      this.loadCategories();
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  loadCategories() {
    // Unsubscribe from previous subscription
    if (this.sub) {
      this.sub.unsubscribe();
    }

    const userId = this.authService.currentUser()?.uid;

    if (!userId) {
      console.log('No user logged in, showing only default categories');
      this.categories.set(DEFAULT_CATEGORIES);
      return;
    }

    console.log('Loading categories for userId:', userId);
    this.sub = this.fs.getCollection<Category>(this.path)
      .subscribe(userCats => {
        console.log('Received all categories, filtering for userId:', userId);
        const filtered = userCats.filter(c => c.userId === userId);
        console.log('User categories:', filtered);
        this.categories.set([
          ...DEFAULT_CATEGORIES,
          ...filtered
        ]);
      });
  }

  async addCategory(category: Category): Promise<any> {
    const userId = this.authService.currentUser()?.uid;
    if (!userId) throw new Error('User not logged in');
    console.log('Adding category for userId:', userId);
    return this.fs.addItem(this.path, { ...category, userId });
  }

  deleteCategory(id: string) {
    return this.fs.deleteItem(this.path, id);
  }
}