import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Store,
  Clock,
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useRouter } from 'next/navigation';

interface ActivityTransaction {
  id: string;
  amount: number;
  transactionType: 'CREDIT' | 'DEBIT';
  merchant: string;
  timestamp: string;
  status: 'completed' | 'pending';
}

interface RecentActivityFeedProps {
  transactions: ActivityTransaction[];
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  transactions,
}) => {
  const router = useRouter();

  const formatAmount = (amount: number, type: 'CREDIT' | 'DEBIT') => {
    const sign = type === 'CREDIT' ? '+' : '-';
    return `${sign}$${Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card variant="default" padding="none">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--text-1)]">
            Recent Activity
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/transactions')}
            analyticsId="recent-activity-view-all"
            analyticsLabel="Recent Activity View All"
          >
            View All
          </Button>
        </div>

        <div className="divide-y divide-[var(--border-1)]">
          {transactions.map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="flex items-center gap-4 py-3 first:pt-0 last:pb-0 hover:bg-[rgba(var(--glass-rgb),0.1)] transition-colors cursor-pointer rounded-lg px-2 -mx-2"
              onClick={() => router.push('/transactions')}
            >
              <div
                className={`p-2.5 rounded-lg flex items-center justify-center ${
                  tx.transactionType === 'CREDIT'
                    ? 'bg-[var(--cat-emerald)]'
                    : 'bg-[var(--cat-indigo)]'
                }`}
              >
                {tx.transactionType === 'CREDIT' ? (
                  <ArrowDownLeft className="w-4 h-4" />
                ) : (
                  <ArrowUpRight className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-[var(--text-2)]" />
                  <p className="font-medium text-[var(--text-1)] truncate">
                    {tx.merchant}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3 text-[var(--text-2)]" />
                  <span className="text-xs text-[var(--text-2)]">
                    {formatTimestamp(tx.timestamp)}
                  </span>
                  {tx.status === 'pending' && (
                    <>
                      <span className="text-[var(--text-2)]">·</span>
                      <span className="text-xs text-[var(--primary-amber)]">
                        Pending
                      </span>
                    </>
                  )}
                </div>
              </div>

              <p
                className={`font-semibold whitespace-nowrap ${
                  tx.transactionType === 'CREDIT'
                    ? 'text-[var(--primary-emerald)]'
                    : 'text-[var(--text-1)]'
                }`}
              >
                {formatAmount(tx.amount, tx.transactionType)}
              </p>
            </motion.div>
          ))}

          {transactions.length === 0 && (
            <p className="text-sm text-[var(--text-2)] text-center py-8">
              No recent activity to display.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default RecentActivityFeed;
