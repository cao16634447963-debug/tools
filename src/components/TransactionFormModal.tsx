import { useEffect } from 'react'
import { Modal, Form, Input, Select, DatePicker, InputNumber, message } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createTransaction,
  updateTransaction,
  type TransactionInput,
} from '../api/transactions'
import { getAccounts } from '../api/accounts'
import { getCategories } from '../api/categories'
import type { Transaction, TransactionType } from '../types'

interface Props {
  open: boolean
  /** 传入则为编辑模式，null 为新增模式 */
  editing: Transaction | null
  onClose: () => void
}

/** 新增/编辑交易的公共表单弹窗（交易页与快速记账复用） */
const TransactionFormModal = ({ open, editing, onClose }: Props) => {
  const qc = useQueryClient()
  const [form] = Form.useForm()
  const type = Form.useWatch('type', form) as TransactionType | undefined

  const { data: accounts = [] } = useQuery({ queryKey: ['accounts'], queryFn: getAccounts })
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  })

  // 类型联动：分类下拉只显示与当前类型匹配的分类
  const typeCategories = categories.filter((c) => !type || c.type === type)

  const saveMut = useMutation({
    mutationFn: (vals: TransactionInput & { date: Dayjs }) => {
      const payload: TransactionInput = { ...vals, date: vals.date.format('YYYY-MM-DD') }
      return editing ? updateTransaction(editing.id, payload) : createTransaction(payload)
    },
    onSuccess: () => {
      // 交易变动会影响列表、账户余额、预算已用金额和统计数据
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['accounts'] })
      qc.invalidateQueries({ queryKey: ['budgets'] })
      qc.invalidateQueries({ queryKey: ['stats-monthly'] })
      qc.invalidateQueries({ queryKey: ['stats-category'] })
      qc.invalidateQueries({ queryKey: ['stats-trend'] })
      onClose()
      message.success('保存成功')
    },
  })

  // 打开时根据模式填充表单
  useEffect(() => {
    if (!open) return
    if (editing) {
      form.setFieldsValue({ ...editing, date: dayjs(editing.date) })
    } else {
      form.resetFields()
      form.setFieldsValue({ type: 'expense', date: dayjs() })
    }
  }, [open, editing, form])

  return (
    <Modal
      title={editing ? '编辑交易' : '新增交易'}
      open={open}
      onCancel={onClose}
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
            // 切换类型时清空已选分类，避免类型与分类不匹配
            onChange={() => form.setFieldValue('categoryId', undefined)}
          />
        </Form.Item>
        <Form.Item name="accountId" label="账户" rules={[{ required: true, message: '请选择账户' }]}>
          <Select options={accounts.map((a) => ({ value: a.id, label: a.name }))} />
        </Form.Item>
        <Form.Item name="categoryId" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
          <Select
            options={typeCategories.map((c) => ({ value: c.id, label: c.name }))}
          />
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
  )
}

export default TransactionFormModal
