import { Link, useLocation } from 'react-router-dom';
import { Home, Globe, Bell, Folder } from 'lucide-react';

export default function Sidebar() {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/', label: 'Meus Arquivos', icon: <Home size={20} /> },
        { path: '/public', label: 'Espaço Público', icon: <Globe size={20} /> },
        { path: '/notifications', label: 'Notificações', icon: <Bell size={20} /> },
    ];

    return (
        <aside style={{
            width: '250px',
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e2e8f0',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            left: 0,
            top: 0
        }}>
            <div style={{
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                borderBottom: '1px solid #e2e8f0'
            }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: 'var(--primary)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                }}>
                    <Folder size={18} />
                </div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>IPVC Notes</h1>
            </div>

            <nav style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            color: isActive(item.path) ? 'var(--primary)' : '#64748b',
                            backgroundColor: isActive(item.path) ? '#eff6ff' : 'transparent',
                            textDecoration: 'none',
                            fontWeight: isActive(item.path) ? 600 : 500,
                            transition: 'all 0.2s'
                        }}
                    >
                        {item.icon}
                        {item.label}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
