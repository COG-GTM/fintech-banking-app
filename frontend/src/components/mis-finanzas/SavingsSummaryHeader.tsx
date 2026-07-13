'use client';

import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import { progressPct, type SavingsGoal } from '@/lib/savings';
import { formatCurrency } from '@/lib/utils';

export default function SavingsSummaryHeader({ goals }: { goals: SavingsGoal[] }) {
  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const progress = progressPct(totalSaved, totalTarget);
  const circumference = 2 * Math.PI * 88;

  return (
    <Card variant="prominent" padding="lg">
      <div className="grid items-center gap-8 md:grid-cols-3">
        <div className="flex justify-center">
          <div className="relative h-32 w-32 md:h-40 md:w-40">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 192 192">
              <circle cx="96" cy="96" r="88" stroke="rgba(var(--glass-rgb),0.1)" strokeWidth="8" fill="none" />
              <motion.circle
                cx="96" cy="96" r="88" stroke="url(#tfProgressGradient)" strokeWidth="8" fill="none"
                strokeLinecap="round" strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference * (1 - progress / 100) }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="tfProgressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--tf-blue)" />
                  <stop offset="100%" stopColor="var(--tf-blue-600)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-[var(--text-1)]">{progress}%</span>
              <span className="text-sm text-[var(--text-2)]">Completado</span>
            </div>
          </div>
        </div>
        <div className="text-center md:text-left">
          <p className="text-sm text-[var(--text-2)]">Total ahorrado</p>
          <p className="text-2xl font-bold text-[var(--primary-emerald)]">{formatCurrency(totalSaved, 'EUR')}</p>
          <p className="mt-1 text-sm text-[var(--text-2)]">{goals.length} metas activas</p>
        </div>
        <div className="text-center md:text-left">
          <p className="text-sm text-[var(--text-2)]">Objetivo total</p>
          <p className="text-2xl font-bold text-[var(--tf-blue)]">{formatCurrency(totalTarget, 'EUR')}</p>
          <p className="mt-1 text-sm text-[var(--text-2)]">Faltan {formatCurrency(totalTarget - totalSaved, 'EUR')}</p>
        </div>
      </div>
    </Card>
  );
}
