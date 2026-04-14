export interface CategoryBudget {
  id?: string;
  userId: string;
  category: string;
  monthlyBudget: number;
  createdAt?: Date;
}