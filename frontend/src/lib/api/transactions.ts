import { apiClient } from './client';

export interface Transaction {
  id: number;
  account_id: number;
  category_id?: number;
  amount: number;
  transaction_type: 'DEBIT' | 'CREDIT';
  description: string;
  merchant?: string;
  merchant_id?: number;
  transaction_date: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  is_disputed?: boolean;
  dispute_id?: number | null;
  notes?: string;
  tags?: string[];
  from_account_id?: number;
  to_account_id?: number;
  reference_number?: string;
  recurring_rule_id?: number;
  attachments?: Array<{
    id: number;
    file_name: string;
    file_type: string;
    file_size: number;
    uploaded_at: string;
  }>;
  created_at: string;
  updated_at?: string;
  category?: {
    id: number;
    name: string;
    type: string;
    icon?: string;
    color?: string;
  };
  account?: {
    id: number;
    name: string;
    account_type: string;
  };
}

export interface TransactionCreate {
  account_id: number;
  category_id?: number;
  amount: number;
  transaction_type: 'DEBIT' | 'CREDIT';
  description: string;
  merchant_name?: string;
  transaction_date?: string;
}

export interface TransactionUpdate {
  category_id?: number;
  description?: string;
  merchant?: string;
  notes?: string;
  tags?: string[];
  attachments?: Array<{ name: string; type: string; size: string }>;
}

export interface TransactionFilters {
  account_id?: number;
  category_id?: number;
  transaction_type?: 'DEBIT' | 'CREDIT';
  status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
  search?: string;
  disputed?: boolean;
}

export type DisputeReason = 'unrecognised' | 'duplicate' | 'wrong_amount' | 'goods_not_received';

export const DISPUTE_REASONS: { value: DisputeReason; label: string }[] = [
  { value: 'unrecognised', label: 'Unrecognised' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'wrong_amount', label: 'Wrong amount' },
  { value: 'goods_not_received', label: 'Goods not received' },
];

export const DISPUTE_WINDOW_DAYS = 120;

export interface DisputeCreate {
  reason: DisputeReason;
  details?: string;
}

export interface Dispute {
  id: number;
  transaction_id: number;
  user_id: number;
  reason: DisputeReason;
  details?: string | null;
  status: 'open' | 'cancelled';
  created_at: string;
  cancelled_at?: string | null;
}

/** Why a transaction can't be disputed, or null if it can. Mirrors the API rules. */
export function getDisputeIneligibilityReason(
  transaction: Pick<Transaction, 'status' | 'transaction_type' | 'transaction_date' | 'is_disputed'>,
  now: Date = new Date()
): string | null {
  const status = String(transaction.status).toUpperCase();
  if (transaction.is_disputed) return 'This transaction is already disputed';
  if (status === 'PENDING') return "Pending transactions can't be disputed until they complete";
  if (status === 'FAILED') return "Failed transactions can't be disputed";
  if (status !== 'COMPLETED') return 'Only completed transactions can be disputed';
  if (String(transaction.transaction_type).toUpperCase() !== 'DEBIT') return 'Only card payments can be disputed';
  const ageMs = now.getTime() - new Date(transaction.transaction_date).getTime();
  if (ageMs > DISPUTE_WINDOW_DAYS * 24 * 60 * 60 * 1000) {
    return `Transactions older than ${DISPUTE_WINDOW_DAYS} days can't be disputed`;
  }
  return null;
}

export interface TransactionStats {
  total_income: number;
  total_expenses: number;
  net_flow: number;
  transaction_count: number;
  average_transaction: number;
  categories_breakdown: Array<{
    category_id: number;
    category_name: string;
    total_amount: number;
    transaction_count: number;
  }>;
}

// The API serializes enum values in lower case (e.g. "credit"/"debit"), but the
// rest of the frontend works with the upper-case contract declared on the
// Transaction type. Normalize at the boundary so every consumer can rely on it.
export function normalizeTransaction(transaction: Transaction): Transaction {
  return {
    ...transaction,
    transaction_type: transaction.transaction_type?.toString().toUpperCase() as Transaction['transaction_type'],
  };
}

class TransactionsService {
  async getTransactions(filters?: TransactionFilters & { skip?: number; limit?: number }): Promise<Transaction[]> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const transactions = await apiClient.get<Transaction[]>(`/api/transactions?${params.toString()}`);
    return transactions.map(normalizeTransaction);
  }

  async getTransaction(id: number): Promise<Transaction> {
    const transaction = await apiClient.get<Transaction>(`/api/transactions/${id}`);
    return normalizeTransaction(transaction);
  }

  async createTransaction(data: TransactionCreate): Promise<Transaction> {
    return apiClient.post<Transaction>('/api/transactions', data);
  }

  async updateTransaction(id: number, data: TransactionUpdate): Promise<Transaction> {
    return apiClient.put<Transaction>(`/api/transactions/${id}`, data);
  }

  async deleteTransaction(id: number): Promise<void> {
    return apiClient.delete<void>(`/api/transactions/${id}`);
  }

  async openDispute(id: number, data: DisputeCreate): Promise<Dispute> {
    return apiClient.post<Dispute>(`/api/transactions/${id}/dispute`, data);
  }

  async getDispute(id: number): Promise<Dispute> {
    return apiClient.get<Dispute>(`/api/transactions/${id}/dispute`);
  }

  async cancelDispute(id: number): Promise<Dispute> {
    return apiClient.delete<Dispute>(`/api/transactions/${id}/dispute`);
  }

  async getTransactionStats(filters?: TransactionFilters): Promise<TransactionStats> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    // Add timestamp to prevent caching
    params.append('_t', Date.now().toString());
    
    
    
    return apiClient.get<TransactionStats>(`/api/transactions/stats?${params.toString()}`);
  }

  async importTransactions(file: File, accountId: number): Promise<{ imported: number; failed: number }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('account_id', accountId.toString());
    
    return apiClient.post('/api/transactions/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async bulkCategorize(transactionIds: number[], categoryId: number): Promise<{ updated: number }> {
    return apiClient.post('/api/transactions/bulk-categorize', {
      transaction_ids: transactionIds,
      category_id: categoryId,
    });
  }
}

// Export singleton instance
export const transactionsService = new TransactionsService();