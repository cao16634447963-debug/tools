import { useState } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Popconfirm,
  Space,
  Typography,
  Tag,
  message,
} from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  type TransactionInput,
} from '../api/transactions'
import { getAccounts } from '../api/accounts'
import { getCategories } from '../api/categories'
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
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [form] = Form.useForm()
  const [filters, setFilters] = useState<Filters>({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', filters, page, pageSize],
    queryFn: () => getTransactions({ ...filters, page, size: pageSize }),
  })

  const { data: accounts = [] } = useQuery({ queryKey: ['accounts'], queryFn: getAccounts })
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  })

  const saveMut = useMutation({
    mutationFn: (vals: TransactionInput & { date: Dayjs }) => {
      const payload: TransactionInput = {
        ...vals,
        date: (vals.date as Dayjs).format('YYYY-MM-DD'),
      }
      return editing ? updateTransaction(editing.id, payload) : createTransaction(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['accounts'] })
      setOpen(false)
      message.success('保存成功')
    },
  })

  const delMut = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['accounts'] })
    },
  })

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({ type: 'expense', date: dayjs() })
    setOpen(true)
  }

  const openEdit = (r: Transaction) => {
    setEditing(r)
    form.setFieldsValue({ ...r, date: dayjs(r.date) })
    setOpen(true)
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

  const columns = [
    { title: '日期', dataIndex: 'date', width: 110 },
    { title: '账户', dataIndex: 'accountName', render: (v: string) => v || '-' },
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
          {r.type === 'income' ? '+' : '-'}¥{Number(v).toFixed(2)}
        </span>
      ),
    },
    { title: '备注', dataIndex: 'note', render: (v: string) => v || '-' },
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
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          交易记录
        </Typography.Title>
        <Button type="primary" onClick={openCreate}>
          新增交易
        </Button>
      </div>

      <Form layout="inline" onFinish={applyFilters} style={{ marginBottom: 16, rowGap: 8 }}>
        <Form.Item name="accountId" label="账户">
          <Select
            allowClear
            placeholder="全部"
            style={{ width: 150 }}
            options={accounts.map((a) => ({ value: a.id, label: a.name }))}
          />
        </Form.Item>
        <Form.Item name="categoryId" label="分类">
          <Select
            allowClear
            placeholder="全部"
            style={{ width: 130 }}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
        </Form.Item>
        <Form.Item name="type" label="类型">
          <Select
            allowClear
            placeholder="全部"
            style={{ width: 110 }}
            options={[
              { value: 'income', label: '收入' },
              { value: 'expense', label: '支出' },
            ]}
          />
        </Form.Item>
        <Form.Item name="range" label="日期">
          <DatePicker.RangePicker />
        </Form.Item>
        <Form.Item name="keyword" label="关键词">
          <Input allowClear placeholder="备注搜索" style={{ width: 150 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            搜索
          </Button>
        </Form.Item>
      </Form>

      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data?.content || []}
        columns={columns}
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

      <Modal
        title={editing ? '编辑交易' : '新增交易'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saveMut.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={(v) => saveMut.mutate(v)}>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'expense', label: '支出' },
                { value: 'income', label: '收入' },
              ]}
            />
          </Form.Item>
          <Form.Item name="accountId" label="账户" rules={[{ required: true, message: '请选择账户' }]}>
            <Select options={accounts.map((a) => ({ value: a.id, label: a.name }))} />
          </Form.Item>
          <Form.Item name="categoryId" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select options={categories.map((c) => ({ value: c.id, label: c.name }))} />
          </Form.Item>
          <Form.Item name="amount" label="金额" rules={[{ required: true, message: '请输入金额' }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} prefix="¥" />
          </Form.Item>
          <Form.Item name="date" label="日期" rules={[{ required: true, message: '请选择日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="note" label="备注">
            <Input placeholder="可选" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
