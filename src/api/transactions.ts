import request from '../lib/request'
import { USE_MOCK, mockTransactions, mockAccounts, mockCategories, delay } from './mock'
import type { Transaction, TransactionQuery } from '../types'

export interface PageResult<T> {
  content: T[]
  total: number
  page: number
  size: number
}

export type TransactionInput = Pick<
  Transaction,
  'accountId' | 'categoryId' | 'type' | 'amount' | 'date' | 'note'
>

export async function getTransactions(
  query: TransactionQuery = {},
): Promise<PageResult<Transaction>> {
  const { page = 1, size = 10, accountId, categoryId, type, startDate, endDate, keyword } = query
  if (USE_MOCK) {
    await delay()
    let list = mockTransactions.map((t) => ({ ...t }))
    if (accountId) list = list.filter((t) => t.accountId === accountId)
    if (categoryId) list = list.filter((t) => t.categoryId === categoryId)
    if (type) list = list.filter((t) => t.type === type)
    if (startDate) list = list.filter((t) => t.date >= startDate)
    if (endDate) list = list.filter((t) => t.date <= endDate)
    if (keyword) list = list.filter((t) => (t.note || '').includes(keyword))
    const total = list.length
    const start = (page - 1) * size
    return { content: list.slice(start, start + size), total, page, size }
  }
  return request.get('/transactions', { params: query })
}

export async function createTransaction(data: TransactionInput): Promise<Transaction> {
  if (USE_MOCK) {
    await delay()
    const cat = mockCategories.find((c) => c.id === data.categoryId)
    const acc = mockAccounts.find((a) => a.id === data.accountId)
    const next: Transaction = {
      id: Date.now(),
      userId: 1,
      accountName: acc?.name,
      categoryName: cat?.name,
      ...data,
    }
    mockTransactions.unshift(next)
    return next
  }
  return request.post('/transactions', data)
}

export async function updateTransaction(
  id: number,
  data: Partial<TransactionInput>,
): Promise<Transaction> {
  if (USE_MOCK) {
    await delay()
    const i = mockTransactions.findIndex((t) => t.id === id)
    if (i >= 0) mockTransactions[i] = { ...mockTransactions[i], ...data }
    return mockTransactions[i]
  }
  return request.put(`/transactions/${id}`, data)
}

export async function deleteTransaction(id: number): Promise<void> {
  if (USE_MOCK) {
    await delay()
    const i = mockTransactions.findIndex((t) => t.id === id)
    if (i >= 0) mockTransactions.splice(i, 1)
    return
  }
  return request.delete(`/transactions/${id}`)
}
