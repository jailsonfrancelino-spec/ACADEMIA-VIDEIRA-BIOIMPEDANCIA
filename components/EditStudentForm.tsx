import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import Loader from './Loader';
import { PencilIcon, ArrowUturnLeftIcon } from './icons';

interface EditStudentFormProps {
    student: Student;
    onSave: (studentId: string, updatedData: Partial<Student>) => void;
    onCancel: () => void;
    students: Student[];
}

const EditStudentForm: React.FC<EditStudentFormProps> = ({ student, onSave, onCancel, students }) => {
    const [formData, setFormData] = useState({
        name: student.name || '',
        password: '',
        confirmPassword: '',
        idade: student.idade ? String(student.idade) : '',
        altura: student.altura ? String(student.altura) : '',
        sexo: student.sexo || 'feminino',
        objetivo: student.objetivo || 'perder_peso',
        nivelAtividade: student.nivelAtividade || 'sedentario',
        condicoesSaude: student.condicoesSaude || '',
        restricoesMedicas: student.restricoesMedicas || '',
        suplementos: student.suplementos || '',
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Garante que o formulário seja preenchido se o aluno mudar
        setFormData({
            name: student.name || '',
            password: '',
            confirmPassword: '',
            idade: student.idade ? String(student.idade) : '',
            altura: student.altura ? String(student.altura) : '',
            sexo: student.sexo || 'feminino',
            objetivo: student.objetivo || 'perder_peso',
            nivelAtividade: student.nivelAtividade || 'sedentario',
            condicoesSaude: student.condicoesSaude || '',
            restricoesMedicas: student.restricoesMedicas || '',
            suplementos: student.suplementos || '',
        });
    }, [student]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // Validação
        if (formData.password && formData.password !== formData.confirmPassword) {
            setError('As novas senhas não coincidem.');
            setIsLoading(false);
            return;
        }
        if (formData.password && formData.password.length < 6) {
            setError('A nova senha deve ter pelo menos 6 caracteres.');
            setIsLoading(false);
            return;
        }
        const otherStudentWithSameName = students.find(
            s => s.name.toLowerCase() === formData.name.toLowerCase() && s.id !== student.id
        );
        if (otherStudentWithSameName) {
            setError('Já existe outro aluno com este nome. Por favor, escolha outro.');
            setIsLoading(false);
            return;
        }

        const updatedData: Partial<Student> = {
            name: formData.name,
            idade: formData.idade ? parseInt(formData.idade, 10) : undefined,
            altura: formData.altura ? parseInt(formData.altura, 10) : undefined,
            sexo: formData.sexo as any,
            objetivo: formData.objetivo as any,
            nivelAtividade: formData.nivelAtividade as any,
            condicoesSaude: formData.condicoesSaude,
            restricoesMedicas: formData.restricoesMedicas,
            suplementos: formData.suplementos,
        };

        if (formData.password) {
            updatedData.password = formData.password;
        }

        onSave(student.id, updatedData);
        setIsLoading(false);
    };

    return (
        <div className="bg-gray-800 rounded-xl p-6 md:p-8 shadow-2xl border border-yellow-500/20 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-yellow-400 flex items-center">
                    <PencilIcon className="w-7 h-7 mr-3" />
                    Editar Perfil de {student.name}
                </h2>
                <button onClick={onCancel} className="text-gray-400 hover:text-white transition" aria-label="Cancelar">
                    <ArrowUturnLeftIcon className="w-6 h-6" />
                </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Nome (Login)</label>
                        <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Nova Senha</label>
                        <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Deixe em branco para não alterar" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                    </div>
                     <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">Confirmar Nova Senha</label>
                        <input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Repita a nova senha" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                    </div>
                </div>

                <div className="border-t border-gray-700 my-2"></div>
                <h3 className="text-xl font-semibold text-yellow-400">Informações do Perfil</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label htmlFor="idade" className="block text-sm font-medium text-gray-300 mb-2">Idade</label>
                        <input id="idade" name="idade" type="number" value={formData.idade} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                    </div>
                     <div>
                        <label htmlFor="altura" className="block text-sm font-medium text-gray-300 mb-2">Altura (cm)</label>
                        <input id="altura" name="altura" type="number" value={formData.altura} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Sexo</label>
                    <select name="sexo" value={formData.sexo} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
                        <option value="feminino">Feminino</option>
                        <option value="masculino">Masculino</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="objetivo" className="block text-sm font-medium text-gray-300 mb-2">Objetivo Principal</label>
                    <select id="objetivo" name="objetivo" value={formData.objetivo} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
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
                    <select id="nivelAtividade" name="nivelAtividade" value={formData.nivelAtividade} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
                        <option value="sedentario">Sedentário (pouco ou nenhum exercício)</option>
                        <option value="leve">Levemente ativo (1-3 dias/semana)</option>
                        <option value="moderado">Moderadamente ativo (3-5 dias/semana)</option>
                        <option value="ativo">Ativo (6-7 dias/semana)</option>
                        <option value="muito_ativo">Muito Ativo (trabalho físico/intenso)</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="condicoesSaude" className="block text-sm font-medium text-gray-300 mb-2">Condições de Saúde (Opcional)</label>
                    <textarea id="condicoesSaude" name="condicoesSaude" value={formData.condicoesSaude} onChange={handleChange} rows={2} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"></textarea>
                </div>
                <div>
                    <label htmlFor="restricoesMedicas" className="block text-sm font-medium text-gray-300 mb-2">Restrições Médicas/Alimentares (Opcional)</label>
                    <textarea id="restricoesMedicas" name="restricoesMedicas" value={formData.restricoesMedicas} onChange={handleChange} rows={2} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"></textarea>
                </div>
                <div>
                    <label htmlFor="suplementos" className="block text-sm font-medium text-gray-300 mb-2">Suplementos Atuais (Opcional)</label>
                    <textarea id="suplementos" name="suplementos" value={formData.suplementos} onChange={handleChange} rows={2} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"></textarea>
                </div>

                {error && <p className="mt-4 text-center text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>}

                <div className="pt-4 flex items-center gap-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition duration-300"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-800 disabled:cursor-not-allowed text-gray-900 font-bold py-3 px-4 rounded-lg flex items-center justify-center transition duration-300 transform hover:scale-105"
                    >
                        {isLoading ? <Loader /> : 'Salvar Alterações'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditStudentForm;
