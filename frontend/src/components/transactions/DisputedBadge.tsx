import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface DisputedBadgeProps {
  className?: string;
}

export const DisputedBadge: React.FC<DisputedBadgeProps> = ({ className = '' }) => (
  <span
    data-testid="disputed-badge"
    className={`inline-flex items-center gap-1 rounded-full border border-[var(--primary-amber)] bg-[rgba(var(--glass-rgb),0.15)] px-2 py-0.5 text-xs font-medium text-[var(--primary-amber)] ${className}`}
  >
    <ShieldAlert className="w-3 h-3" />
    Disputed
  </span>
);

export default DisputedBadge;
