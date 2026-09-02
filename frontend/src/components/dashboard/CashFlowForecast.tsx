'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CalendarDays, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import { analyticsService } from '@/lib/api';
import type { CashFlowForecast as CashFlowForecastData } from '@/lib/api';

interface CashFlowForecastProps {
  className?: string;
}

const formatMoney = (amount: number) =>
  `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

export default function CashFlowForecast({ className = '' }: CashFlowForecastProps) {
  const [days, setDays] = useState(30);
  const [forecast, setForecast] = useState<CashFlowForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setHasError(false);
    analyticsService
      .getCashFlowForecast(days)
      .then((data) => {
        if (active) setForecast(data);
      })
      .catch(() => {
        if (active) {
          setForecast(null);
          setHasError(true);
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [days]);

  const chart = useMemo(() => {
    if (!forecast || forecast.daily_projection.length === 0) return null;

    const width = 720;
    const height = 180;
    const balances = forecast.daily_projection.map((point) => point.balance);
    const minBalance = Math.min(...balances, 0);
    const maxBalance = Math.max(...balances, 0);
    const range = maxBalance - minBalance || 1;
    const pointFor = (balance: number, index: number) => {
      const x = (index / Math.max(forecast.daily_projection.length - 1, 1)) * width;
      const y = height - ((balance - minBalance) / range) * (height - 20) - 10;
      return `${x},${y}`;
    };
    const points = forecast.daily_projection.map((point, index) => pointFor(point.balance, index));
    const zeroY = height - ((0 - minBalance) / range) * (height - 20) - 10;
    const negativeAlert = forecast.alerts.find((alert) => alert.type === 'negative_balance');
    const negativeIndex = negativeAlert
      ? Math.max(0, forecast.daily_projection.findIndex((point) => point.date === negativeAlert.date))
      : -1;
    const areaPoints = `${points[0]} ${points.slice(1).join(' ')} ${width},${height} 0,${height}`;

    return { width, height, points, zeroY, negativeIndex, areaPoints };
  }, [forecast]);

  if (isLoading) {
    return (
      <Card className={`cash-flow-forecast ${className}`}>
        <div className="p-6 animate-pulse">
          <div className="h-5 w-48 rounded bg-[rgba(var(--glass-rgb),0.2)] mb-3" />
          <div className="h-10 w-36 rounded bg-[rgba(var(--glass-rgb),0.2)] mb-6" />
          <div className="h-48 rounded bg-[rgba(var(--glass-rgb),0.12)]" />
        </div>
      </Card>
    );
  }

  if (hasError || !forecast || !chart) {
    return (
      <Card variant="error" className={`cash-flow-forecast ${className}`}>
        <div className="p-6 text-center text-[var(--text-2)]">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-[var(--primary-amber)]" />
          <p>Couldn&apos;t load forecast</p>
        </div>
      </Card>
    );
  }

  const alertMessages = forecast.alerts.map((alert) =>
    alert.type === 'negative_balance'
      ? `Projected balance turns negative on ${formatDate(alert.date)}.`
      : `Projected balance falls below your buffer on ${formatDate(alert.date)}.`
  );

  return (
    <Card className={`cash-flow-forecast ${className}`}>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[var(--primary-blue)]" />
              <h3 className="text-lg font-semibold text-[var(--text-1)]">Cash Flow Forecast</h3>
            </div>
            <p className="text-sm text-[var(--text-2)] mt-1">Safe to spend</p>
            <p className={`text-3xl font-bold mt-1 ${forecast.safe_to_spend > 0 ? 'text-[var(--primary-emerald)]' : 'text-[var(--primary-amber)]'}`}>
              {formatMoney(forecast.safe_to_spend)}
            </p>
            <p className="text-xs text-[var(--text-2)] mt-1">
              after upcoming bills and a {formatMoney(forecast.buffer)} buffer
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-[rgba(var(--glass-rgb),0.12)] p-1">
            {[30, 60, 90].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDays(option)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  days === option
                    ? 'bg-[var(--primary-blue)] text-white'
                    : 'text-[var(--text-2)] hover:text-[var(--text-1)]'
                }`}
              >
                {option}d
              </button>
            ))}
          </div>
        </div>

        <div className="h-48 mb-6">
          <svg className="w-full h-full" viewBox={`0 0 ${chart.width} ${chart.height}`} preserveAspectRatio="none" role="img" aria-label="Projected cash balance">
            <polygon points={chart.areaPoints} fill="var(--primary-blue)" fillOpacity="0.12" />
            {chart.zeroY >= 0 && chart.zeroY <= chart.height && (
              <line x1="0" y1={chart.zeroY} x2={chart.width} y2={chart.zeroY} stroke="var(--text-2)" strokeDasharray="5,5" opacity="0.6" />
            )}
            {chart.negativeIndex >= 0 ? (
              <>
                <polyline points={chart.points.slice(0, chart.negativeIndex + 1).join(' ')} fill="none" stroke="var(--primary-emerald)" strokeWidth="3" />
                <polyline points={chart.points.slice(Math.max(0, chart.negativeIndex - 1)).join(' ')} fill="none" stroke="var(--primary-red)" strokeWidth="3" />
              </>
            ) : (
              <polyline points={chart.points.join(' ')} fill="none" stroke="var(--primary-blue)" strokeWidth="3" />
            )}
          </svg>
        </div>

        {alertMessages.length > 0 && (
          <div className="mb-5 rounded-lg border border-[var(--primary-amber)]/40 bg-[var(--primary-amber)]/10 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-[var(--primary-amber)]" />
              <div className="space-y-1">
                {alertMessages.map((message) => (
                  <p key={message} className="text-xs text-[var(--text-1)]">{message}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-4 h-4 text-[var(--text-2)]" />
            <h4 className="text-sm font-medium text-[var(--text-1)]">Upcoming bills</h4>
          </div>
          <div className="space-y-2">
            {forecast.upcoming_events.slice(0, 5).map((event, index) => (
              <motion.div
                key={`${event.date}-${event.name}-${index}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between rounded-lg p-2 hover:bg-[rgba(var(--glass-rgb),0.1)]"
              >
                <div>
                  <p className="text-sm text-[var(--text-1)]">{event.name}</p>
                  <p className="text-xs text-[var(--text-2)]">{formatDate(event.date)}</p>
                </div>
                <p className="text-sm font-semibold text-[var(--text-1)]">{formatMoney(event.amount)}</p>
              </motion.div>
            ))}
            {forecast.upcoming_events.length === 0 && (
              <p className="text-sm text-[var(--text-2)]">No upcoming bills in this period.</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
