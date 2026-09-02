import { apiClient } from './client';

export interface AnalyticsExportParams {
  startDate?: string;
  endDate?: string;
  format: 'csv' | 'pdf';
  type: 'transactions' | 'analytics' | 'financial-report' | 'net-worth';
}

export interface SpendingByCategory {
  category_id: number;
  category_name: string;
  total_amount: number;
  transaction_count: number;
  percentage: number;
}

export interface IncomeExpenseSummary {
  period: string;
  total_income: number;
  total_expenses: number;
  net_income: number;
  income_by_category: SpendingByCategory[];
  expenses_by_category: SpendingByCategory[];
}

export interface NetWorthHistory {
  date: string;
  assets: number;
  liabilities: number;
  net_worth: number;
}

export interface BudgetPerformance {
  budget_id: number;
  category_name: string;
  period: string;
  budgeted_amount: number;
  spent_amount: number;
  remaining_amount: number;
  percentage_used: number;
  on_track: boolean;
  period_start: string;
  period_end: string;
}

export interface GoalProgress {
  goal_id: number;
  goal_name: string;
  target_amount: number;
  current_amount: number;
  progress_percentage: number;
  target_date: string | null;
  projected_completion: string | null;
  on_track: boolean;
}

export interface CashFlowForecastEvent {
  date: string;
  name: string;
  amount: number;
  source: 'subscription' | 'recurring';
}

export interface CashFlowForecastProjection {
  date: string;
  balance: number;
  scheduled_outflow: number;
}

export interface CashFlowForecastAlert {
  date: string;
  type: 'negative_balance' | 'below_buffer';
  balance: number;
}

export interface CashFlowForecast {
  days: number;
  start_date: string;
  end_date: string;
  starting_balance: number;
  projected_end_balance: number;
  lowest_balance: number;
  lowest_balance_date: string;
  safe_to_spend: number;
  buffer: number;
  avg_daily_spend: number;
  avg_daily_income: number;
  total_scheduled_outflow: number;
  upcoming_events: CashFlowForecastEvent[];
  daily_projection: CashFlowForecastProjection[];
  alerts: CashFlowForecastAlert[];
}

class AnalyticsService {
  async getSpendingByCategory(startDate?: string, endDate?: string, incomeOnly = false, limit = 10) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (incomeOnly) params.append('income_only', 'true');
    params.append('limit', limit.toString());

    return apiClient.get<{
      start_date: string;
      end_date: string;
      total: number;
      categories: SpendingByCategory[];
    }>(`/api/analytics/spending/by-category?${params.toString()}`);
  }

  async getIncomeExpenseSummary(period = 'monthly', periodsBack = 6) {
    const params = new URLSearchParams({
      period,
      periods_back: periodsBack.toString()
    });

    return apiClient.get<{
      period_type: string;
      summaries: IncomeExpenseSummary[];
    }>(`/api/analytics/income-expense/summary?${params.toString()}`);
  }

  async getNetWorthHistory(monthsBack = 12) {
    return apiClient.get<{
      history: NetWorthHistory[];
      current_net_worth: number;
    }>(`/api/analytics/net-worth/history?months_back=${monthsBack}`);
  }

  async getBudgetPerformance() {
    return apiClient.get<{
      budget_count: number;
      over_budget_count: number;
      at_risk_count: number;
      performance: BudgetPerformance[];
    }>('/api/analytics/budget/performance');
  }

  async getGoalsProgress() {
    return apiClient.get<{
      active_goals: number;
      completed_goals: number;
      total_target_amount: number;
      total_saved_amount: number;
      overall_progress: number;
      goal_projections: GoalProgress[];
    }>('/api/analytics/goals/progress');
  }

  async getCashFlowForecast(days = 30) {
    return apiClient.get<CashFlowForecast>(`/api/analytics/cash-flow/forecast?days=${days}`);
  }

  async exportData(params: AnalyticsExportParams & { 
    categoryId?: number; 
    accountId?: number; 
  }) {
    const { startDate, endDate, format, type, categoryId, accountId } = params;
    const queryParams = new URLSearchParams();
    
    if (startDate) queryParams.append('start_date', startDate);
    if (endDate) queryParams.append('end_date', endDate);
    if (categoryId) queryParams.append('category_id', categoryId.toString());
    if (accountId) queryParams.append('account_id', accountId.toString());

    let endpoint = '';
    switch (type) {
      case 'transactions':
        endpoint = `/analytics/export/transactions/${format}`;
        break;
      case 'analytics':
        endpoint = `/analytics/export/analytics/${format}`;
        break;
      case 'financial-report':
        endpoint = `/analytics/export/financial-report/${format}`;
        break;
      case 'net-worth':
        endpoint = `/analytics/export/net-worth/${format}`;
        break;
    }

    try {
      // Get the auth token from apiClient
      const token = apiClient.getAuthToken();
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Use the same base URL as apiClient
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const url = `${baseUrl}/api${endpoint}?${queryParams.toString()}`;

      // Fetching export data
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      let response;
      try {
        response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': format === 'pdf' ? 'application/pdf' : 'text/csv',
          },
          credentials: 'include',
          mode: 'cors',
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        // Fetch error occurred
        
        if (fetchError instanceof Error) {
          if (fetchError.name === 'AbortError') {
            throw new Error('Export request timed out. Please try again.');
          }
          if (fetchError.message.includes('Failed to fetch')) {
            throw new Error('Network error. Please check your connection and try again.');
          }
        }
        throw fetchError;
      }

      if (!response.ok) {
        // Try to read error message from response
        let errorMessage = `Export failed with status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use status-based messages
          if (response.status === 401) {
            errorMessage = 'Authentication expired. Please log in again.';
          } else if (response.status === 404) {
            errorMessage = 'Export feature not available. Please try again later.';
          } else if (response.status === 500) {
            errorMessage = 'Server error during export. Please try again later.';
          }
        }
        throw new Error(errorMessage);
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Get filename from Content-Disposition header if available
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${type}_export_${new Date().toISOString().split('T')[0]}.${format}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      // Trigger download
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
      }, 100);
    } catch (error) {
      // Export error occurred
      
      // If it's a network error, provide helpful guidance
      if (error instanceof Error && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
        // Network error handling

        // Check if it might be a CORS issue
        const _isCorsIssue = window.location.port !== '3000';
        
        throw new Error(
          'Network error: Unable to download the file. This might be caused by:\n' +
          '• Ad blockers or browser extensions blocking the request\n' +
          '• VPN or proxy settings\n' +
          '• Browser security settings\n' +
          'Please try disabling extensions or using a different browser.'
        );
      }
      
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();