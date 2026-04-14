export interface User {
  uid: string;
  email: string;
  name: string;
  budgetGoals: {
    monthly: number;
    yearly: number;
  };
}