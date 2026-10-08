import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Button,
  Space,
  theme,
  FloatButton,
  Tooltip,
  Drawer,
  Grid,
} from 'antd'
import {
  DashboardOutlined,
  WalletOutlined,
  TagsOutlined,
  SwapOutlined,
  PieChartOutlined,
  BarChartOutlined,
  LogoutOutlined,
  UserOutlined,
  MoonOutlined,
  SunOutlined,
  PlusOutlined,
  MenuOutlined,
} from '@ant-design/icons'
import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { useThemeStore } from '../store/theme'
import TransactionFormModal from '../components/TransactionFormModal'

const { Sider, Header, Content } = Layout
const { useBreakpoint } = Grid

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '总览' },
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
  const themeMode = useThemeStore((s) => s.mode)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const [collapsed, setCollapsed] = useState(false)
  const [quickOpen, setQuickOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // 使用 antd 主题 token，让布局配色跟随深色/浅色模式
  const { token } = theme.useToken()

  // 小屏（<768px）使用抽屉菜单，大屏使用侧边栏
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const selectedKey = '/' + (location.pathname.split('/')[1] || 'dashboard')

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  // 侧边栏与抽屉共用的菜单配置；移动端点击后自动收起抽屉
  const menuProps = {
    mode: 'inline' as const,
    selectedKeys: [selectedKey],
    items: menuItems,
    onClick: ({ key }: { key: string }) => {
      navigate(key)
      setDrawerOpen(false)
    },
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 大屏侧边栏 */}
      {!isMobile && (
        <Sider
          theme={themeMode === 'dark' ? 'dark' : 'light'}
          breakpoint="lg"
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
        >
          <div className="app-logo">{collapsed ? 'PL' : 'PocketLedger'}</div>
          <Menu {...menuProps} />
        </Sider>
      )}
      <Layout style={{ minWidth: 0 }}>
        <Header
          style={{
            background: token.colorBgContainer,
            padding: isMobile ? '0 12px' : '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            overflow: 'hidden',
            gap: 8,
          }}
        >
          <Space size={4} style={{ minWidth: 0 }}>
            {/* 移动端汉堡菜单按钮 */}
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setDrawerOpen(true)}
              />
            )}
            <span
              style={{
                fontSize: isMobile ? 15 : 16,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              个人记账系统
            </span>
          </Space>
          <Space size={isMobile ? 4 : 12} style={{ flexShrink: 0 }}>
            <Tooltip title={themeMode === 'dark' ? '切换到浅色模式' : '切换到深色模式'}>
              <Button
                type="text"
                icon={themeMode === 'dark' ? <SunOutlined /> : <MoonOutlined />}
                onClick={toggleTheme}
              />
            </Tooltip>
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
              <span style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {isMobile ? (
                  <Avatar icon={<UserOutlined />} />
                ) : (
                  <>
                    <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
                    {userInfo?.username || '用户'}
                  </>
                )}
              </span>
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            margin: isMobile ? 8 : 16,
            padding: isMobile ? 12 : 24,
            background: token.colorBgContainer,
            borderRadius: 8,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>

      {/* 移动端抽屉导航 */}
      <Drawer
        placement="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={220}
        title="PocketLedger"
        styles={{ body: { padding: 0 } }}
      >
        <Menu {...menuProps} />
      </Drawer>

      {/* 全局快速记账入口 */}
      <Tooltip title="快速记账" placement="left">
        <FloatButton
          type="primary"
          icon={<PlusOutlined />}
          style={{ right: isMobile ? 16 : 32, bottom: isMobile ? 24 : 48 }}
          onClick={() => setQuickOpen(true)}
        />
      </Tooltip>
      <TransactionFormModal open={quickOpen} editing={null} onClose={() => setQuickOpen(false)} />
    </Layout>
  )
}
