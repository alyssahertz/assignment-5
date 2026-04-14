import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../services/category';
import { BudgetService } from '../services/budget';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.css'
})
export class CategoriesComponent {
  private categoryService = inject(CategoryService);
  private budgetService = inject(BudgetService);

  form = new FormGroup({
    name: new FormControl(''),
    color: new FormControl('#000000'),
  });

  budgetForm = new FormGroup({
    category: new FormControl('', Validators.required),
    monthlyBudget: new FormControl(0, [Validators.required, Validators.min(0)])
  });

  showBudgetForm = false;

  constructor() {}

  add() {
    if (this.form.value.name) {
      this.categoryService.addCategory({
        ...this.form.value,
        isDefault: false
      } as any);

      this.form.reset({ color: '#000000' });
    }
  }

  delete(id?: string) {
    if (id) this.categoryService.deleteCategory(id);
  }

  async setBudget() {
    if (this.budgetForm.valid) {
      const { category, monthlyBudget } = this.budgetForm.value;
      try {
        await this.budgetService.setBudget(category!, monthlyBudget!);
        this.budgetForm.reset({ category: '', monthlyBudget: 0 });
        this.showBudgetForm = false;
      } catch (error) {
        console.error('Error setting budget:', error);
      }
    }
  }

  async deleteBudget(id: string) {
    try {
      await this.budgetService.deleteBudget(id);
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  }

  get categories() {
    return this.categoryService.categories;
  }

  get budgets() {
    return this.budgetService.budgets;
  }
}
