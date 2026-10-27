'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { DISPUTE_REASONS } from '@/lib/api/transactions';
import type { DisputeCreate, DisputeReason } from '@/lib/api/transactions';

export const DISPUTE_DETAILS_MAX_LENGTH = 1000;

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DisputeCreate) => Promise<void> | void;
  transactionLabel?: string;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  transactionLabel,
}) => {
  const [reason, setReason] = useState<DisputeReason | null>(null);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setReason(null);
      setDetails('');
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!reason || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const trimmed = details.trim();
      await onSubmit(trimmed ? { reason, details: trimmed } : { reason });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open the dispute. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dispute transaction"
      icon={<ShieldAlert className="w-5 h-5 text-[var(--primary-amber)]" />}
      size="md"
      analyticsId="dispute-modal"
      analyticsLabel="Dispute Transaction"
      footer={
        <div className="flex gap-3 w-full">
          <Button variant="secondary" fullWidth onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="dispute-form"
            variant="primary"
            fullWidth
            disabled={!reason}
            loading={isSubmitting}
          >
            Submit dispute
          </Button>
        </div>
      }
    >
      <form id="dispute-form" onSubmit={handleSubmit} className="space-y-5">
        {transactionLabel && (
          <p className="text-sm text-[var(--text-2)]">{transactionLabel}</p>
        )}

        <fieldset>
          <legend className="block text-sm font-medium text-[var(--text-1)] mb-3">
            Why are you disputing this transaction?
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup">
            {DISPUTE_REASONS.map(option => (
              <label
                key={option.value}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                  reason === option.value
                    ? 'border-[var(--primary-blue)] bg-[rgba(var(--glass-rgb),0.2)]'
                    : 'border-[var(--border-1)] hover:bg-[rgba(var(--glass-rgb),0.1)]'
                }`}
              >
                <input
                  type="radio"
                  name="dispute-reason"
                  value={option.value}
                  checked={reason === option.value}
                  onChange={() => setReason(option.value)}
                  className="accent-[var(--primary-blue)]"
                />
                <span className="text-sm text-[var(--text-1)]">{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="dispute-details" className="block text-sm font-medium text-[var(--text-1)] mb-2">
            Details (optional)
          </label>
          <textarea
            id="dispute-details"
            value={details}
            onChange={e => setDetails(e.target.value)}
            maxLength={DISPUTE_DETAILS_MAX_LENGTH}
            rows={3}
            placeholder="Anything that helps us look into it"
            className="w-full rounded-lg border border-[var(--border-1)] bg-[rgba(var(--glass-rgb),0.1)] p-3 text-sm text-[var(--text-1)] placeholder:text-[var(--text-2)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-[var(--primary-red)]">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
};

export default DisputeModal;
