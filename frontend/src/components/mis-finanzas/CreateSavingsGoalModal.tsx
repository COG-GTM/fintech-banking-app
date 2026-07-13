'use client';

import { useState } from 'react';
import { Euro, GraduationCap, Home, PiggyBank, Plane, Shield, Target } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DatePicker from '@/components/ui/DatePicker';
import Dropdown from '@/components/ui/Dropdown';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { CATEGORY_META, monthsUntilTarget, type SavingsCategory, type SavingsGoal } from '@/lib/savings';
import { formatCurrency, getLocalDateString } from '@/lib/utils';

interface CreateSavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (goal: SavingsGoal) => void;
}

const categoryItems = [
  { value: 'travel', label: CATEGORY_META.travel.label, icon: <Plane size={18} /> },
  { value: 'home', label: CATEGORY_META.home.label, icon: <Home size={18} /> },
  { value: 'emergency', label: CATEGORY_META.emergency.label, icon: <Shield size={18} /> },
  { value: 'education', label: CATEGORY_META.education.label, icon: <GraduationCap size={18} /> },
  { value: 'other', label: CATEGORY_META.other.label, icon: <Target size={18} /> },
];

export default function CreateSavingsGoalModal({ isOpen, onClose, onCreate }: CreateSavingsGoalModalProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState<SavingsCategory>('other');
  const [submitted, setSubmitted] = useState(false);
  const today = getLocalDateString(new Date());
  const numericAmount = Number(amount);
  const dateValue = targetDate ? getLocalDateString(new Date(targetDate)) : '';
  const months = dateValue ? monthsUntilTarget(dateValue) : 0;
  const errors = {
    name: !name.trim() ? 'Introduce un nombre para la meta.' : '',
    amount: numericAmount <= 0 ? 'El importe debe ser mayor que 0.' : '',
    date: !dateValue || dateValue <= today ? 'Elige una fecha futura.' : '',
  };

  const reset = () => {
    setName('');
    setAmount('');
    setTargetDate('');
    setCategory('other');
    setSubmitted(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = () => {
    setSubmitted(true);
    if (errors.name || errors.amount || errors.date) return;
    onCreate({
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name: name.trim(),
      category,
      targetAmount: numericAmount,
      currentAmount: 0,
      targetDate: dateValue,
      createdAt: today,
    });
    reset();
  };

  return (
    <Modal isOpen={isOpen} onClose={close} size="lg" title="Nueva meta de ahorro" icon={<PiggyBank /> }
      footer={<div className="flex justify-end gap-3"><Button variant="ghost" onClick={close}>Cancelar</Button><Button variant="primary" onClick={submit}>Crear meta</Button></div>}>
      <div className="space-y-4">
        <Input label="Nombre" required placeholder="Ej. Viaje a Japón" value={name} onChange={(event) => setName(event.target.value)} error={submitted ? errors.name : ''} />
        <Input label="Importe objetivo (EUR)" type="number" min="0" required icon={<Euro size={18} />} value={amount} onChange={(event) => setAmount(event.target.value)} error={submitted ? errors.amount : ''} />
        <DatePicker label="Fecha objetivo" required minDate={today} value={targetDate} onChange={(value) => setTargetDate(value ? getLocalDateString(new Date(value)) : '')} error={submitted ? errors.date : ''} />
        <Dropdown label="Categoría" items={categoryItems} value={category} onChange={(value) => setCategory(value as SavingsCategory)} />
        {numericAmount > 0 && dateValue && (
          <Card variant="subtle" padding="sm">
            <p className="text-sm text-[var(--text-2)]">Aporte sugerido: <span className="font-semibold text-[var(--text-1)]">{formatCurrency(Math.ceil(numericAmount / months), 'EUR')} / mes</span> durante {months} meses</p>
          </Card>
        )}
      </div>
    </Modal>
  );
}
