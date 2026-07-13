import {
  monthlySuggestion,
  monthsUntilTarget,
  progressPct,
  SAMPLE_SAVINGS_GOALS,
  SavingsGoal,
} from '../savings'

const DAY_IN_MS = 24 * 60 * 60 * 1000

const dateFromNow = (days: number): string =>
  new Date(Date.now() + days * DAY_IN_MS).toISOString()

describe('savings helpers', () => {
  describe('progressPct', () => {
    it('returns the rounded percentage for a normal ratio', () => {
      expect(progressPct(1, 3)).toBe(33)
      expect(progressPct(3, 4)).toBe(75)
    })

    it('clamps progress to 100 when current exceeds target', () => {
      expect(progressPct(125, 100)).toBe(100)
    })

    it('returns 0 when the target is not positive', () => {
      expect(progressPct(50, 0)).toBe(0)
      expect(progressPct(50, -10)).toBe(0)
    })
  })

  describe('monthsUntilTarget', () => {
    it('returns a positive number of months for a future date', () => {
      const months = monthsUntilTarget(dateFromNow(120))

      expect(months).toBeGreaterThan(0)
      expect(months).toBeLessThanOrEqual(5)
    })

    it('floors near and past dates at one month', () => {
      expect(monthsUntilTarget(dateFromNow(1))).toBe(1)
      expect(monthsUntilTarget(dateFromNow(-30))).toBe(1)
    })
  })

  describe('monthlySuggestion', () => {
    it('rounds the remaining amount up across the required months', () => {
      const goal: SavingsGoal = {
        id: 'test-goal',
        name: 'Test goal',
        category: 'other',
        targetAmount: 1001,
        currentAmount: 0,
        targetDate: dateFromNow(180),
        createdAt: dateFromNow(-30),
      }
      const months = monthsUntilTarget(goal.targetDate)

      expect(monthlySuggestion(goal)).toBe(Math.ceil(goal.targetAmount / months))
    })

    it('returns 0 when the goal is already met', () => {
      const goal: SavingsGoal = {
        id: 'met-goal',
        name: 'Met goal',
        category: 'emergency',
        targetAmount: 1000,
        currentAmount: 1000,
        targetDate: dateFromNow(90),
        createdAt: dateFromNow(-30),
      }

      expect(monthlySuggestion(goal)).toBe(0)
    })
  })

  describe('SAMPLE_SAVINGS_GOALS', () => {
    it('contains three goals with the required fields', () => {
      expect(SAMPLE_SAVINGS_GOALS).toHaveLength(3)

      SAMPLE_SAVINGS_GOALS.forEach(goal => {
        expect(goal).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            category: expect.any(String),
            targetAmount: expect.any(Number),
            currentAmount: expect.any(Number),
            targetDate: expect.any(String),
            createdAt: expect.any(String),
          })
        )
      })
    })
  })
})
