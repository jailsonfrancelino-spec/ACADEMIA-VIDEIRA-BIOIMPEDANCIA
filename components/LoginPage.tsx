import React, { useState, useEffect } from 'react';
import { Student, CurrentUser, StudentData } from '../types';
import { login, register } from '../services/authService';
import LogoVideira from './LogoVideira';
import Loader from './Loader';

// Fix: Define the missing LoginPageProps interface.
interface LoginPageProps {
    onLogin: (user: CurrentUser) => void;
    students: Student[];
    onStudentsChange: (students: Student[]) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, students, onStudentsChange }) => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [role, setRole] = useState<'admin' | 'client'>('client');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [idade, setIdade] = useState('');
    const [altura, setAltura] = useState('');
    const [sexo, setSexo] = useState<'masculino' | 'feminino'>('feminino');
    const [objetivo, setObjetivo] = useState<StudentData['objetivo']>('perder_peso');
    const [nivelAtividade, setNivelAtividade] = useState<'sedentario' | 'leve' | 'moderado' | 'ativo' | 'muito_ativo'>('sedentario');
    const [condicoesSaude, setCondicoesSaude] = useState('');
    const [restricoesMedicas, setRestricoesMedicas] = useState('');
    const [suplementos, setSuplementos] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setIdade('');
        setAltura('');
        setSexo('feminino');
        setObjetivo('perder_peso');
        setNivelAtividade('sedentario');
        setCondicoesSaude('');
        setRestricoesMedicas('');
        setSuplementos('');
        setError(null);
        if (mode === 'register') {
            setRole('client');
        }
    }, [mode, role]);

    const handleLogin = async () => {
        const user = await login(username, password, role, students);
        onLogin(user);
    };

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            throw new Error('As senhas não coincidem.');
        }
        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            throw new Error('A senha deve ter pelo menos 6 caracteres.');
        }
        const newStudent = await register(
            username,
            password,
            idade ? parseInt(idade, 10) : undefined,
            altura ? parseInt(altura, 10) : undefined,
            sexo,
            objetivo,
            nivelAtividade,
            condicoesSaude,
            restricoesMedicas,
            suplementos,
            students
        );
        const updatedStudents = [...students, newStudent];
        onStudentsChange(updatedStudents);
        onLogin({ name: newStudent.name, role: 'client', id: newStudent.id });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            if (mode === 'login') {
                await handleLogin();
            } else {
                await handleRegister();
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro.');
        } finally {
            setIsLoading(false);
        }
    };

    const tabClasses = (isActive: boolean) =>
        `w-full py-3 text-center font-bold rounded-t-lg cursor-pointer transition-colors duration-300 ${
        isActive
            ? 'bg-gray-800 text-yellow-400'
            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/70'
        }`;

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gray-900 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-700/20 via-gray-900 to-gray-900">
            <div className="w-full max-w-md animate-fade-in">
                <div className="mb-8">
                    <LogoVideira />
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
                    {mode === 'login' && (
                        <div className="flex">
                            <div onClick={() => setRole('client')} className={tabClasses(role === 'client')}>
                                Sou Aluno
                            </div>
                            <div onClick={() => setRole('admin')} className={tabClasses(role === 'admin')}>
                                Sou Admin
                            </div>
                        </div>
                    )}
                    {mode === 'register' && (
                         <div className="py-3 text-center font-bold bg-gray-800 text-yellow-400 rounded-t-lg">
                            Cadastro de Aluno
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                                {mode === 'login' && role === 'client' ? 'Nome Completo do Aluno' :
                                 mode === 'login' && role === 'admin' ? 'Usuário Admin' : 'Nome Completo'}
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder={
                                    mode === 'login' && role === 'client' ? 'Ex: João da Silva' :
                                    mode === 'login' && role === 'admin' ? 'admin' : 'Seu nome completo'
                                }
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
                                placeholder={
                                    mode === 'login' ? '•••••• (Padrão: 123456)' : 'Crie uma senha (mín. 6 caracteres)'
                                }
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition duration-200"
                            />
                        </div>
                        {mode === 'register' && (
                            <>
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                        Confirmar Senha
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        placeholder="Repita sua senha"
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition duration-200"
                                    />
                                </div>

                                <div className="border-t border-gray-700 !mt-8 !mb-6"></div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="idade" className="block text-sm font-medium text-gray-300 mb-2">Idade</label>
                                        <input type="number" id="idade" value={idade} onChange={(e) => setIdade(e.target.value)} required placeholder="Sua idade" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition duration-200" />
                                    </div>
                                     <div>
                                        <label htmlFor="altura" className="block text-sm font-medium text-gray-300 mb-2">Altura (cm)</label>
                                        <input type="number" id="altura" value={altura} onChange={(e) => setAltura(e.target.value)} required placeholder="Ex: 175" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition duration-200" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Sexo</label>
                                    <div className="flex items-center space-x-4">
                                        <label className="flex items-center text-white cursor-pointer">
                                            <input type="radio" name="sexo" value="feminino" checked={sexo === 'feminino'} onChange={() => setSexo('feminino')} className="form-radio h-4 w-4 text-yellow-500 bg-gray-700 border-gray-600 focus:ring-yellow-500"/>
                                            <span className="ml-2">Feminino</span>
                                        </label>
                                        <label className="flex items-center text-white cursor-pointer">
                                            <input type="radio" name="sexo" value="masculino" checked={sexo === 'masculino'} onChange={() => setSexo('masculino')} className="form-radio h-4 w-4 text-yellow-500 bg-gray-700 border-gray-600 focus:ring-yellow-500"/>
                                            <span className="ml-2">Masculino</span>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="objetivo" className="block text-sm font-medium text-gray-300 mb-2">Seu Objetivo Principal</label>
                                    <select id="objetivo" value={objetivo} onChange={(e) => setObjetivo(e.target.value as any)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition duration-200">
                                        <option value="perder_peso">Perder Peso</option>
                                        <option value="ganhar_massa">Ganhar Massa Muscular</option>
                                        <option value="manter">Manter o Peso</option>
                                        <option value="definicao_muscular">Definição Muscular</option>
                                        <option value="melhorar_resistencia">Melhorar Resistência</option>
                                        <option value="saude_geral">Saúde e Bem-estar Geral</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="nivelAtividade" className="block text-sm font-medium text-gray-300 mb-2">Nível de Atividade Física</label>
                                    <select id="nivelAtividade" value={nivelAtividade} onChange={(e) => setNivelAtividade(e.target.value as any)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition duration-200">
                                        <option value="sedentario">Sedentário (pouco ou nenhum exercício)</option>
                                        <option value="leve">Levemente ativo (1-3 dias/semana)</option>
                                        <option value="moderado">Moderadamente ativo (3-5 dias/semana)</option>
                                        <option value="ativo">Ativo (6-7 dias/semana)</option>
                                        <option value="muito_ativo">Muito Ativo (trabalho físico/intenso)</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="condicoesSaude" className="block text-sm font-medium text-gray-300 mb-2">Condições de Saúde (Opcional)</label>
                                    <textarea id="condicoesSaude" value={condicoesSaude} onChange={(e) => setCondicoesSaude(e.target.value)} placeholder="Ex: Diabetes, hipertensão, etc." rows={2} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition duration-200"></textarea>
                                </div>
                                <div>
                                    <label htmlFor="restricoesMedicas" className="block text-sm font-medium text-gray-300 mb-2">Restrições Médicas/Alimentares (Opcional)</label>
                                    <textarea id="restricoesMedicas" value={restricoesMedicas} onChange={(e) => setRestricoesMedicas(e.target.value)} placeholder="Ex: Alergia a glúten, lesão no joelho, etc." rows={2} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition duration-200"></textarea>
                                </div>
                                <div>
                                    <label htmlFor="suplementos" className="block text-sm font-medium text-gray-300 mb-2">Suplementos Atuais (Opcional)</label>
                                    <textarea id="suplementos" value={suplementos} onChange={(e) => setSuplementos(e.target.value)} placeholder="Ex: Whey Protein, Creatina, etc." rows={2} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition duration-200"></textarea>
                                </div>
                            </>
                        )}
                         {error && <p className="text-center text-red-400 bg-red-900/30 p-3 rounded-lg text-sm">{error}</p>}
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-700 disabled:cursor-not-allowed text-gray-900 font-bold py-3 px-4 rounded-lg flex items-center justify-center transition duration-300 transform hover:scale-105"
                            >
                                {isLoading ? <Loader /> : (mode === 'login' ? 'Entrar' : 'Cadastrar e Entrar')}
                            </button>
                        </div>
                         <div className="text-center text-sm">
                            {mode === 'login' ? (
                                <p className="text-gray-400">
                                    Não tem uma conta?{' '}
                                    <button type="button" onClick={() => setMode('register')} className="font-semibold text-yellow-400 hover:text-yellow-300 focus:outline-none">
                                        Cadastre-se
                                    </button>
                                </p>
                            ) : (
                                 <p className="text-gray-400">
                                    Já tem uma conta?{' '}
                                    <button type="button" onClick={() => setMode('login')} className="font-semibold text-yellow-400 hover:text-yellow-300 focus:outline-none">
                                        Faça Login
                                    </button>
                                </p>
                            )}
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