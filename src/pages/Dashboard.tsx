import { useQuery } from '@tanstack/react-query'
import {
  Card,
  Col,
  Row,
  Statistic,
  Typography,
  List,
  Tag,
  Alert,
  Progress,
  Space,
  Skeleton,
} from 'antd'
import {
  WalletOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  AuditOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { getAccounts } from '../api/accounts'
import { getMonthlyStat } from '../api/stats'
import { getBudgets } from '../api/budgets'
import { getTransactions } from '../api/transactions'
import { getCategories } from '../api/categories'
import { formatMoney } from '../lib/format'
import type { Account, Budget, Category, Transaction } from '../types'

const ACCOUNT_TYPE_LABELS: Record<NonNullable<Account['type']>, string> = {
  cash: '现金',
  bank: '银行卡',
  credit: '信用卡',
  other: '其他',
}

/** 根据当前时间返回问候语 */
const greeting = () => {
  const h = dayjs().hour()
  if (h < 6) return '夜深了'
  if (h < 12) return '早上好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
}

/**
 * 总览页：当前财务状态快照（资产、本月收支、预算执行、最近动态）
 * 深度图表分析见「统计报表」页
 */
const DashboardPage = () => {
  const month = dayjs().format('YYYY-MM')

  const accountsQ = useQuery({ queryKey: ['accounts'], queryFn: getAccounts })
  const monthlyQ = useQuery({
    queryKey: ['stats-monthly', month],
    queryFn: () => getMonthlyStat(month),
  })
  const budgetsQ = useQuery({
    queryKey: ['budgets', month],
    queryFn: () => getBudgets(month),
  })
  const recentQ = useQuery({
    queryKey: ['transactions', { page: 1, size: 5 }],
    queryFn: () => getTransactions({ page: 1, size: 5 }),
  })
  const categoriesQ = useQuery({ queryKey: ['categories'], queryFn: () => getCategories() })

  const accounts = accountsQ.data || []
  const monthly = monthlyQ.data
  const budgets = budgetsQ.data || []
  const categories = categoriesQ.data || []
  const recent = recentQ.data?.content || []

  // 总资产 = 各账户余额之和
  const totalAssets = accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0)

  // 预算提醒：超支 与 接近超支（>=80%）
  const catNameOf = (id: number | null) =>
    id == null ? '总预算' : categories.find((c: Category) => c.id === id)?.name || '分类'
  const overBudgets = budgets.filter((b: Budget) => (b.spent || 0) >= b.amount && b.amount > 0)
  const nearBudgets = budgets.filter(
    (b: Budget) =>
      b.amount > 0 && (b.spent || 0) < b.amount && (b.spent || 0) / b.amount >= 0.8,
  )

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {greeting()}，今天是 {dayjs().format('YYYY年MM月DD日')}
        </Typography.Title>
        <Typography.Text type="secondary">这里是你的财务概览</Typography.Text>
      </div>

      {/* 预算提醒 */}
      {overBudgets.length > 0 && (
        <Alert
          style={{ marginBottom: 12 }}
          type="error"
          showIcon
          message={`已超支：${overBudgets
            .map((b: Budget) => `${catNameOf(b.categoryId)}（超 ¥${formatMoney(Number(b.spent) - Number(b.amount))}）`)
            .join('、')}`}
        />
      )}
      {nearBudgets.length > 0 && (
        <Alert
          style={{ marginBottom: 12 }}
          type="warning"
          showIcon
          message={`接近预算上限：${nearBudgets
            .map(
              (b: Budget) =>
                `${catNameOf(b.categoryId)}（已用 ${Math.round(((b.spent || 0) / b.amount) * 100)}%）`,
            )
            .join('、')}`}
        />
      )}

      {/* 概览统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总资产"
              value={accountsQ.isLoading ? 0 : totalAssets}
              precision={2}
              prefix={<WalletOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="本月收入"
              value={monthly?.income || 0}
              precision={2}
              prefix={<ArrowUpOutlined />}
              suffix="元"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="本月支出"
              value={monthly?.expense || 0}
              precision={2}
              prefix={<ArrowDownOutlined />}
              suffix="元"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="本月结余"
              value={monthly?.balance ?? 0}
              precision={2}
              prefix={<AuditOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
      </Row>

      {/* 账户余额分布 + 最近交易 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={8}>
          <Card
            title="账户余额"
            extra={<Typography.Text type="secondary">共 {accounts.length} 个</Typography.Text>}
          >
            <List
              loading={accountsQ.isLoading}
              dataSource={accounts}
              locale={{ emptyText: '暂无账户' }}
              renderItem={(a: Account) => (
                <List.Item>
                  <Space>
                    <WalletOutlined />
                    <span>{a.name}</span>
                    {a.type && <Tag>{ACCOUNT_TYPE_LABELS[a.type] || a.type}</Tag>}
                  </Space>
                  <span style={{ fontWeight: 600 }}>¥{formatMoney(a.balance)}</span>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="最近交易">
            <List
              loading={recentQ.isLoading}
              dataSource={recent}
              locale={{ emptyText: '暂无交易记录' }}
              renderItem={(t: Transaction) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <span>{t.categoryName || '未分类'}</span>
                        {t.type === 'income' ? (
                          <Tag color="red">收入</Tag>
                        ) : (
                          <Tag color="green">支出</Tag>
                        )}
                      </Space>
                    }
                    description={`${t.date} · ${t.accountName || '-'}${t.note ? ` · ${t.note}` : ''}`}
                  />
                  <span
                    style={{
                      fontWeight: 600,
                      color: t.type === 'income' ? '#cf1322' : '#3f8600',
                    }}
                  >
                    {t.type === 'income' ? '+' : '-'}¥{formatMoney(t.amount)}
                  </span>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 预算执行情况 */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="本月预算使用情况">
            {budgetsQ.isLoading ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : budgets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                本月暂无预算，可前往「预算管理」设置
              </div>
            ) : (
              budgets.map((b: Budget) => {
                const pct =
                  b.amount > 0 ? Math.min(100, Math.round(((b.spent || 0) / b.amount) * 100)) : 0
                return (
                  <div key={b.id} style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 4,
                      }}
                    >
                      <span>{catNameOf(b.categoryId)}</span>
                      <span style={{ color: '#999' }}>
                        ¥{formatMoney(b.spent || 0)} / ¥{formatMoney(b.amount)}
                      </span>
                    </div>
                    <Progress percent={pct} status={pct >= 100 ? 'exception' : 'active'} />
                  </div>
                )
              })
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default DashboardPage
