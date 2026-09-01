import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommandPalette from '../CommandPalette';

const mockPush = jest.fn();
const mockLogout = jest.fn().mockResolvedValue(undefined);

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ logout: mockLogout }),
}));

jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({
      children,
      initial,
      animate,
      exit,
      transition,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & {
      initial?: unknown;
      animate?: unknown;
      exit?: unknown;
      transition?: unknown;
    }) => <div {...props}>{children}</div>,
  },
}));

describe('CommandPalette', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens with Ctrl+K', async () => {
    render(<CommandPalette />);

    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

    expect(await screen.findByRole('dialog', { name: 'Command palette' })).toBeInTheDocument();
  });

  it('filters commands as the user types', async () => {
    const user = userEvent.setup();
    render(<CommandPalette />);
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

    const input = await screen.findByRole('combobox');
    await user.type(input, 'credit');

    expect(screen.getByRole('option', { name: 'Credit Cards' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Dashboard' })).not.toBeInTheDocument();
  });

  it('runs the selected command and closes with ArrowDown and Enter', async () => {
    const user = userEvent.setup();
    render(<CommandPalette />);
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

    const input = await screen.findByRole('combobox');
    await user.type(input, 'send');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockPush).toHaveBeenCalledWith('/transfer');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('closes with Escape', async () => {
    render(<CommandPalette />);
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
