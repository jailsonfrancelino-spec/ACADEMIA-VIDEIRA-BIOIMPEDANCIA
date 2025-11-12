import React, { useState } from 'react';
import { CurrentUser } from '../types';
import { login } from '../services/authService';
import LogoVideira from './LogoVideira';
import Loader from './Loader';

interface LoginPageProps {
    onLogin: (user: CurrentUser) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const user = await login(username, password);
            onLogin(user);
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gray-900 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-700/20 via-gray-900 to-gray-900">
            <div className="w-full max-w-md animate-fade-in">
                <div className="mb-8">
                    <LogoVideira />
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
                    <div className="py-3 text-center font-bold bg-gray-800 text-yellow-400 rounded-t-lg">
                        Acesso Administrativo
                    </div>
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                                Usuário Admin
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="admin"
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition duration-200"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                Senha
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••"
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition duration-200"
                            />
                        </div>
                        {error && <p className="text-center text-red-400 bg-red-900/30 p-3 rounded-lg text-sm">{error}</p>}
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-700 disabled:cursor-not-allowed text-gray-900 font-bold py-3 px-4 rounded-lg flex items-center justify-center transition duration-300 transform hover:scale-105"
                            >
                                {isLoading ? <Loader /> : 'Entrar'}
                            </button>
                        </div>
                    </form>
                </div>
                 <footer className="text-center text-gray-500 mt-8 text-sm">
                    <p>&copy; {new Date().getFullYear()} Academia Videira. Acesso Restrito.</p>
                </footer>
            </div>
        </div>
    );
};

export default LoginPage;
