import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import api from '../services/api';
import { Folder, Search, Globe } from 'lucide-react';

export default function PublicSpace() {
    const [pastas, setPastas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPublicPastas();
    }, [searchTerm]);

    const fetchPublicPastas = async () => {
        try {
            const params = {};
            if (searchTerm) params.search = searchTerm;

            const response = await api.get('/pastas/public', { params });
            setPastas(response.data);
        } catch (error) {
            console.error('Erro ao carregar pastas publicas:', error);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />

            <main className="container" style={{ flex: 1, padding: '2rem' }}>
                <div className="page-header">
                    <div>
                        <h1 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Espaço Público</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Descubra conteúdos partilhados pela comunidade</p>
                    </div>

                    <div className="actions-group">
                        <div className="search-wrapper">
                            <Search size={18} className="search-icon" />
                            <input
                            className="search-input"
                            type="text"
                            placeholder="Procurar pasta pública..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.5rem',
                    marginTop: '2rem'
                }}>
                    {pastas.map(pasta => (
                        <Link
                            key={pasta._id}
                            to={`/pasta/${pasta._id}`}
                            className="card"
                            style={{
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                cursor: 'pointer',
                                textDecoration: 'none',
                                color: 'inherit',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Folder size={32} color="var(--primary)" />
                                <Globe size={16} color="var(--text-secondary)" />
                            </div>

                            <div style={{ marginTop: '0.5rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{pasta.nome}</h3>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>
                                    {new Date(pasta.criacaoDt).toLocaleDateString()}
                                </span>
                                {pasta.pastaDono && (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
                                        Por: <strong>{pasta.pastaDono.nome}</strong>
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))}
                    {pastas.length === 0 && (
                        <p style={{ color: 'var(--text-secondary)', gridColumn: '1 / -1' }}>Nenhuma pasta pública encontrada.</p>
                    )}
                </div>
            </main>
        </div>
    );
}
