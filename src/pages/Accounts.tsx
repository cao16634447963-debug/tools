import { useState } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Popconfirm,
  Space,
  Typography,
  message,
} from 'antd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  type AccountInput,
} from '../api/accounts'
import type { Account } from '../types'

const TYPE_LABEL: Record<string, string> = {
  cash: '现金',
  bank: '银行卡',
  credit: '信用卡',
  other: '其他',
}

export default function AccountsPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Account | null>(null)
  const [form] = Form.useForm()

  const { data = [], isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: getAccounts,
  })

  const saveMut = useMutation({
    mutationFn: (vals: AccountInput) =>
      editing ? updateAccount(editing.id, vals) : createAccount(vals),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] })
      setOpen(false)
      message.success('保存成功')
    },
  })

  const delMut = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  })

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({ type: 'bank', balance: 0 })
    setOpen(true)
  }

  const openEdit = (r: Account) => {
    setEditing(r)
    form.setFieldsValue(r)
    setOpen(true)
  }

  const columns = [
    { title: '名称', dataIndex: 'name' },
    {
      title: '类型',
      dataIndex: 'type',
      render: (t: string) => TYPE_LABEL[t] || t,
    },
    {
      title: '余额',
      dataIndex: 'balance',
      render: (v: number) => `¥${Number(v).toFixed(2)}`,
    },
    { title: '备注', dataIndex: 'remark', render: (v: string) => v || '-' },
    {
      title: '操作',
      render: (_: unknown, r: Account) => (
        <Space>
          <a onClick={() => openEdit(r)}>编辑</a>
          <Popconfirm title="确定删除该账户？" onConfirm={() => delMut.mutate(r.id)}>
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
          账户管理
        </Typography.Title>
        <Button type="primary" onClick={openCreate}>
          新增账户
        </Button>
      </div>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data}
        columns={columns}
        pagination={false}
      />
      <Modal
        title={editing ? '编辑账户' : '新增账户'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saveMut.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={(v) => saveMut.mutate(v)}>
          <Form.Item name="name" label="账户名称" rules={[{ required: true, message: '请输入账户名称' }]}>
            <Input placeholder="如：招商银行储蓄卡" />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'bank', label: '银行卡' },
                { value: 'cash', label: '现金' },
                { value: 'credit', label: '信用卡' },
                { value: 'other', label: '其他' },
              ]}
            />
          </Form.Item>
          <Form.Item name="balance" label="初始余额" rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} prefix="¥" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input placeholder="可选" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
