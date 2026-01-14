import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import api from '../services/api';
import { FileText, Plus, ArrowLeft, Users, Search, Trash2, Globe, Lock } from 'lucide-react';
import ShareModal from '../components/ShareModal';
import '../styles/global.css';

export default function FolderView() {
    const { id } = useParams();
    const [folder, setFolder] = useState(null);
    const [notas, setNotas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [newNoteName, setNewNoteName] = useState('');
    const [showNewNoteInput, setShowNewNoteInput] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [requestStatus, setRequestStatus] = useState(null); // 'pending', etc.

    const filteredNotas = notas.filter(nota =>
        nota.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        fetchFolderAndNotas();
    }, [id]);

    const fetchFolderAndNotas = async () => {
        try {
            // Fetch folder details including permission
            const folderRes = await api.get(`/pastas/${id}`);
            setFolder(folderRes.data);

            // Fetch notes
            const notesRes = await api.get(`/notas/pasta/${id}`);
            setNotas(notesRes.data);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            // Handle 403 or 404
            if (error.response?.status === 403) {
                alert("Acesso negado.");
            }
        }
    };

    const handleCreateNote = async (e) => {
        e.preventDefault();
        if (!newNoteName.trim()) return;

        try {
            // Create note
            await api.post(`/notas/create/${id}`, {
                nome: newNoteName,
                titulo: newNoteName,
                conteudo: ''
            });
            setNewNoteName('');
            setShowNewNoteInput(false);
            fetchFolderAndNotas();
        } catch (error) {
            console.error('Erro ao criar nota:', error);
        }
    };

    const handleDeleteNote = async (e, notaId) => {
        e.preventDefault();
        if (!window.confirm('Tem a certeza que deseja eliminar esta nota?')) return;

        try {
            await api.delete(`/notas/${notaId}`);
            fetchFolderAndNotas();
        } catch (error) {
            console.error('Erro ao eliminar nota:', error);
            alert('Erro ao eliminar nota');
        }
    };

    const handleRequestAccess = async () => {
        try {
            await api.post(`/edit-requests/request/${id}`);
            alert("Pedido enviado com sucesso!");
            setRequestStatus('pending');
        } catch (error) {
            console.error("Erro ao pedir acesso:", error);
            if (error.response?.status === 400) {
                alert("Já existe um pedido pendente.");
            } else {
                alert("Erro ao enviar pedido.");
            }
        }
    };

    if (!folder) return <div className="container" style={{ padding: '2rem' }}>A carregar...</div>;

    const canEdit = folder.userPermission === 'owner' || folder.userPermission === 'editor' || folder.userPermission === 'admin';
    const isOwner = folder.userPermission === 'owner';

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />

            <main className="container" style={{ flex: 1, padding: '2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                            <ArrowLeft size={16} /> Voltar
                        </Link>
                        {folder.isPublic && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--primary)', background: '#eff6ff', padding: '0.25rem 0.75rem', borderRadius: '999px' }}>
                                <Globe size={14} /> Pública
                            </span>
                        )}
                    </div>

                    <div className="page-header">
                    <div>
                        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{folder.nome}</h1>

                        {!canEdit && folder.isPublic && (
                        <div style={{ marginTop: '0.5rem' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginRight: '1rem' }}>
                            Modo de Leitura
                            </span>
                            <button
                            onClick={handleRequestAccess}
                            style={{
                                fontSize: '0.85rem',
                                padding: '0.4rem 0.8rem',
                                border: '1px solid var(--primary)',
                                background: 'transparent',
                                color: 'var(--primary)',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                            >
                            Pedir Permissão de Edição
                            </button>
                        </div>
                        )}
                    </div>

                    <div
                        className="actions-group"
                        style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        width: '100%',
                        marginTop: '0.75rem'
                        }}
                    >
                        {canEdit && (
                        <div
                            className="action-buttons"
                            style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            gap: '0.75rem',
                            width: '100%',
                            flexWrap: 'wrap'
                            }}
                        >
                            {isOwner && (
                            <button
                                onClick={() => setShowShareModal(true)}
                                className="btn-secondary btn-elevated"
                                style={{
                                    padding: '0.65rem 1rem',
                                    borderRadius: '10px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    width: 'auto'
                                }}
                            >
                                <Users size={18} />
                                Partilhar
                            </button>
                            )}

                            <button
                            onClick={() => setShowNewNoteInput(!showNewNoteInput)}
                            className="btn-primary btn-elevated"
                            style={{
                                width: 'auto',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.65rem 1rem',
                                borderRadius: '10px',
                                fontWeight: 600
                            }}
                            >
                            <Plus size={18} />
                            Nova Nota
                            </button>
                        </div>
                        )}

                        {showNewNoteInput && canEdit && (
                    <form onSubmit={handleCreateNote} style={{ marginBottom: '2rem', maxWidth: '400px' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                placeholder="Nome da nota"
                                autoFocus
                                value={newNoteName}
                                onChange={(e) => setNewNoteName(e.target.value)}
                            />
                            <button type="submit" className="btn-primary" style={{ width: 'auto' }}>Criar</button>
                        </div>
                    </form>
                )}


                        <div className="search-wrapper">
                        <Search size={18} className="search-icon" />
                        <input
                            className="search-input"
                            type="text"
                            placeholder="Procurar nota..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        </div>
                    </div>
                    </div>

                </div>

                {showShareModal && (
                    <ShareModal
                        pastaId={id}
                        onClose={() => setShowShareModal(false)}
                    />
                )}

            
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {notas.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>Esta pasta ainda não tem notas.</p>}

                    {filteredNotas.map(nota => (
                        <div
                            key={nota._id}
                            className="card"
                            style={{
                                padding: '0',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                transition: 'transform 0.2s',
                                borderLeft: '4px solid var(--primary)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <Link
                                to={`/nota/${nota._id}`}
                                style={{
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    flex: 1,
                                    padding: '1.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}
                            >
                                <FileText size={24} color="var(--primary)" />
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{nota.titulo}</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                                        Atualizado em {new Date(nota.ultAtualizacao).toLocaleDateString()}
                                    </p>
                                </div>
                            </Link>

                            {canEdit && (
                                <button
                                    onClick={(e) => handleDeleteNote(e, nota._id)}
                                    style={{
                                        padding: '1.25rem',
                                        color: '#ef4444',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    title="Eliminar nota"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>
                    ))}
                    {filteredNotas.length === 0 && notas.length > 0 && (
                        <p style={{ color: 'var(--text-secondary)' }}>Nenhuma nota encontrada.</p>
                    )}
                </div>
            </main>
        </div>
    );
}
