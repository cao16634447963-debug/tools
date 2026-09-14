import { useState } from 'react'
import {
  Card,
  Button,
  Modal,
  Form,
  Select,
  InputNumber,
  DatePicker,
  Progress,
  Popconfirm,
  Space,
  Typography,
  Empty,
  message,
} from 'antd'
import { Row, Col } from 'antd'
import dayjs from 'dayjs'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBudgets, upsertBudget, deleteBudget, type BudgetInput } from '../api/budgets'
import { getCategories } from '../api/categories'
import type { Budget, Category } from '../types'

export default function BudgetsPage() {
  const qc = useQueryClient()
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'))
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Budget | null>(null)
  const [form] = Form.useForm()

  const { data = [], isLoading } = useQuery({
    queryKey: ['budgets', month],
    queryFn: () => getBudgets(month),
  })
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  })

  const upsertMut = useMutation({
    mutationFn: (vals: BudgetInput) => upsertBudget(vals),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets', month] })
      setOpen(false)
      message.success('已保存')
    },
  })
  const delMut = useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets', month] }),
  })

  const nameOf = (b: Budget) => {
    if (b.categoryId == null) return '总预算'
    return categories.find((c: Category) => c.id === b.categoryId)?.name || '分类'
  }

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({ month: dayjs(month), categoryId: 0 })
    setOpen(true)
  }

  const openEdit = (b: Budget) => {
    setEditing(b)
    form.setFieldsValue({ ...b, month: dayjs(b.month), categoryId: b.categoryId ?? 0 })
    setOpen(true)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          预算管理
        </Typography.Title>
        <Space>
          <DatePicker
            picker="month"
            value={dayjs(month)}
            onChange={(d) => setMonth(d.format('YYYY-MM'))}
          />
          <Button type="primary" onClick={openCreate}>
            设置预算
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {data.map((b) => {
          const pct =
            b.amount > 0 ? Math.min(100, Math.round(((b.spent || 0) / b.amount) * 100)) : 0
          return (
            <Col xs={24} sm={12} lg={8} key={b.id}>
              <Card
                title={nameOf(b)}
                extra={
                  <Space>
                    <a onClick={() => openEdit(b)}>编辑</a>
                    <Popconfirm title="确定删除该预算？" onConfirm={() => delMut.mutate(b.id)}>
                      <a>删除</a>
                    </Popconfirm>
                  </Space>
                }
              >
                <p>预算金额：¥{Number(b.amount).toFixed(2)}</p>
                <p>已花费：¥{Number(b.spent || 0).toFixed(2)}</p>
                <Progress percent={pct} status={pct >= 100 ? 'exception' : 'active'} />
              </Card>
            </Col>
          )
        })}
        {data.length === 0 && (
          <Col span={24}>
            <Empty description="本月暂无预算，点击右上角设置" />
          </Col>
        )}
      </Row>

      <Modal
        title={editing ? '编辑预算' : '设置预算'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={upsertMut.isPending}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(v) =>
            upsertMut.mutate({
              month: dayjs(v.month).format('YYYY-MM'),
              categoryId: v.categoryId ? Number(v.categoryId) : null,
              amount: v.amount,
            })
          }
        >
          <Form.Item name="month" label="月份" rules={[{ required: true }]}>
            <DatePicker picker="month" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="categoryId" label="预算范围" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 0, label: '总预算' },
                ...categories.map((c: Category) => ({ value: c.id, label: c.name })),
              ]}
            />
          </Form.Item>
          <Form.Item name="amount" label="预算金额" rules={[{ required: true, message: '请输入预算金额' }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} prefix="¥" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
