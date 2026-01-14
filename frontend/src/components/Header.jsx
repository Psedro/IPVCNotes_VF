import { useAuth } from '../context/AuthContext';
import { Folder, Users, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/global.css';

export default function Header() {
    const { user, logout } = useAuth();

    return (
        <header className="header">
            <div className="container header-container">
                <Link to="/" className="header-brand">
                    <div className="header-logo-bkg">
                        <Folder size={20} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.2 }}>IPVC Notes</h2>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sistema de Documentos Colaborativos</span>
                    </div>
                </Link>

                <div className="header-actions">
                    <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        <Users size={16} />
                        <span>Partilhe com os seus colegas</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span className="hide-mobile" style={{ fontWeight: 500 }}>Olá, {user?.nome}</span>
                        <button
                            onClick={logout}
                            className="logout-btn"
                        >
                            <LogOut size={16} className="hide-desktop" /> {/* Icon only on mobile maybe? No, let's keep logic simple for now */}
                            <span>Sair</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
