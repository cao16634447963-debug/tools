import request from '../lib/request'
import { USE_MOCK, mockCategories, delay } from './mock'
import type { Category, TransactionType } from '../types'

export type CategoryInput = Pick<Category, 'name' | 'type' | 'icon' | 'color'>

export async function getCategories(type?: TransactionType): Promise<Category[]> {
  if (USE_MOCK) {
    await delay()
    const list = mockCategories.map((c) => ({ ...c }))
    return type ? list.filter((c) => c.type === type) : list
  }
  return request.get('/categories', { params: { type } })
}

export async function createCategory(data: CategoryInput): Promise<Category> {
  if (USE_MOCK) {
    await delay()
    const next: Category = { id: Date.now(), userId: 1, ...data }
    mockCategories.push(next)
    return next
  }
  return request.post('/categories', data)
}

export async function updateCategory(
  id: number,
  data: Partial<CategoryInput>,
): Promise<Category> {
  if (USE_MOCK) {
    await delay()
    const i = mockCategories.findIndex((c) => c.id === id)
    if (i >= 0) mockCategories[i] = { ...mockCategories[i], ...data }
    return mockCategories[i]
  }
  return request.put(`/categories/${id}`, data)
}

export async function deleteCategory(id: number): Promise<void> {
  if (USE_MOCK) {
    await delay()
    const i = mockCategories.findIndex((c) => c.id === id)
    if (i >= 0) mockCategories.splice(i, 1)
    return
  }
  return request.delete(`/categories/${id}`)
}
