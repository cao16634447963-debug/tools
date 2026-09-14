// PocketLedger 领域模型类型定义
// 字段与后端实体（User / Account / Category / Transaction / Budget）对应

export type TransactionType = 'income' | 'expense'

/** 用户 */
export interface User {
  id: number
  username: string
  email?: string
  createdAt?: string
}

/** 账户（银行卡/现金/信用等） */
export interface Account {
  id: number
  userId: number
  name: string
  type?: 'cash' | 'bank' | 'credit' | 'other'
  balance: number
  remark?: string
  createdAt?: string
}

/** 收支分类 */
export interface Category {
  id: number
  userId: number
  name: string
  type: TransactionType
  icon?: string
  color?: string
}

/** 交易记录 */
export interface Transaction {
  id: number
  userId: number
  accountId: number
  categoryId: number
  type: TransactionType
  amount: number
  /** yyyy-MM-dd */
  date: string
  note?: string
  // 下列字段为列表展示时的冗余字段（后端 join 返回）
  accountName?: string
  categoryName?: string
}

/** 预算（categoryId 为 null 表示总预算） */
export interface Budget {
  id: number
  userId: number
  /** yyyy-MM */
  month: string
  categoryId: number | null
  amount: number
  spent?: number
}

/** 登录/注册返回 */
export interface AuthResult {
  token: string
  user: User
}

/** 月度收支汇总 */
export interface MonthlyStat {
  month: string
  income: number
  expense: number
  balance: number
}

/** 分类支出占比 */
export interface CategoryStat {
  categoryId: number
  categoryName: string
  amount: number
}

/** 交易分页查询参数 */
export interface TransactionQuery {
  page?: number
  size?: number
  accountId?: number
  categoryId?: number
  type?: TransactionType
  startDate?: string
  endDate?: string
  keyword?: string
}
