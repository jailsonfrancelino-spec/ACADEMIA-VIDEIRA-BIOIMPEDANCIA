import React, { useState, useCallback, useEffect } from 'react';
import { Student, StudentData, CurrentUser } from '../types';
import InputGroup from './InputGroup';
import Loader from './Loader';
import { UserIcon, ArrowUturnLeftIcon, QueueListIcon } from './icons';

interface AssessmentFormProps {
  onSave: (studentData: StudentData) => Promise<void>;
  student?: Student | null;
  onBack: () => void;
  user: CurrentUser;
}

type AssessmentFormData = {
  assessmentDate: string;
  instructorName: string;
  nome: string;
  idade: string;
  altura: string;
  peso: string;
  sexo: 'masculino' | 'feminino';
  percentualGordura: string;
  massaMuscular: string;
  gorduraVisceral: string;
  aguaCorporal: string;
  taxaMetabolicaBasal: string;
  objetivo: StudentData['objetivo'];
  nivelAtividade: StudentData['nivelAtividade'];
  condicoesSaude: string;
  restricoesMedicas: string;
  suplementos: string;
};

const initialFormState: Omit<AssessmentFormData, 'nome' | 'objetivo' | 'sexo' | 'nivelAtividade' | 'assessmentDate' | 'instructorName'> = {
  idade: '',
  altura: '',
  peso: '',
  percentualGordura: '',
  massaMuscular: '',
  gorduraVisceral: '',
  aguaCorporal: '',
  taxaMetabolicaBasal: '',
  condicoesSaude: '',
  restricoesMedicas: '',
  suplementos: '',
};

