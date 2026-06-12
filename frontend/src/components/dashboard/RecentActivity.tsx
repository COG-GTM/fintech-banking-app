import React from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Coffee,
  Car,
  Home,
  Zap,
  Music,
  DollarSign,
  ArrowUpRight,
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useRouter } from 'next/navigation';
import type { Transaction } from '@/lib/api/transactions';
import type { Category } from '@/lib/api/categories';
import type { Account } from '@/lib/api/accounts';

interface RecentActivityProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
}

const getCategoryIcon = (categoryName: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'Shopping': <ShoppingBag className="w-4 h-4" />,
    'Food & Dining': <Coffee className="w-4 h-4" />,
    'Transportation': <Car className="w-4 h-4" />,
    'Housing': <Home className="w-4 h-4" />,
    'Utilities': <Zap className="w-4 h-4" />,
    'Entertainment': <Music className="w-4 h-4" />,
    'Income': <DollarSign className="w-4 h-4" />,
    'Transfer': <ArrowUpRight className="w-4 h-4" />,
  };
  return iconMap[categoryName] || <DollarSign className="w-4 h-4" />;
};

const getCategoryColor = (categoryName: string) => {
  const colorMap: Record<string, string> = {
    'Shopping': 'bg-[var(--cat-indigo)]',
    'Food & Dining': 'bg-[var(--cat-amber)]',
    'Transportation': 'bg-[var(--cat-blue)]',
    'Housing': 'bg-[var(--cat-emerald)]',
    'Utilities': 'bg-[var(--cat-teal)]',
    'Entertainment': 'bg-[var(--cat-pink)]',
    'Income': 'bg-[var(--cat-emerald)]',
    'Transfer': 'bg-[var(--cat-blue)]',
  };
  return colorMap[categoryName] || 'bg-[rgba(var(--glass-rgb),0.3)]';
};

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export const RecentActivity: React.FC<RecentActivityProps> = ({
  transactions,
  categories,
  accounts,
}) => {
  const router = useRouter();

  const resolveCategoryName = (t: Transaction): string => {
    if (t.category?.name) return t.category.name;
    if (t.category_id) {
      const cat = categories.find((c) => c.id === t.category_id);
      if (cat) return cat.name;
    }
    return 'Uncategorized';
  };

  const resolveAccountName = (t: Transaction): string | null => {
    if (t.account?.name) return t.account.name;
    if (t.account_id) {
      const acc = accounts.find((a) => a.id === t.account_id);
      if (acc) return acc.name;
    }
    return null;
  };

  return (
    <Card variant="default" className="h-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[var(--text-1)]">
            Recent Activity
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/transactions')}
          >
            View All
          </Button>
        </div>

        <motion.div
          className="space-y-3"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {transactions.map((transaction) => {
            const categoryName = resolveCategoryName(transaction);
            const accountName = resolveAccountName(transaction);
            const isCredit = transaction.transaction_type === 'CREDIT';
            const displayText = transaction.merchant || transaction.description;
            const formattedAmount = `${isCredit ? '+' : '-'}$${Math.abs(transaction.amount).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`;

            return (
              <motion.div
                key={transaction.id}
                variants={itemVariants}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[rgba(var(--glass-rgb),0.1)] transition-colors cursor-pointer"
                onClick={() => router.push('/transactions')}
              >
                <div
                  className={`p-2.5 rounded-lg ${getCategoryColor(categoryName)} flex items-center justify-center`}
                >
                  {getCategoryIcon(categoryName)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--text-1)] truncate text-sm">
                    {displayText}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-[var(--text-2)]">
                      {formatRelativeTime(transaction.transaction_date)}
                    </span>
                    {accountName && (
                      <>
                        <span className="text-[var(--text-2)]">&middot;</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-[rgba(var(--glass-rgb),0.2)] text-[var(--text-2)]">
                          {accountName}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p
                    className={`font-semibold text-sm ${
                      isCredit
                        ? 'text-[var(--primary-emerald)]'
                        : 'text-[var(--primary-red)]'
                    }`}
                  >
                    {formattedAmount}
                  </p>
                </div>
              </motion.div>
            );
          })}

          {transactions.length === 0 && (
            <p className="text-sm text-[var(--text-2)] text-center py-4">
              No recent activity
            </p>
          )}
        </motion.div>
      </div>
    </Card>
  );
};

export default RecentActivity;
