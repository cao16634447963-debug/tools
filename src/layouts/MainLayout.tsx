import { Layout, Menu, Avatar, Dropdown } from 'antd'
import {
  WalletOutlined,
  TagsOutlined,
  SwapOutlined,
  PieChartOutlined,
  BarChartOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

const { Sider, Header, Content } = Layout

const menuItems = [
  { key: '/accounts', icon: <WalletOutlined />, label: '账户管理' },
  { key: '/categories', icon: <TagsOutlined />, label: '分类管理' },
  { key: '/transactions', icon: <SwapOutlined />, label: '交易记录' },
  { key: '/budgets', icon: <PieChartOutlined />, label: '预算管理' },
  { key: '/stats', icon: <BarChartOutlined />, label: '统计报表' },
]

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const userInfo = useAuthStore((s) => s.userInfo)
  const logout = useAuthStore((s) => s.logout)
  const [collapsed, setCollapsed] = useState(false)

  const selectedKey = '/' + (location.pathname.split('/')[1] || 'accounts')

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        theme="light"
        breakpoint="lg"
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
      >
        <div className="app-logo">{collapsed ? 'PL' : 'PocketLedger'}</div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout style={{ minWidth: 0 }}>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 600, whiteSpace: 'nowrap' }}>
            个人记账系统
          </span>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: '退出登录',
                  onClick: handleLogout,
                },
              ],
            }}
          >
            <span style={{ cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
              {userInfo?.username || '用户'}
            </span>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: 16,
            padding: 24,
            background: '#fff',
            borderRadius: 8,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
