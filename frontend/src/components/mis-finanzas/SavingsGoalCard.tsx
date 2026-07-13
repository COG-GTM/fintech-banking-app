'use client';

import { motion } from 'framer-motion';
import { Calendar, GraduationCap, Home, Plane, Shield, Target } from 'lucide-react';
import Card from '@/components/ui/Card';
import { CATEGORY_META, monthlySuggestion, progressPct, projectedCompletionDate, type SavingsGoal } from '@/lib/savings';
import { formatCurrency, formatDate } from '@/lib/utils';

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onClick?: () => void;
}

const categoryIcons = {
  travel: Plane,
  home: Home,
  emergency: Shield,
  education: GraduationCap,
  other: Target,
};

export default function SavingsGoalCard({ goal, onClick }: SavingsGoalCardProps) {
  const Icon = categoryIcons[goal.category];
  const category = CATEGORY_META[goal.category];
  const progress = progressPct(goal.currentAmount, goal.targetAmount);

  return (
    <Card variant="default" hoverable={Boolean(onClick)} onClick={onClick} className="h-full">
      <div className="flex h-full flex-col p-1">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-[rgba(var(--glass-rgb),0.3)] p-2">
              <Icon className="h-5 w-5 text-[var(--tf-blue)]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-1)]">{goal.name}</h3>
              <span
                className="mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium text-[var(--text-1)]"
                style={{ backgroundColor: `var(${category.catVar})` }}
              >
                {category.label}
              </span>
            </div>
          </div>
          <span className="text-sm font-medium text-[var(--tf-blue)]">{progress}%</span>
        </div>

        <div className="mb-5">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-lg font-semibold text-[var(--text-1)]">{formatCurrency(goal.currentAmount, 'EUR')}</span>
            <span className="text-sm text-[var(--text-2)]">{formatCurrency(goal.targetAmount, 'EUR')}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(var(--glass-rgb),0.1)]">
            <motion.div
              className="h-full bg-gradient-to-r from-[var(--tf-blue)] to-[var(--tf-blue-600)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="mt-auto space-y-2 border-t border-[var(--border-1)] pt-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[var(--text-2)]"><Calendar className="h-4 w-4" />Meta</span>
            <span className="text-[var(--text-1)]">{formatDate(goal.targetDate)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-2)]">Sugerido</span>
            <span className="text-[var(--text-1)]">{formatCurrency(monthlySuggestion(goal), 'EUR')}/mes</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-2)]">Prevista</span>
            <span className="text-[var(--text-1)]">{formatDate(projectedCompletionDate(goal))}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
