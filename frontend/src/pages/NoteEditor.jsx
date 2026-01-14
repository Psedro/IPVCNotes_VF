import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import api from '../services/api';
import { Save, ArrowLeft, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react';
import '../styles/global.css';

export default function NoteEditor() {
    const { id } = useParams();
    const [titulo, setTitulo] = useState('');
    const [conteudo, setConteudo] = useState('');
    const [anexos, setAnexos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [canEdit, setCanEdit] = useState(true);


    useEffect(() => {
        fetchNota();
    }, [id]);

    const fetchNota = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/notas/${id}`);

            setTitulo(response.data.titulo);
            setConteudo(response.data.conteudo);
            setAnexos(response.data.anexos || []);
            setLastSaved(new Date(response.data.ultAtualizacao));

            const pastaId = response.data?.notaPasta?._id || response.data?.notaPasta;
            if (pastaId) {
                const folderRes = await api.get(`/pastas/${pastaId}`);
                const perm = String(folderRes.data.userPermission || "none").toLowerCase();
                setCanEdit(perm === "owner" || perm === "editor" || perm === "admin");
            } else {
                setCanEdit(false);
            }
        } catch (error) {
            console.error("Erro ao carregar nota:", error);
            alert("Erro ao carregar a nota.");
            setCanEdit(false);
        } finally {
            setLoading(false);
        }
    };

    const saveNota = useCallback(async (novosAnexos = null) => {
        setSaving(true);
        try {
            // Se passarmos novos anexos diretamente, usamos esses (útil logo após upload)
            // Senão usamos o estado atual
            const anexosFinal = novosAnexos || anexos;

            const res = await api.put(`/notas/${id}`, { titulo, conteudo, anexos: anexosFinal });
            setLastSaved(new Date(res.data.ultAtualizacao || Date.now()));
            // Atualizar estado se veio do save
            if (!novosAnexos) setAnexos(res.data.anexos || []);
        } catch (error) {
            console.error("Erro ao guardar nota:", error);

            const st = error?.response?.status;
            if (st === 403) alert("Não tens permissão para editar esta nota.");
            else if (st === 404) alert("Nota não encontrada (ou sem acesso).");
            else alert(error?.response?.data?.message || "Erro ao guardar.");

        } finally {
            setSaving(false);
        }
    }, [id, titulo, conteudo, anexos]);


    // Debounced save could be added here, currently manual or on blur/change
    // For simplicity, let's auto-save on change with debounce or just provide a save button + Ctrl+S

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                saveNota();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [saveNota]);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            // 1. Upload do ficheiro
            const res = await api.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            const novoAnexo = {
                nome: res.data.nome,
                url: res.data.url,
                tipo: res.data.tipo,
                dataUpload: new Date()
            };

            // 2. Atualizar estado local
            const novaLista = [...anexos, novoAnexo];
            setAnexos(novaLista);

            // 3. Guardar nota imediatamente para persistir o anexo
            await saveNota(novaLista);

        } catch (err) {
            console.error("Erro no upload:", err);
            alert("Erro ao fazer upload do ficheiro.");
        } finally {
            setUploading(false);
            // reset file input
            e.target.value = null;
        }
    };

    const removeAnexo = async (index) => {
        if (!confirm("Remover este anexo?")) return;
        const novaLista = anexos.filter((_, i) => i !== index);
        setAnexos(novaLista);
        await saveNota(novaLista);
    };

    const getIcon = (tipo) => {
        if (tipo.startsWith("image/")) return <ImageIcon size={20} />;
        return <FileText size={20} />;
    };

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Carregando...</div>;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />

            <main className="container" style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                <div className="editor-header">
                    <div className="editor-title-group">
                        <Link to={`/`} style={{ color: 'var(--text-secondary)' }}>
                            <ArrowLeft size={20} />
                        </Link>
                        <input
                            type="text"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder="Título da Nota"
                            readOnly={!canEdit}
                            style={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                border: 'none',
                                background: 'transparent',
                                width: '100%',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div
                        className="editor-actions"
                        style={{
                            display: 'flex',
                            alignItems: 'center',        // centra verticalmente (status ↔ botão)
                            justifyContent: 'space-between', // status à esquerda, botão à direita
                            gap: '0.75rem',
                            width: '100%',
                            marginBottom: '2rem',
                            flexWrap: 'wrap',            // opcional: em ecrãs pequenos quebra direitinho
                        }}
                    >
                        <span className="editor-status">
                            {canEdit
                                ? (saving ? 'Guardando...' : `Guardado às ${lastSaved?.toLocaleTimeString()}`)
                                : 'Modo leitura'}
                        </span>

                        {canEdit && (
                            <div
                                className="action-buttons"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    flexWrap: 'wrap',
                                }}
                            >
                                <label className="btn-secondary" style={{
                                    cursor: uploading ? 'wait' : 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.65rem 1rem', borderRadius: '10px'
                                }}>
                                    <Paperclip size={18} />
                                    {uploading ? 'A enviar...' : 'Anexar'}
                                    <input type="file" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
                                </label>

                                <button
                                    onClick={() => saveNota()}
                                    disabled={saving}
                                    className="btn-primary btn-elevated-primary"
                                    style={{
                                        padding: '0.65rem 1rem',
                                        borderRadius: '10px',
                                        border: 'none',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        width: 'auto',
                                    }}
                                >
                                    <Save size={18} />
                                    Guardar
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem', gap: '1.5rem', minHeight: '400px' }}>
                    <textarea
                        value={conteudo}
                        onChange={(e) => setConteudo(e.target.value)}
                        placeholder="Comece a escrever a sua nota aqui..."
                        className="editor-textarea"
                        readOnly={!canEdit}
                        style={{ flex: 1, resize: 'none' }}
                    />
                </div>

                {/* Secção de Anexos */}
                {anexos.length > 0 && (
                    <div style={{ marginTop: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Paperclip size={20} /> Anexos ({anexos.length})
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            {anexos.map((anexo, idx) => (
                                <div key={idx} className="card" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
                                    <div style={{ color: 'var(--primary)' }}>
                                        {getIcon(anexo.tipo)}
                                    </div>
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <a
                                            href={api.defaults.baseURL.replace('/api', '') + anexo.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                            title={anexo.nome}
                                        >
                                            {anexo.nome}
                                        </a>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {new Date(anexo.dataUpload).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {canEdit && (
                                        <button
                                            onClick={() => removeAnexo(idx)}
                                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}
                                            title="Remover anexo"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
