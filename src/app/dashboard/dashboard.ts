import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../services/transaction';
import { AuthService } from '../services/auth';
import { BudgetService } from '../services/budget';
import { CategoryService } from '../services/category';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  private transactionService = inject(TransactionService);
  private authService = inject(AuthService);
  private budgetService = inject(BudgetService);
  private categoryService = inject(CategoryService);

  // Make Math available in template
  Math = Math;

  get income() {
    return this.transactionService.getTotalIncome();
  }

  get expense() {
    return this.transactionService.getTotalExpense();
  }

  get balance() {
    return this.income - this.expense;
  }

  // Monthly spending summary
  get currentMonthSpending() {
    return this.transactionService.getCurrentMonthSpending();
  }

  get currentMonthIncome() {
    return this.transactionService.getCurrentMonthIncome();
  }

  // Category-wise spending
  get spendingByCategory() {
    return this.transactionService.getSpendingByCategory();
  }

  // Income vs Expense (last 6 months)
  get monthlyData() {
    return this.transactionService.getMonthlyIncomeVsExpense();
  }

  // Budget vs actual
  get budgetVsActual() {
    const monthlyBudget = this.authService.currentUser()?.budgetGoals.monthly || 0;
    return this.transactionService.getBudgetVsActual(monthlyBudget);
  }

  // Helper for pie chart SVG
  getPieSlices(): { startAngle: number; endAngle: number; category: string; amount: number; color: string }[] {
    const data = this.spendingByCategory;
    const total = data.reduce((sum, d) => sum + d.amount, 0);

    if (total === 0) return [];

    // Fallback colors in case category color is not found
    const fallbackColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    let currentAngle = -90;

    return data.map((item, i) => {
      const sliceAngle = (item.amount / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      currentAngle = endAngle;

      // Find the category to get its color
      const category = this.categoryService.categories().find(c => c.name === item.category);
      const color = category?.color || fallbackColors[i % fallbackColors.length];

      return {
        startAngle,
        endAngle,
        category: item.category,
        amount: item.amount,
        color: color
      };
    });
  }

  // Helper for bar chart dimensions
  getBarChartData() {
    const data = this.monthlyData;
    const maxValue = Math.max(...data.map(d => Math.max(d.income, d.expense)), 1);
    
    return data.map(d => ({
      month: d.month,
      income: d.income,
      expense: d.expense,
      incomeHeight: (d.income / maxValue) * 200,
      expenseHeight: (d.expense / maxValue) * 200
    }));
  }

  // Helper to generate SVG path for pie slice
  getPieSlicePath(slice: { startAngle: number; endAngle: number; color: string; category: string; amount: number }): string {
    const radius = 80;
    const cx = 100;
    const cy = 100;

    // Convert angles to radians
    const startRad = (slice.startAngle * Math.PI) / 180;
    const endRad = (slice.endAngle * Math.PI) / 180;

    // Calculate start and end points
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    // Determine if arc is large (> 180 degrees)
    const largeArc = slice.endAngle - slice.startAngle > 180 ? 1 : 0;

    // SVG path: move to center, line to start, arc to end, line back to center, close
    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }

  // Get category budget alerts
  get categoryBudgetAlerts() {
    const categoryBudgetMap = new Map<string, number>();
    
    for (const budget of this.budgetService.budgets()) {
      categoryBudgetMap.set(budget.category, budget.monthlyBudget);
    }

    return this.transactionService.getCategoryBudgetAlerts(categoryBudgetMap);
  }

  // Get category budget vs actual
  getCategoryBudgetVsActual(category: string, budget: number) {
    return this.transactionService.getCategoryBudgetVsActual(category, budget);
  }
}