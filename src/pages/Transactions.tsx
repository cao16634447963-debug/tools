import { useState } from 'react'
import {
  Table,
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  Popconfirm,
  Space,
  Typography,
  Tag,
  message,
  Grid,
} from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTransactions, deleteTransaction } from '../api/transactions'
import { getAccounts } from '../api/accounts'
import { getCategories } from '../api/categories'
import { formatMoney } from '../lib/format'
import { downloadCsv } from '../lib/csv'
import TransactionFormModal from '../components/TransactionFormModal'
import type { Transaction, TransactionType } from '../types'

interface Filters {
  accountId?: number
  categoryId?: number
  type?: TransactionType
  startDate?: string
  endDate?: string
  keyword?: string
}

export default function TransactionsPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [exporting, setExporting] = useState(false)
  const [filters, setFilters] = useState<Filters>({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // 小屏（<768px）适配：筛选表单纵向布局、表格隐藏次要列
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', filters, page, pageSize],
    queryFn: () => getTransactions({ ...filters, page, size: pageSize }),
  })

  const { data: accounts = [] } = useQuery({ queryKey: ['accounts'], queryFn: getAccounts })
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  })

  const delMut = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['accounts'] })
      qc.invalidateQueries({ queryKey: ['budgets'] })
    },
  })

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (r: Transaction) => {
    setEditing(r)
    setModalOpen(true)
  }

  const applyFilters = (values: Filters & { range?: [Dayjs, Dayjs] | null }) => {
    const { range, ...rest } = values
    const next: Filters = { ...rest }
    if (range && range[0] && range[1]) {
      next.startDate = range[0].format('YYYY-MM-DD')
      next.endDate = range[1].format('YYYY-MM-DD')
    }
    setFilters(next)
    setPage(1)
  }

  // 按当前筛选条件导出全部记录为 CSV
  const exportCsv = async () => {
    try {
      setExporting(true)
      const res = await getTransactions({ ...filters, page: 1, size: 10000 })
      downloadCsv(
        `交易记录_${dayjs().format('YYYYMMDD_HHmmss')}`,
        ['日期', '账户', '分类', '类型', '金额', '备注'],
        res.content.map((t) => [
          t.date,
          t.accountName || '',
          t.categoryName || '',
          t.type === 'income' ? '收入' : '支出',
          Number(t.amount).toFixed(2),
          t.note || '',
        ]),
      )
      message.success(`已导出 ${res.content.length} 条记录`)
    } finally {
      setExporting(false)
    }
  }

  const columns = [
    { title: '日期', dataIndex: 'date', width: 110 },
    // 小屏隐藏「账户」「备注」次要列，保留核心信息
    ...(isMobile
      ? []
      : [{ title: '账户', dataIndex: 'accountName', render: (v: string) => v || '-' }]),
    { title: '分类', dataIndex: 'categoryName', render: (v: string) => v || '-' },
    {
      title: '类型',
      dataIndex: 'type',
      render: (t: TransactionType) =>
        t === 'income' ? <Tag color="red">收入</Tag> : <Tag color="green">支出</Tag>,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      render: (v: number, r: Transaction) => (
        <span style={{ color: r.type === 'income' ? '#cf1322' : '#3f8600', fontWeight: 600 }}>
          {r.type === 'income' ? '+' : '-'}¥{formatMoney(v)}
        </span>
      ),
    },
    ...(isMobile ? [] : [{ title: '备注', dataIndex: 'note', render: (v: string) => v || '-' }]),
    {
      title: '操作',
      width: 120,
      render: (_: unknown, r: Transaction) => (
        <Space>
          <a onClick={() => openEdit(r)}>编辑</a>
          <Popconfirm title="确定删除该记录？" onConfirm={() => delMut.mutate(r.id)}>
            <a>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ]

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
          交易记录
        </Typography.Title>
        <Space>
          <Button icon={<DownloadOutlined />} loading={exporting} onClick={exportCsv}>
            导出 CSV
          </Button>
          <Button type="primary" onClick={openCreate}>
            新增交易
          </Button>
        </Space>
      </div>

      <Form
        layout={isMobile ? 'vertical' : 'inline'}
        onFinish={applyFilters}
        style={{ marginBottom: 16, rowGap: 8 }}
      >
        <Form.Item name="accountId" label="账户">
          <Select
            allowClear
            placeholder="全部"
            style={{ width: isMobile ? '100%' : 150 }}
            options={accounts.map((a) => ({ value: a.id, label: a.name }))}
          />
        </Form.Item>
        <Form.Item name="categoryId" label="分类">
          <Select
            allowClear
            placeholder="全部"
            style={{ width: isMobile ? '100%' : 130 }}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
        </Form.Item>
        <Form.Item name="type" label="类型">
          <Select
            allowClear
            placeholder="全部"
            style={{ width: isMobile ? '100%' : 110 }}
            options={[
              { value: 'income', label: '收入' },
              { value: 'expense', label: '支出' },
            ]}
          />
        </Form.Item>
        <Form.Item name="range" label="日期">
          <DatePicker.RangePicker style={{ width: isMobile ? '100%' : undefined }} />
        </Form.Item>
        <Form.Item name="keyword" label="关键词">
          <Input
            allowClear
            placeholder="备注搜索"
            style={{ width: isMobile ? '100%' : 150 }}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: isMobile ? '100%' : undefined }}>
            搜索
          </Button>
        </Form.Item>
      </Form>

      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data?.content || []}
        columns={columns}
        scroll={{ x: isMobile ? 480 : 720 }}
        pagination={{
          current: page,
          pageSize,
          total: data?.total || 0,
          showSizeChanger: true,
          onChange: (p, ps) => {
            setPage(p)
            setPageSize(ps)
          },
        }}
      />

      <TransactionFormModal
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}
