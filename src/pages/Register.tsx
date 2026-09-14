import { useState } from 'react'
import { Card, Form, Input, Button, message } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/auth'
import { useAuthStore } from '../store/auth'

interface RegisterForm {
  username: string
  password: string
  confirm: string
}

export default function Register() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: RegisterForm) => {
    try {
      setLoading(true)
      const res = await register(values.username, values.password)
      setAuth(res.token, res.user)
      message.success('注册成功，已自动登录')
      navigate('/', { replace: true })
    } catch {
      // 错误提示已由请求拦截器统一处理
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <Card title="PocketLedger 注册" style={{ width: 360 }}>
        <Form<RegisterForm>
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ username: 'demo', password: '123456', confirm: '123456' }}
        >
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="确认密码"
            dependencies={['password']}
            rules={[
              { required: true, message: '请再次输入密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve()
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              注册
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            已有账号？<Link to="/login">去登录</Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}
