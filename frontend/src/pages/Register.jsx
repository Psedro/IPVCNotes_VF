import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Folder } from 'lucide-react';
import '../styles/global.css';

export default function Register() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('As passwords não coincidem');
            return;
        }

        try {
            await register(nome, email, password);
            // Optional: Auto login logic could be here, but for now redirect to login or handle as needed
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao criar conta');
        }
    };

    return (
        <div className="auth-container">
            <div className="card auth-card">
                <div className="logo-folder">
                    <Folder size={32} strokeWidth={2.5} />
                </div>
                <h1>IPVC Notes</h1>
                <p className="subtitle">Crie a sua conta</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nome</label>
                        <input
                            type="text"
                            placeholder="O seu nome"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            required
                        />
                    </div>
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
                    <div className="form-group">
                        <label>Confirmar Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary">Criar Conta</button>
                </form>

                <p className="bottom-text">
                    Já tem conta? <Link to="/login" className="link">Entrar</Link>
                </p>
            </div>
        </div>
    );
}
