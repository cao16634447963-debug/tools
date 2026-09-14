import request from '../lib/request'
import { USE_MOCK, mockBudgets, delay } from './mock'
import type { Budget } from '../types'

export type BudgetInput = Pick<Budget, 'month' | 'categoryId' | 'amount'>

export async function getBudgets(month: string): Promise<Budget[]> {
  if (USE_MOCK) {
    await delay()
    return mockBudgets.filter((b) => b.month === month).map((b) => ({ ...b }))
  }
  return request.get('/budgets', { params: { month } })
}

export async function upsertBudget(data: BudgetInput): Promise<Budget> {
  if (USE_MOCK) {
    await delay()
    const i = mockBudgets.findIndex(
      (b) => b.month === data.month && b.categoryId === data.categoryId,
    )
    if (i >= 0) {
      mockBudgets[i] = { ...mockBudgets[i], amount: data.amount }
      return mockBudgets[i]
    }
    const next: Budget = { id: Date.now(), userId: 1, spent: 0, ...data }
    mockBudgets.push(next)
    return next
  }
  return request.post('/budgets', data)
}

export async function deleteBudget(id: number): Promise<void> {
  if (USE_MOCK) {
    await delay()
    const i = mockBudgets.findIndex((b) => b.id === id)
    if (i >= 0) mockBudgets.splice(i, 1)
    return
  }
  return request.delete(`/budgets/${id}`)
}
