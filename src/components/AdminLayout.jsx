import Sidebar from './Sidebar'

export default function AdminLayout({ children }) {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />

      <div style={{
        flex: 1,
        padding: 30,
        background: '#f1f5f9',
        minHeight: '100vh'
      }}>
        {children}
      </div>
    </div>
  )
}