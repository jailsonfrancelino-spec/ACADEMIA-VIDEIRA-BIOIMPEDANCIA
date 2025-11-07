import React, { useState } from 'react';
import { Student, Assessment } from '../types';
import { ArrowUturnLeftIcon, ChartBarIcon, DocumentTextIcon } from './icons';
import ProgressChart from './ProgressChart';
import ResultDisplay from './ResultDisplay';

interface StudentHistoryProps {
  student: Student;
  onAddAssessment: (studentId: string) => void;
  onBack: () => void;
}

const StudentHistory: React.FC<StudentHistoryProps> = ({ student, onAddAssessment, onBack }) => {
  const [viewingAssessment, setViewingAssessment] = useState<Assessment | null>(null);

  if (viewingAssessment) {
    return (
      <ResultDisplay
        result={viewingAssessment.result}
        onReset={() => setViewingAssessment(null)}
        studentName={viewingAssessment.data.nome}
        buttonText="Voltar para o Histórico"
      />
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="bg-gray-800 rounded-xl p-6 md:p-8 shadow-2xl border border-green-500/20">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <button onClick={onBack} className="text-sm text-gray-400 hover:text-white transition flex items-center mb-2">
              <ArrowUturnLeftIcon className="w-4 h-4 mr-2" />
              Voltar para a Lista
            </button>
            <h2 className="text-3xl font-bold text-green-400">{student.name}</h2>
            <p className="text-gray-400">Histórico de Progresso</p>
          </div>
          <button
            onClick={() => onAddAssessment(student.id)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition duration-300 w-full sm:w-auto"
          >
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            Nova Avaliação
          </button>
        </div>
      </div>
      
      {student.assessments.length > 1 && (
        <div className="bg-gray-800 rounded-xl p-6 md:p-8 shadow-2xl border border-green-500/20">
            <h3 className="text-2xl font-bold text-green-400 mb-4 flex items-center">
                <ChartBarIcon className="w-6 h-6 mr-3" />
                Gráfico de Progresso
            </h3>
            <ProgressChart assessments={student.assessments} />
        </div>
      )}

      <div className="bg-gray-800 rounded-xl p-6 md:p-8 shadow-2xl border border-green-500/20">
         <h3 className="text-2xl font-bold text-green-400 mb-4 flex items-center">
            <DocumentTextIcon className="w-6 h-6 mr-3" />
            Histórico de Avaliações
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-600 text-sm text-gray-400">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3 text-center">Peso (kg)</th>
                <th className="p-3 text-center">Gordura (%)</th>
                <th className="p-3 text-center">Músculo (kg)</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {student.assessments.map(ass => (
                <tr key={ass.id} className="border-b border-gray-700 last:border-0 hover:bg-gray-700/50 transition-colors">
                  <td className="p-3 font-medium">{new Date(ass.date).toLocaleDateString('pt-BR')}</td>
                  <td className="p-3 text-center">{ass.data.peso.toFixed(1)}</td>
                  <td className="p-3 text-center">{ass.data.percentualGordura.toFixed(1)}</td>
                  <td className="p-3 text-center">{ass.data.massaMuscular.toFixed(1)}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => setViewingAssessment(ass)} className="text-green-400 hover:text-green-300 font-semibold">
                      Ver Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentHistory;
