import { apiClient } from './client';

export interface UpcomingBill {
  name: string;
  amount: number;
  due_date: string;
  source: 'recurring' | 'subscription';
}

export interface SafeToSpend {
  liquid_balance: number;
  upcoming_bills: UpcomingBill[];
  total_upcoming: number;
  days_until_next_income: number;
  safe_to_spend: number;
  safe_per_day: number;
}

class SafeToSpendService {
  async getSafeToSpend(): Promise<SafeToSpend> {
    return apiClient.get<SafeToSpend>('/api/safe-to-spend');
  }
}

export const safeToSpendService = new SafeToSpendService();
