import { useState } from 'react'
import { Card, Form, Input, Button, Typography, message } from 'antd'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuthStore } from '../store/auth'

interface LoginForm {
  username: string
  password: string
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: LoginForm) => {
    try {
      setLoading(true)
      const res = await login(values.username, values.password)
      setAuth(res.token, res.user)
      message.success('登录成功')
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname
      navigate(from || '/', { replace: true })
    } catch {
      // 错误提示已由请求拦截器统一处理
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <Card title="PocketLedger 登录" style={{ width: 360 }}>
        <Form<LoginForm>
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ username: 'demo', password: '123456' }}
        >
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            还没有账号？<Link to="/register">立即注册</Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}
