'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import CreateSavingsGoalModal from '@/components/mis-finanzas/CreateSavingsGoalModal';
import MisFinanzasEmptyState from '@/components/mis-finanzas/MisFinanzasEmptyState';
import SavingsGoalCard from '@/components/mis-finanzas/SavingsGoalCard';
import SavingsSummaryHeader from '@/components/mis-finanzas/SavingsSummaryHeader';
import { SAMPLE_SAVINGS_GOALS, type SavingsGoal } from '@/lib/savings';

export default function MisFinanzasPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>(SAMPLE_SAVINGS_GOALS);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <main className="container mx-auto space-y-6 px-4 py-8 pb-24 md:space-y-8 md:pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-1)] md:text-3xl">Mis Finanzas</h1>
          <p className="mt-2 text-sm text-[var(--text-2)] md:text-base">Crea metas de ahorro y sigue tu progreso</p>
        </div>
        <Button variant="primary" icon={<Plus size={18} />} onClick={() => setShowCreateModal(true)}>Nueva meta</Button>
      </div>

      {goals.length === 0 ? (
        <MisFinanzasEmptyState onCreateClick={() => setShowCreateModal(true)} />
      ) : (
        <>
          <SavingsSummaryHeader goals={goals} />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal, index) => (
              <motion.div key={goal.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
                <SavingsGoalCard goal={goal} />
              </motion.div>
            ))}
          </div>
        </>
      )}

      <CreateSavingsGoalModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={(goal) => {
          setGoals((currentGoals) => [goal, ...currentGoals]);
          setShowCreateModal(false);
        }}
      />
    </main>
  );
}
