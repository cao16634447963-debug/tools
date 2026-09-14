import request from '../lib/request'
import { USE_MOCK, mockAccounts, delay } from './mock'
import type { Account } from '../types'

export type AccountInput = Pick<Account, 'name' | 'type' | 'balance' | 'remark'>

export async function getAccounts(): Promise<Account[]> {
  if (USE_MOCK) {
    await delay()
    return mockAccounts.map((a) => ({ ...a }))
  }
  return request.get('/accounts')
}

export async function createAccount(data: AccountInput): Promise<Account> {
  if (USE_MOCK) {
    await delay()
    const next: Account = { id: Date.now(), userId: 1, ...data }
    mockAccounts.push(next)
    return next
  }
  return request.post('/accounts', data)
}

export async function updateAccount(
  id: number,
  data: Partial<AccountInput>,
): Promise<Account> {
  if (USE_MOCK) {
    await delay()
    const i = mockAccounts.findIndex((a) => a.id === id)
    if (i >= 0) mockAccounts[i] = { ...mockAccounts[i], ...data }
    return mockAccounts[i]
  }
  return request.put(`/accounts/${id}`, data)
}

export async function deleteAccount(id: number): Promise<void> {
  if (USE_MOCK) {
    await delay()
    const i = mockAccounts.findIndex((a) => a.id === id)
    if (i >= 0) mockAccounts.splice(i, 1)
    return
  }
  return request.delete(`/accounts/${id}`)
}
