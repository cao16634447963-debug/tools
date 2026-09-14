import type {
  Account,
  Budget,
  Category,
  CategoryStat,
  MonthlyStat,
  Transaction,
  User,
} from '../types'

// 是否启用本地 Mock 数据（无后端时演示用）
// 在项目根目录 .env 中设置 VITE_USE_MOCK=true 开启
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/** 模拟网络延迟 */
export const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

export const mockUser: User = {
  id: 1,
  username: 'demo',
  email: 'demo@pocket.local',
}

export const mockAccounts: Account[] = [
  { id: 1, userId: 1, name: '招商银行储蓄卡', type: 'bank', balance: 12860.5, remark: '工资卡' },
  { id: 2, userId: 1, name: '支付宝', type: 'cash', balance: 3520.0 },
  { id: 3, userId: 1, name: '微信钱包', type: 'cash', balance: 880.0 },
]

export const mockCategories: Category[] = [
  { id: 1, userId: 1, name: '餐饮', type: 'expense', icon: 'rest', color: '#ff7875' },
  { id: 2, userId: 1, name: '交通', type: 'expense', icon: 'car', color: '#40a9ff' },
  { id: 3, userId: 1, name: '购物', type: 'expense', icon: 'shopping', color: '#9254de' },
  { id: 4, userId: 1, name: '工资', type: 'income', icon: 'money', color: '#52c41a' },
  { id: 5, userId: 1, name: '兼职', type: 'income', icon: 'laptop', color: '#13c2c2' },
]

export const mockTransactions: Transaction[] = [
  { id: 1, userId: 1, accountId: 1, categoryId: 4, type: 'income', amount: 12000, date: '2026-08-10', note: '八月工资', accountName: '招商银行储蓄卡', categoryName: '工资' },
  { id: 2, userId: 1, accountId: 1, categoryId: 1, type: 'expense', amount: 68.5, date: '2026-08-12', note: '午餐', accountName: '招商银行储蓄卡', categoryName: '餐饮' },
  { id: 3, userId: 1, accountId: 2, categoryId: 3, type: 'expense', amount: 299, date: '2026-08-14', note: '日用品', accountName: '支付宝', categoryName: '购物' },
  { id: 4, userId: 1, accountId: 3, categoryId: 2, type: 'expense', amount: 15, date: '2026-08-15', note: '地铁', accountName: '微信钱包', categoryName: '交通' },
  { id: 5, userId: 1, accountId: 1, categoryId: 5, type: 'income', amount: 1500, date: '2026-08-18', note: '周末兼职', accountName: '招商银行储蓄卡', categoryName: '兼职' },
]

export const mockBudgets: Budget[] = [
  { id: 1, userId: 1, month: '2026-08', categoryId: null, amount: 6000, spent: 382.5 },
  { id: 2, userId: 1, month: '2026-08', categoryId: 1, amount: 1500, spent: 68.5 },
]

export const mockMonthly: MonthlyStat = {
  month: '2026-08',
  income: 13500,
  expense: 382.5,
  balance: 13117.5,
}

export const mockCategoryStat: CategoryStat[] = [
  { categoryId: 1, categoryName: '餐饮', amount: 68.5 },
  { categoryId: 3, categoryName: '购物', amount: 299 },
  { categoryId: 2, categoryName: '交通', amount: 15 },
]

export const mockTrend: MonthlyStat[] = [
  { month: '2026-03', income: 12000, expense: 4200, balance: 7800 },
  { month: '2026-04', income: 12000, expense: 5100, balance: 6900 },
  { month: '2026-05', income: 12000, expense: 3800, balance: 8200 },
  { month: '2026-06', income: 12500, expense: 4600, balance: 7900 },
  { month: '2026-07', income: 12000, expense: 4000, balance: 8000 },
  { month: '2026-08', income: 13500, expense: 382.5, balance: 13117.5 },
]
