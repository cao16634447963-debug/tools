import request from '../lib/request'
import { USE_MOCK, mockMonthly, mockCategoryStat, mockTrend, delay } from './mock'
import type { CategoryStat, MonthlyStat } from '../types'

export async function getMonthlyStat(month: string): Promise<MonthlyStat> {
  if (USE_MOCK) {
    await delay()
    return mockMonthly
  }
  return request.get('/stats/monthly', { params: { month } })
}

export async function getCategoryStat(
  startDate: string,
  endDate: string,
): Promise<CategoryStat[]> {
  if (USE_MOCK) {
    await delay()
    return mockCategoryStat
  }
  return request.get('/stats/category', { params: { startDate, endDate } })
}

export async function getTrend(months = 6): Promise<MonthlyStat[]> {
  if (USE_MOCK) {
    await delay()
    return mockTrend
  }
  return request.get('/stats/trend', { params: { months } })
}
