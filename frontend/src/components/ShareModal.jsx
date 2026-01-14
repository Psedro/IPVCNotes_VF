import { useState, useEffect } from 'react';
import api from '../services/api';
import { X, Trash2, UserPlus } from 'lucide-react';

export default function ShareModal({ pastaId, onClose }) {
  const [folder, setFolder] = useState(null);
  const [email, setEmail] = useState('');
  const [selectedPerm, setSelectedPerm] = useState('');
  const [permissoes, setPermissoes] = useState([]);
  const [partilhas, setPartilhas] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFolder();
    fetchPermissoes();
    fetchPartilhas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pastaId]);

  const fetchFolder = async () => {
    try {
      const res = await api.get(`/pastas/${pastaId}`);
      setFolder(res.data);
    } catch (err) {
      console.error('Erro ao buscar pasta:', err);
    }
  };

  const fetchPermissoes = async () => {
    try {
      const res = await api.get('/permissoes');
      setPermissoes(res.data || []);

      // define por defeito a primeira permissão
      if ((!selectedPerm || selectedPerm === '') && res.data?.length > 0) {
        setSelectedPerm(res.data[0]._id);
      }
    } catch (err) {
      console.error('Erro ao buscar permissões:', err);
    }
  };

  const fetchPartilhas = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/partpastas/pasta/${pastaId}`);
      setPartilhas(res.data || []);
    } catch (err) {
      console.error('Erro ao buscar partilhas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublic = async () => {
    if (!folder) return;
    try {
      const endpoint = folder.isPublic ? 'unpublish' : 'publish';
      await api.put(`/pastas/${endpoint}/${pastaId}`);
      await fetchFolder();
    } catch (err) {
      console.error(err);
      alert('Erro ao alterar estado.');
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return setError('Insere um email.');
    if (!selectedPerm) return setError('Seleciona uma permissão.');

    try {
      // 1) encontrar utilizador pelo email
      const userRes = await api.post('/auth/find-by-email', { email: cleanEmail });
      const userId = userRes.data?._id;

      if (!userId) {
        setError('Utilizador não encontrado.');
        return;
      }

      // 2) criar partilha
      await api.post('/partpastas/create', {
        pastaId,
        utilizadorId: userId,
        permissaoId: selectedPerm,
      });

      setEmail('');
      await fetchPartilhas();
    } catch (err) {
      console.error('Erro ao partilhar:', err);

      const status = err?.response?.status;
      if (status === 404) setError('Utilizador não encontrado.');
      else if (status === 409) setError('Esta pasta já está partilhada com esse utilizador.');
      else setError(err?.response?.data?.message || 'Erro ao partilhar.');
    }
  };

  const handleRemove = async (partilhaId) => {
    if (!window.confirm('Remover acesso deste utilizador?')) return;
    try {
      await api.delete(`/partpastas/delete/${partilhaId}`);
      await fetchPartilhas();
    } catch (err) {
      console.error('Erro ao remover partilha:', err);
      alert('Erro ao remover acesso.');
    }
  };

  const handleUpdatePerm = async (partilhaId, newPermId) => {
    try {
      await api.patch(`/partpastas/update/${partilhaId}`, { permissaoId: newPermId });
      await fetchPartilhas();
    } catch (err) {
      console.error('Erro ao atualizar permissão:', err);
      alert('Erro ao atualizar permissão.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Partilhar Pasta</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {folder && (
          <div
            style={{
              padding: '1rem',
              background: '#f8fafc',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: '1px solid var(--border)',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Espaço Público{' '}
                {folder.isPublic && (
                  <span style={{ fontSize: '0.7rem', background: '#22c55e', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>
                    ATIVO
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                {folder.isPublic ? 'Qualquer pessoa pode ver esta pasta.' : 'Apenas pessoas convidadas podem ver.'}
              </p>
            </div>
            <button
              onClick={handleTogglePublic}
              className={folder.isPublic ? 'btn-danger' : 'btn-primary'}
              style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
            >
              {folder.isPublic ? 'Tornar Privado' : 'Publicar'}
            </button>
          </div>
        )}

        <div style={{ borderBottom: '1px solid var(--border)', margin: '0 -1.5rem 1.5rem -1.5rem' }} />

        <form onSubmit={handleShare} style={{ marginBottom: '2rem' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Convidar pessoas</h4>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="email"
              placeholder="Email do colega"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <select
              value={selectedPerm}
              onChange={(e) => setSelectedPerm(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}
            >
              {permissoes.length === 0 ? (
                <option value="">Sem permissões</option>
              ) : (
                permissoes.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.permissao.charAt(0).toUpperCase() + p.permissao.slice(1)}
                  </option>
                ))
              )}
            </select>

            <button type="submit" className="btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center' }}>
              <UserPlus size={18} />
            </button>
          </div>

          {error && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.5rem' }}>{error}</p>}
        </form>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Com acesso</h4>

          {loading ? (
            <p>A carregar...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {partilhas.map((p) => (
                <div
                  key={p._id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem',
                    background: '#f8fafc',
                    borderRadius: '8px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>{p.utilizadorId?.nome || 'Utilizador'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.utilizadorId?.email}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <select
                      value={p.permissaoId?._id || p.permissaoId}
                      onChange={(e) => handleUpdatePerm(p._id, e.target.value)}
                      style={{
                        padding: '0.25rem',
                        fontSize: '0.8rem',
                        borderRadius: '4px',
                        border: '1px solid var(--border)',
                        background: 'white'
                      }}
                    >
                      {permissoes.map(perm => (
                        <option key={perm._id} value={perm._id}>
                          {perm.permissao.charAt(0).toUpperCase() + perm.permissao.slice(1)}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleRemove(p._id)}
                      style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}
                      title="Remover acesso"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {partilhas.length === 0 && (
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Ninguém com acesso direto.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
