'use client';

import { PiggyBank } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function MisFinanzasEmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <Card variant="subtle" className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--tf-blue-050)]">
        <PiggyBank className="h-8 w-8 text-[var(--tf-blue)]" />
      </div>
      <h2 className="mt-5 text-xl font-semibold text-[var(--text-1)]">Aún no tienes metas de ahorro</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-[var(--text-2)]">
        Crea tu primera meta y empieza a ahorrar con seguimiento automático.
      </p>
      <Button className="mt-6" variant="primary" onClick={onCreateClick}>Crear mi primera meta</Button>
    </Card>
  );
}
