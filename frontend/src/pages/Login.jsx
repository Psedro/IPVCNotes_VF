import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Folder } from 'lucide-react';
import '../styles/global.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao iniciar sessão');
        }
    };

    return (
        <div className="auth-container">
            <div className="card auth-card">
                <div className="logo-folder">
                    <Folder size={32} strokeWidth={2.5} />
                </div>
                <h1>IPVC Notes</h1>
                <p className="subtitle">Entre na sua conta</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="email@ipvc.pt"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary">Entrar</button>
                </form>

                <p className="bottom-text">
                    Não tem conta? <Link to="/register" className="link">Criar conta</Link>
                </p>
            </div>
        </div>
    );
}