const AssessmentForm: React.FC<AssessmentFormProps> = ({ onSave, student, onBack, user }) => {
  const [formData, setFormData] = useState<AssessmentFormData>({
    ...initialFormState,
    assessmentDate: new Date().toISOString().split('T')[0],
    instructorName: user.name,
    nome: student?.name || '',
    objetivo: 'perder_peso',
    sexo: 'feminino',
    nivelAtividade: 'sedentario',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (student) {
      setFormData(prev => ({ 
          ...prev, 
          nome: student.name,
          idade: student.idade ? String(student.idade) : '',
          altura: student.altura ? String(student.altura) : '',
          sexo: student.sexo || 'feminino',
          objetivo: student.objetivo || 'perder_peso',
          nivelAtividade: student.nivelAtividade || 'sedentario',
          condicoesSaude: student.condicoesSaude || '',
          restricoesMedicas: student.restricoesMedicas || '',
          suplementos: student.suplementos || '',
        }));
    }
  }, [student]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value as any }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const numericData: StudentData = {
      ...formData,
      assessmentDate: formData.assessmentDate,
      instructorName: formData.instructorName,
      idade: parseFloat(formData.idade),
      altura: parseFloat(formData.altura),
      peso: parseFloat(formData.peso),
      percentualGordura: parseFloat(formData.percentualGordura),
      massaMuscular: parseFloat(formData.massaMuscular),
      gorduraVisceral: parseFloat(formData.gorduraVisceral),
      aguaCorporal: parseFloat(formData.aguaCorporal),
      taxaMetabolicaBasal: parseFloat(formData.taxaMetabolicaBasal),
    };

    try {
      await onSave(numericData);
      // Em caso de sucesso, o componente pai desmontará este formulário.
      // Portanto, não há necessidade de chamar setIsLoading(false).
    } catch (err) {
      setError('Ocorreu um erro ao analisar os dados. Verifique os valores e tente novamente.');
      console.error(err);
      setIsLoading(false); // Em caso de erro, permaneça no formulário e mostre a mensagem de erro.
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 md:p-8 shadow-2xl border border-green-500/20 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-400 flex items-center">
          <UserIcon className="w-7 h-7 mr-3" />
          {student ? `Nova Avaliação para ${student.name}` : 'Cadastrar Novo Aluno'}
        </h2>
        {student ? (
            <button onClick={onBack} className="text-gray-400 hover:text-white transition" aria-label="Voltar">
              <ArrowUturnLeftIcon className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={onBack}
              className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition duration-300"
            >
              <QueueListIcon className="w-5 h-5 mr-2" />
              Ver Lista de Alunos
            </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-xl font-semibold text-green-400">Informações Pessoais e da Avaliação</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputGroup label="Nome" name="nome" value={formData.nome} onChange={handleChange} required disabled={!!student} />
           <div>
              <label htmlFor="assessmentDate" className="block text-sm font-medium text-gray-300 mb-2">
                Data da Avaliação
              </label>
              <input
                type="date"
                id="assessmentDate"
                name="assessmentDate"
                value={formData.assessmentDate}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
              />
            </div>
            <InputGroup label="Avaliador" name="instructorName" value={formData.instructorName} onChange={handleChange} required placeholder="Nome do Professor" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="Idade" name="idade" type="number" value={formData.idade} onChange={handleChange} required placeholder="ex: 25" />
             <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sexo</label>
              <div className="flex items-center space-x-4 pt-3">
                <label className="flex items-center text-white cursor-pointer">
                  <input type="radio" name="sexo" value="feminino" checked={formData.sexo === 'feminino'} onChange={handleChange} className="form-radio h-4 w-4 text-green-600 bg-gray-700 border-gray-600 focus:ring-green-500"/>
                  <span className="ml-2">Feminino</span>
                </label>
                <label className="flex items-center text-white cursor-pointer">
                  <input type="radio" name="sexo" value="masculino" checked={formData.sexo === 'masculino'} onChange={handleChange} className="form-radio h-4 w-4 text-green-600 bg-gray-700 border-gray-600 focus:ring-green-500"/>
                  <span className="ml-2">Masculino</span>
                </label>
              </div>
            </div>
        </div>
        
        <div className="border-t border-gray-700 my-2"></div>
        <h3 className="text-xl font-semibold text-green-400">Informações de Saúde e Atividade</h3>
         <div>
          <label htmlFor="objetivo" className="block text-sm font-medium text-gray-300 mb-2">Objetivo Principal</label>
          <select
            id="objetivo"
            name="objetivo"
            value={formData.objetivo}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
          >
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
          <select id="nivelAtividade" name="nivelAtividade" value={formData.nivelAtividade} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200">
              <option value="sedentario">Sedentário (pouco ou nenhum exercício)</option>
              <option value="leve">Levemente ativo (1-3 dias/semana)</option>
              <option value="moderado">Moderadamente ativo (3-5 dias/semana)</option>
              <option value="ativo">Ativo (6-7 dias/semana)</option>
              <option value="muito_ativo">Muito Ativo (trabalho físico/intenso)</option>
          </select>
        </div>
        <div>
            <label htmlFor="condicoesSaude" className="block text-sm font-medium text-gray-300 mb-2">Condições de Saúde (Opcional)</label>
            <textarea id="condicoesSaude" name="condicoesSaude" value={formData.condicoesSaude} onChange={handleChange} placeholder="Ex: Diabetes, hipertensão, etc." rows={2} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"></textarea>
        </div>
        <div>
            <label htmlFor="restricoesMedicas" className="block text-sm font-medium text-gray-300 mb-2">Restrições Médicas/Alimentares (Opcional)</label>
            <textarea id="restricoesMedicas" name="restricoesMedicas" value={formData.restricoesMedicas} onChange={handleChange} placeholder="Ex: Alergia a glúten, lesão no joelho, etc." rows={2} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"></textarea>
        </div>
        <div>
            <label htmlFor="suplementos" className="block text-sm font-medium text-gray-300 mb-2">Suplementos Atuais (Opcional)</label>
            <textarea id="suplementos" name="suplementos" value={formData.suplementos} onChange={handleChange} placeholder="Ex: Whey Protein, Creatina, etc." rows={2} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"></textarea>
        </div>


        <div className="border-t border-gray-700 my-2"></div>
        <h3 className="text-xl font-semibold text-green-400 mb-4">Dados da Bioimpedância</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup label="Altura (cm)" name="altura" type="number" value={formData.altura} onChange={handleChange} required placeholder="ex: 175" />
          <InputGroup label="Peso (kg)" name="peso" type="number" value={formData.peso} onChange={handleChange} required placeholder="ex: 70.5" step="0.1" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputGroup label="Gordura Corporal (%)" name="percentualGordura" type="number" value={formData.percentualGordura} onChange={handleChange} required placeholder="ex: 22" step="0.1" />
          <InputGroup label="Massa Muscular (kg)" name="massaMuscular" type="number" value={formData.massaMuscular} onChange={handleChange} required placeholder="ex: 55" step="0.1" />
          <InputGroup label="Gordura Visceral (Nível)" name="gorduraVisceral" type="number" value={formData.gorduraVisceral} onChange={handleChange} required placeholder="ex: 4" />
          <InputGroup label="Água Corporal (%)" name="aguaCorporal" type="number" value={formData.aguaCorporal} onChange={handleChange} required placeholder="ex: 55.5" step="0.1" />
          <InputGroup label="TMB (kcal)" name="taxaMetabolicaBasal" type="number" value={formData.taxaMetabolicaBasal} onChange={handleChange} required placeholder="ex: 1500" />
        </div>

        <div className="border-t border-gray-700 my-2"></div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition duration-300 transform hover:scale-105"
          >
            {isLoading ? <Loader /> : 'Analisar com IA'}
          </button>
        </div>
      </form>
      {error && <p className="mt-4 text-center text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>}
    </div>
  );
};

export default AssessmentForm;