import { useState } from 'react'
import {
  Tabs,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  Space,
  Typography,
  ColorPicker,
  Tag,
  message,
} from 'antd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type CategoryInput,
} from '../api/categories'
import type { Category, TransactionType } from '../types'

const ICON_OPTIONS = [
  { value: 'rest', label: '餐饮 🍜' },
  { value: 'car', label: '交通 🚗' },
  { value: 'shopping', label: '购物 🛍️' },
  { value: 'money', label: '工资 💰' },
  { value: 'laptop', label: '工作 💻' },
  { value: 'fun', label: '娱乐 🎮' },
]

export default function CategoriesPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<TransactionType>('expense')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form] = Form.useForm()

  const { data = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  })
  const list = data.filter((c) => c.type === tab)

  const saveMut = useMutation({
    mutationFn: (vals: CategoryInput) =>
      editing ? updateCategory(editing.id, vals) : createCategory(vals),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      setOpen(false)
      message.success('保存成功')
    },
  })

  const delMut = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({ type: tab })
    setOpen(true)
  }

  const openEdit = (r: Category) => {
    setEditing(r)
    form.setFieldsValue(r)
    setOpen(true)
  }

  const columns = [
    { title: '名称', dataIndex: 'name' },
    {
      title: '颜色',
      dataIndex: 'color',
      render: (c: string) => (c ? <Tag color={c}>{c}</Tag> : '-'),
    },
    {
      title: '图标',
      dataIndex: 'icon',
      render: (i: string) => ICON_OPTIONS.find((o) => o.value === i)?.label || i || '-',
    },
    {
      title: '操作',
      render: (_: unknown, r: Category) => (
        <Space>
          <a onClick={() => openEdit(r)}>编辑</a>
          <Popconfirm title="确定删除该分类？" onConfirm={() => delMut.mutate(r.id)}>
            <a>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const toHex = (v: unknown) =>
    v && typeof (v as { toHexString?: () => string }).toHexString === 'function'
      ? (v as { toHexString: () => string }).toHexString()
      : (v as string)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          分类管理
        </Typography.Title>
        <Button type="primary" onClick={openCreate}>
          新增分类
        </Button>
      </div>
      <Tabs
        activeKey={tab}
        onChange={(k) => setTab(k as TransactionType)}
        items={[
          {
            key: 'expense',
            label: '支出',
            children: (
              <Table
                rowKey="id"
                loading={isLoading}
                dataSource={list}
                columns={columns}
                pagination={false}
              />
            ),
          },
          {
            key: 'income',
            label: '收入',
            children: (
              <Table
                rowKey="id"
                loading={isLoading}
                dataSource={list}
                columns={columns}
                pagination={false}
              />
            ),
          },
        ]}
      />
      <Modal
        title={editing ? '编辑分类' : '新增分类'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saveMut.isPending}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(v) => saveMut.mutate({ ...v, color: toHex(v.color) })}
        >
          <Form.Item name="name" label="分类名称" rules={[{ required: true, message: '请输入分类名称' }]}>
            <Input placeholder="如：餐饮" />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'expense', label: '支出' },
                { value: 'income', label: '收入' },
              ]}
            />
          </Form.Item>
          <Form.Item name="icon" label="图标">
            <Select options={ICON_OPTIONS} />
          </Form.Item>
          <Form.Item name="color" label="颜色">
            <ColorPicker />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
