import { useState, useEffect } from 'react';
import Header from '../components/Header';
import api from '../services/api';
import { Check, X, User } from 'lucide-react';

export default function Notifications() {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/edit-requests/notifications');
            setRequests(response.data);
        } catch (error) {
            console.error('Erro ao carregar notificações:', error);
        }
    };

    const handleRespond = async (requestId, status) => {
        try {
            await api.put(`/edit-requests/respond/${requestId}`, { status });
            // Remove from list or update
            setRequests(requests.filter(r => r._id !== requestId));
        } catch (error) {
            console.error('Erro ao responder:', error);
            alert('Erro ao processar resposta');
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />

            <main className="container" style={{ flex: 1, padding: '2rem' }}>
                <div className="page-header">
                    <div>
                        <h1 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Notificações</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Gerir pedidos de acesso e colaboração</p>
                    </div>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {requests.map(req => (
                        <div key={req._id} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={20} color="var(--text-secondary)" />
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 500 }}>
                                        <strong>{req.requesterId?.nome || 'Utilizador'}</strong> pediu para editar a pasta <strong>{req.pastaId?.nome || 'Pasta'}</strong>
                                    </p>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        {new Date(req.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => handleRespond(req._id, 'accepted')}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        background: '#22c55e', color: 'white', border: 'none',
                                        padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 500
                                    }}
                                >
                                    <Check size={16} /> Aceitar
                                </button>
                                <button
                                    onClick={() => handleRespond(req._id, 'rejected')}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        background: '#ef4444', color: 'white', border: 'none',
                                        padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 500
                                    }}
                                >
                                    <X size={16} /> Rejeitar
                                </button>
                            </div>
                        </div>
                    ))}

                    {requests.length === 0 && (
                        <p style={{ color: 'var(--text-secondary)' }}>Não tem notificações pendentes.</p>
                    )}
                </div>
            </main>
        </div>
    );
}
