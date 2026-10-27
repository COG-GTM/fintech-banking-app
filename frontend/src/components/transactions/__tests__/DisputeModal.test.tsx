import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DisputeModal } from '../DisputeModal'
import { getDisputeIneligibilityReason } from '@/lib/api/transactions'

jest.mock('framer-motion', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactLib = require('react')
  const motionProps = ['initial', 'animate', 'exit', 'transition', 'variants', 'whileHover', 'whileTap', 'layout']
  const cache: Record<string, unknown> = {}
  const motion = new Proxy({}, {
    get: (_target, tag: string) => {
      cache[tag] ??= ({ children, ...props }: Record<string, unknown>) => {
        motionProps.forEach(key => delete props[key])
        return ReactLib.createElement(tag, props, children)
      }
      return cache[tag]
    },
  })
  return { motion, AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</> }
})

const renderModal = (overrides: Partial<React.ComponentProps<typeof DisputeModal>> = {}) => {
  const props = {
    isOpen: true,
    onClose: jest.fn(),
    onSubmit: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  }
  render(<DisputeModal {...props} />)
  return props
}

describe('DisputeModal', () => {
  it('offers the four dispute reasons and an optional details field', () => {
    renderModal()
    expect(screen.getByText('Dispute transaction')).toBeInTheDocument()
    const reasons = screen.getAllByRole('radio').map(r => r.closest('label')?.textContent)
    expect(reasons).toEqual(['Unrecognised', 'Duplicate', 'Wrong amount', 'Goods not received'])
    expect(screen.getByLabelText('Details (optional)')).toBeInTheDocument()
  })

  it('keeps submit disabled until a reason is chosen', async () => {
    const user = userEvent.setup()
    renderModal()
    const submit = screen.getByRole('button', { name: /submit dispute/i })
    expect(submit).toBeDisabled()
    await user.click(screen.getByLabelText('Duplicate'))
    expect(submit).toBeEnabled()
  })

  it('submits the reason without details when details are blank', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderModal()
    await user.click(screen.getByLabelText('Unrecognised'))
    await user.type(screen.getByLabelText('Details (optional)'), '   ')
    await user.click(screen.getByRole('button', { name: /submit dispute/i }))
    expect(onSubmit).toHaveBeenCalledWith({ reason: 'unrecognised' })
  })

  it('submits the reason with trimmed details', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderModal()
    await user.click(screen.getByLabelText('Wrong amount'))
    await user.type(screen.getByLabelText('Details (optional)'), '  Charged $40 not $4  ')
    await user.click(screen.getByRole('button', { name: /submit dispute/i }))
    expect(onSubmit).toHaveBeenCalledWith({ reason: 'wrong_amount', details: 'Charged $40 not $4' })
  })

  it('shows the error and stays open when submission fails', async () => {
    const user = userEvent.setup()
    const { onClose } = renderModal({
      onSubmit: jest.fn().mockRejectedValue(new Error('This transaction is already disputed')),
    })
    await user.click(screen.getByLabelText('Goods not received'))
    await user.click(screen.getByRole('button', { name: /submit dispute/i }))
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('This transaction is already disputed')
    )
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose when cancelled', async () => {
    const user = userEvent.setup()
    const { onClose, onSubmit } = renderModal()
    await user.click(screen.getByRole('button', { name: /^cancel$/i }))
    expect(onClose).toHaveBeenCalled()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('renders nothing when closed', () => {
    renderModal({ isOpen: false })
    expect(screen.queryByText('Dispute transaction')).not.toBeInTheDocument()
  })
})

describe('getDisputeIneligibilityReason', () => {
  const now = new Date('2026-06-01T12:00:00Z')
  const base = {
    status: 'completed' as never,
    transaction_type: 'DEBIT' as const,
    transaction_date: '2026-05-20T12:00:00Z',
    is_disputed: false,
  }

  it('allows recent completed card payments', () => {
    expect(getDisputeIneligibilityReason(base, now)).toBeNull()
  })

  it.each([
    [{ status: 'pending' }, /pending/i],
    [{ status: 'FAILED' }, /failed/i],
    [{ is_disputed: true }, /already disputed/i],
    [{ transaction_date: '2026-01-01T12:00:00Z' }, /120 days/],
  ])('explains why %o is blocked', (override, message) => {
    expect(getDisputeIneligibilityReason({ ...base, ...override } as typeof base, now)).toMatch(message)
  })
})
