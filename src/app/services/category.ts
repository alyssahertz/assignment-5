import { Injectable, signal } from '@angular/core';
import { DEFAULT_CATEGORIES } from '../data/default-categories';
import { Category } from '../models/category';
import { FirestoreService } from './firestore';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private path = 'categories';

  categories = signal<Category[]>([]);

  constructor(private fs: FirestoreService) {
    this.loadCategories();
  }

  loadCategories() {
    this.fs.getCollection<Category>(this.path)
      .subscribe(userCats => {
        this.categories.set([
          ...DEFAULT_CATEGORIES,
          ...userCats
        ]);
      });
  }

  addCategory(category: Category) {
    return this.fs.addItem(this.path, category);
  }

  deleteCategory(id: string) {
    return this.fs.deleteItem(this.path, id);
  }
}