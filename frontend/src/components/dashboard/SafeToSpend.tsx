'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, ReceiptText, WalletCards } from 'lucide-react';
import Card from '../ui/Card';
import {
  SafeToSpend as SafeToSpendData,
  safeToSpendService,
} from '@/lib/api/safeToSpend';

const formatMoney = (amount: number) =>
  `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDueDate = (dueDate: string) =>
  new Date(`${dueDate}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

export default function SafeToSpend() {
  const [data, setData] = useState<SafeToSpendData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    safeToSpendService
      .getSafeToSpend()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <Card variant="default" className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-1)]">
            Safe to Spend
          </h3>
          <p className="mt-1 text-sm text-[var(--text-2)]">
            Available per day after upcoming bills
          </p>
        </div>
        <div className="rounded-lg bg-[rgba(var(--glass-rgb),0.3)] p-3">
          <WalletCards className="h-6 w-6 text-[var(--primary-emerald)]" />
        </div>
      </div>

      {isLoading ? (
        <div className="mt-6 space-y-3 animate-pulse">
          <div className="h-10 w-40 rounded bg-[rgba(var(--glass-rgb),0.3)]" />
          <div className="h-4 w-56 rounded bg-[rgba(var(--glass-rgb),0.2)]" />
          <div className="h-12 rounded bg-[rgba(var(--glass-rgb),0.2)]" />
        </div>
      ) : !data ? (
        <p className="mt-6 text-sm text-[var(--text-2)]">
          Safe-to-spend details are temporarily unavailable.
        </p>
      ) : (
        <>
          <div className="mt-6">
            <p className="text-4xl font-bold text-[var(--primary-emerald)]">
              {formatMoney(data.safe_per_day)}
            </p>
            <p className="mt-1 text-sm text-[var(--text-2)]">
              safe per day until your next income
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-[rgba(var(--glass-rgb),0.15)] p-3">
              <p className="text-xs text-[var(--text-2)]">Total safe to spend</p>
              <p className="mt-1 font-semibold text-[var(--text-1)]">
                {formatMoney(data.safe_to_spend)}
              </p>
            </div>
            <div className="rounded-lg bg-[rgba(var(--glass-rgb),0.15)] p-3">
              <p className="text-xs text-[var(--text-2)]">Upcoming bills</p>
              <p className="mt-1 font-semibold text-[var(--text-1)]">
                {formatMoney(data.total_upcoming)}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-[var(--border-1)] pt-4">
            <div className="mb-3 flex items-center gap-2">
              <ReceiptText className="h-4 w-4 text-[var(--text-2)]" />
              <p className="text-sm font-medium text-[var(--text-1)]">
                Next bills
              </p>
            </div>
            {data.upcoming_bills.length === 0 ? (
              <p className="text-sm text-[var(--text-2)]">
                No bills due in the next 30 days.
              </p>
            ) : (
              <div className="space-y-3">
                {data.upcoming_bills.slice(0, 4).map((bill, index) => (
                  <div
                    key={`${bill.source}-${bill.name}-${bill.due_date}-${index}`}
                    className="flex items-center gap-3"
                  >
                    <CalendarDays className="h-4 w-4 flex-shrink-0 text-[var(--text-2)]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-[var(--text-1)]">
                        {bill.name}
                      </p>
                      <p className="text-xs text-[var(--text-2)]">
                        Due {formatDueDate(bill.due_date)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-[var(--text-1)]">
                      {formatMoney(bill.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
