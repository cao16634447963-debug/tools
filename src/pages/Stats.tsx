import { useState } from 'react'
import { Card, DatePicker, Statistic, Typography, Row, Col } from 'antd'
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

const COLORS = ['#ff7875', '#40a9ff', '#9254de', '#52c41a', '#faad14', '#13c2c2']

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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          统计报表
        </Typography.Title>
        <DatePicker
          picker="month"
          value={dayjs(month)}
          onChange={(d) => setMonth(d.format('YYYY-MM'))}
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

      <Row gutter={16}>
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
                  <Tooltip formatter={(v: number) => `¥${Number(v).toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="近 6 个月收支趋势">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={trend}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v: number) => `¥${Number(v).toFixed(2)}`} />
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
