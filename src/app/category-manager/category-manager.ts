import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../services/category';

@Component({
  selector: 'app-category-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-manager.html',
  styleUrl: './category-manager.css'
})
export class CategoryManagerComponent {

  form = new FormGroup({
    name: new FormControl(''),
    color: new FormControl('#000000'),
  });

  constructor(public service: CategoryService) {}

  add() {
    if (this.form.value.name) {
      this.service.addCategory({
        ...this.form.value,
        isDefault: false
      } as any);

      this.form.reset({ color: '#000000' });
    }
  }

  delete(id?: string) {
    if (id) this.service.deleteCategory(id);
  }
}