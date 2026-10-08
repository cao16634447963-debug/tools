import { useState } from 'react'
import { Card, DatePicker, Statistic, Typography, Row, Col, Progress, Space } from 'antd'
import { TrophyOutlined } from '@ant-design/icons'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import dayjs from 'dayjs'
import { useQuery } from '@tanstack/react-query'
import { getMonthlyStat, getCategoryStat, getTrend } from '../api/stats'
import { formatMoney } from '../lib/format'
import type { CategoryStat } from '../types'

const COLORS = ['#ff7875', '#40a9ff', '#9254de', '#52c41a', '#faad14', '#13c2c2']

/** 排名徽标颜色：前三名突出显示 */
const RANK_COLORS = ['#f5a623', '#bfbfbf', '#d48806']

export default function StatsPage() {
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'))
  const startOfMonth = dayjs(month).startOf('month').format('YYYY-MM-DD')
  const endOfMonth = dayjs(month).endOf('month').format('YYYY-MM-DD')

  const monthlyQ = useQuery({
    queryKey: ['stats-monthly', month],
    queryFn: () => getMonthlyStat(month),
  })
  const catQ = useQuery({
    queryKey: ['stats-category', startOfMonth, endOfMonth],
    queryFn: () => getCategoryStat(startOfMonth, endOfMonth),
  })
  const trendQ = useQuery({
    queryKey: ['stats-trend'],
    queryFn: () => getTrend(6),
  })

  const monthly = monthlyQ.data
  const cat = catQ.data || []
  const trend = trendQ.data || []

  // 支出排行：按金额降序，以最大值为进度基准
  const ranked = [...cat].sort((a, b) => b.amount - a.amount)
  const maxAmount = ranked[0]?.amount || 0
  const totalExpense = ranked.reduce((sum, c: CategoryStat) => sum + c.amount, 0)

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>
          统计报表
        </Typography.Title>
        <DatePicker
          picker="month"
          value={dayjs(month)}
          onChange={(d) => setMonth((d || dayjs()).format('YYYY-MM'))}
        />
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title={`${month} 总收入`}
              value={monthly?.income || 0}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="总支出"
              value={monthly?.expense || 0}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="结余" value={monthly?.balance || 0} precision={2} prefix="¥" />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="分类支出占比">
            {cat.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>本月暂无支出数据</div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={cat}
                    dataKey="amount"
                    nameKey="categoryName"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {cat.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `¥${formatMoney(Number(v))}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="支出排行"
            extra={
              <Space>
                <TrophyOutlined style={{ color: '#f5a623' }} />
                <Typography.Text type="secondary">
                  合计 ¥{formatMoney(totalExpense)}
                </Typography.Text>
              </Space>
            }
          >
            {ranked.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>本月暂无支出数据</div>
            ) : (
              ranked.map((c: CategoryStat, i: number) => {
                const pct =
                  maxAmount > 0 ? Math.round((c.amount / maxAmount) * 100) : 0
                const share =
                  totalExpense > 0 ? ((c.amount / totalExpense) * 100).toFixed(1) : '0.0'
                return (
                  <div key={c.categoryId} style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 4,
                      }}
                    >
                      <Space>
                        <span
                          style={{
                            display: 'inline-block',
                            width: 22,
                            height: 22,
                            lineHeight: '22px',
                            borderRadius: '50%',
                            textAlign: 'center',
                            fontSize: 12,
                            color: i < 3 ? '#fff' : '#999',
                            background: i < 3 ? RANK_COLORS[i] : 'transparent',
                            border: i < 3 ? 'none' : '1px solid #d9d9d9',
                          }}
                        >
                          {i + 1}
                        </span>
                        <span>{c.categoryName}</span>
                      </Space>
                      <span style={{ color: '#999' }}>
                        ¥{formatMoney(c.amount)}（{share}%）
                      </span>
                    </div>
                    <Progress
                      percent={pct}
                      showInfo={false}
                      strokeColor={COLORS[i % COLORS.length]}
                    />
                  </div>
                )
              })
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Card title="近 6 个月收支趋势">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trend}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v) => `¥${formatMoney(Number(v))}`} />
                <Legend />
                <Bar dataKey="income" name="收入" fill="#cf1322" />
                <Bar dataKey="expense" name="支出" fill="#3f8600" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
