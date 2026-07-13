import { getLocalDateString } from '@/lib/utils';

export type SavingsCategory = 'travel' | 'home' | 'emergency' | 'education' | 'other';

export type SavingsGoal = {
  id: string;
  name: string;
  category: SavingsCategory;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  createdAt: string;
};

export const progressPct = (current: number, target: number): number => {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
};

export const monthsUntilTarget = (targetDate: string): number => {
  const daysRemaining = Math.ceil((new Date(targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.ceil(daysRemaining / 30));
};

export const monthlySuggestion = (goal: SavingsGoal): number => {
  const amountRemaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  return Math.max(0, Math.ceil(amountRemaining / monthsUntilTarget(goal.targetDate)));
};

export const projectedCompletionDate = (goal: SavingsGoal): Date => {
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const monthly = monthlySuggestion(goal);
  const projected = new Date();
  if (remaining === 0 || monthly === 0) return projected;
  projected.setMonth(projected.getMonth() + Math.ceil(remaining / monthly));
  return projected;
};

const dateMonthsFromToday = (months: number): string => {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return getLocalDateString(date);
};

export const SAMPLE_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'japan-trip',
    name: 'Viaje a Japón',
    category: 'travel',
    targetAmount: 5000,
    currentAmount: 3200,
    targetDate: dateMonthsFromToday(8),
    createdAt: dateMonthsFromToday(-6),
  },
  {
    id: 'emergency-fund',
    name: 'Fondo de emergencia',
    category: 'emergency',
    targetAmount: 6000,
    currentAmount: 4500,
    targetDate: dateMonthsFromToday(12),
    createdAt: dateMonthsFromToday(-9),
  },
  {
    id: 'home-renovation',
    name: 'Reforma del hogar',
    category: 'home',
    targetAmount: 4000,
    currentAmount: 1600,
    targetDate: dateMonthsFromToday(18),
    createdAt: dateMonthsFromToday(-4),
  },
];

export const CATEGORY_META: Record<SavingsCategory, { label: string; catVar: string }> = {
  travel: { label: 'Viaje', catVar: '--cat-blue' },
  home: { label: 'Hogar', catVar: '--cat-emerald' },
  emergency: { label: 'Emergencias', catVar: '--cat-amber' },
  education: { label: 'Educación', catVar: '--cat-indigo' },
  other: { label: 'Otros', catVar: '--cat-purple' },
};
