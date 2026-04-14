import { Component, inject, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { FirestoreService } from '../services/firestore';
import { User } from '../models/user';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private firestoreService = inject(FirestoreService);
  private router = inject(Router);

  user = this.authService.currentUser;

  profileForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    monthlyBudget: [0, Validators.min(0)],
    yearlyBudget: [0, Validators.min(0)]
  });

  constructor() {
    if (this.user()) {
      this.profileForm.patchValue({
        name: this.user()!.name,
        email: this.user()!.email,
        monthlyBudget: this.user()!.budgetGoals.monthly,
        yearlyBudget: this.user()!.budgetGoals.yearly
      });
    }
  }

  async onSubmit() {
    if (this.profileForm.valid && this.user()) {
      const { name, email, monthlyBudget, yearlyBudget } = this.profileForm.value;
      const updatedUser: User = {
        ...this.user()!,
        name,
        email,
        budgetGoals: { monthly: monthlyBudget, yearly: yearlyBudget }
      };
      await this.firestoreService.saveUser(updatedUser);
      this.authService.currentUser.set(updatedUser);
    }
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
