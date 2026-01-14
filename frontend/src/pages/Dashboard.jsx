import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import api from '../services/api';
import { Folder, Search, Trash2, Globe, Pencil } from 'lucide-react';


export default function Dashboard() {
    const [pastas, setPastas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewFolderInput, setShowNewFolderInput] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [editingFolderId, setEditingFolderId] = useState(null);
    const [editingFolderName, setEditingFolderName] = useState('');


    const filteredPastas = pastas.filter(pasta =>
        pasta.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        fetchPastas();
    }, []);

    const fetchPastas = async () => {
        try {
            const response = await api.get('/pastas');
            setPastas(response.data);
        } catch (error) {
            console.error('Erro ao carregar pastas:', error);
        }
    };

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;

        try {
            await api.post('/pastas/create', { nome: newFolderName });
            setNewFolderName('');
            setShowNewFolderInput(false);
            fetchPastas();
        } catch (error) {
            console.error('Erro ao criar pasta:', error);
        }
    };

    const handleDeleteFolder = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm('Tem a certeza que deseja eliminar esta pasta?')) return;

        try {
            await api.delete(`/pastas/delete/${id}`);
            fetchPastas();
        } catch (error) {
            console.error('Erro ao eliminar pasta:', error);
            alert('Erro ao eliminar pasta');
        }
    };

    const handleStartEditFolder = (e, pasta) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingFolderId(pasta._id);
        setEditingFolderName(pasta.nome);

        // opcional: fechar o input de criar pasta se estiver aberto
        setShowNewFolderInput(false);
        setNewFolderName('');
    };

    const handleCancelEditFolder = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingFolderId(null);
        setEditingFolderName('');
    };

    const handleUpdateFolder = async (e, pastaId) => {
        e.preventDefault();
        e.stopPropagation();

        const nome = editingFolderName.trim();
        if (!nome) return;

        try {
            await api.put(`/pastas/update/${pastaId}`, { nome });
            setEditingFolderId(null);
            setEditingFolderName('');
            fetchPastas();
        } catch (error) {
            console.error('Erro ao atualizar pasta:', error);
            alert('Erro ao atualizar pasta');
        }
    };



    const handleTogglePublic = async (e, pasta) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            if (pasta.isPublic) {
                await api.put(`/pastas/unpublish/${pasta._id}`);
            } else {
                await api.put(`/pastas/publish/${pasta._id}`);
            }
            fetchPastas();
        } catch (error) {
            console.error("Error toggling public status:", error);
            alert("Erro ao alterar estado público da pasta");
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />

            <main className="container" style={{ flex: 1, padding: '2rem' }}>
                <div className="page-header">
                    <div>
                        <h1 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Meus Arquivos</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Os seus documentos pessoais e partilhados
                        </p>
                    </div>
                    <div className="actions-group"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem',
                            width: '100%',
                            marginTop: '0.75rem'
                        }}
                    >
                        <button
                            onClick={() => setShowNewFolderInput(!showNewFolderInput)}
                            className="btn-primary btn-elevated-primary"
                            style={{
                                width: 'fit-content',
                                alignSelf: 'flex-end',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                lineHeight: 1
                            }}
                        >
                            <Folder size={18} style={{ display: 'block' }} />
                            <span style={{ display: 'inline-block', lineHeight: 1 }}>Nova Pasta</span>
                        </button>



                        {showNewFolderInput && (
                            <form
                                onSubmit={handleCreateFolder}
                                style={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}
                            >
                                <div style={{ display: 'flex', gap: '0.75rem', width: '100%', maxWidth: '600px' }}>
                                    <input
                                        type="text"
                                        placeholder="Nome da pasta"
                                        autoFocus
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        style={{ flex: 1 }}
                                    />
                                    <button type="submit" className="btn-primary" style={{ width: 'auto' }}>
                                        Criar
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="search-wrapper">
                            <Search size={18} className="search-icon" />
                            <input
                                className="search-input"
                                type="text"
                                placeholder="Procurar pasta..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {filteredPastas.map(pasta => {
                        const isOwner = !pasta.isShared;

                        return (
                            <div
                                key={pasta._id}
                                className="card"
                                style={{
                                    padding: '1.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    position: 'relative'
                                }}
                            >
                                <Link
                                    to={`/pasta/${pasta._id}`}
                                    style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                                >
                                    <div style={{ marginTop: '1rem' }}>
                                        {editingFolderId === pasta._id ? (
                                            <form
                                                onSubmit={(e) => handleUpdateFolder(e, pasta._id)}
                                                onClick={(e) => e.stopPropagation()}
                                                style={{ display: 'flex', gap: '0.5rem' }}
                                            >
                                                <input
                                                    type="text"
                                                    value={editingFolderName}
                                                    autoFocus
                                                    onChange={(e) => setEditingFolderName(e.target.value)}
                                                    onClick={(e) => e.preventDefault()}
                                                    style={{ flex: 1 }}
                                                />
                                                <button
                                                    type="submit"
                                                    className="btn-primary"
                                                    style={{
                                                        width: 'auto',
                                                        padding: '0.35rem 0.6rem',
                                                        fontSize: '0.85rem',
                                                        lineHeight: 1,
                                                        height: '2rem',
                                                        marginTop: '0.5rem'
                                                    }}
                                                >
                                                    Guardar
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn-secondary"
                                                    onClick={handleCancelEditFolder}
                                                    style={{
                                                        width: 'auto',
                                                        padding: '0.35rem 0.6rem',
                                                        fontSize: '0.85rem',
                                                        lineHeight: 1,
                                                        height: '2rem',
                                                        marginTop: '0.5rem'
                                                    }}
                                                >
                                                    Cancelar
                                                </button>

                                            </form>
                                        ) : (
                                            <>
                                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                                    {pasta.nome}
                                                </h3>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>
                                                    {new Date(pasta.criacaoDt).toLocaleDateString()}
                                                </span>
                                                {pasta.pastaDono && (
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
                                                        {pasta.isShared ? `Partilhado por: ${pasta.pastaDono.nome}` : 'Meu arquivo'}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>

                                </Link>

                                <div style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    display: 'flex',
                                    gap: '0.25rem'
                                }}>
                                    {isOwner && (
                                        <button
                                            onClick={(e) => handleTogglePublic(e, pasta)}
                                            style={{
                                                padding: '0.5rem',
                                                color: pasta.isPublic ? 'var(--primary)' : 'var(--text-secondary)',
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}
                                            title={pasta.isPublic ? "Tornar Privado" : "Tornar Público"}
                                        >
                                            <Globe size={18} />
                                        </button>
                                    )}

                                    {/* EDITAR */}
                                    <button
                                        onClick={(e) => handleStartEditFolder(e, pasta)}
                                        style={{
                                            padding: '0.5rem',
                                            color: 'var(--text-secondary)',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                        title="Editar nome"
                                    >
                                        <Pencil size={18} />
                                    </button>

                                    {/* ELIMINAR */}
                                    <button
                                        onClick={(e) => handleDeleteFolder(e, pasta._id)}
                                        style={{
                                            padding: '0.5rem',
                                            color: '#ef4444',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                        title="Eliminar pasta"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                            </div>
                        )
                    })}
                    {filteredPastas.length === 0 && pastas.length > 0 && (
                        <p style={{ color: 'var(--text-secondary)', gridColumn: '1 / -1' }}>
                            Nenhuma pasta encontrada.
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
}
