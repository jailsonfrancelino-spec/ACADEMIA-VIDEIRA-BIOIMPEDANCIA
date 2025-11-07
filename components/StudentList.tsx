import React from 'react';
import { Student } from '../types';
import { UserIcon } from './icons';

interface StudentListProps {
  students: Student[];
  onSelectStudent: (studentId: string) => void;
  onAddStudent: () => void;
}

const StudentList: React.FC<StudentListProps> = ({ students, onSelectStudent, onAddStudent }) => {
  return (
    <div className="bg-gray-800 rounded-xl p-6 md:p-8 shadow-2xl border border-green-500/20 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-400">Alunos Cadastrados</h2>
        <button
          onClick={onAddStudent}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition duration-300"
        >
          <UserIcon className="w-5 h-5 mr-2" />
          Novo Aluno
        </button>
      </div>
      {students.length > 0 ? (
        <ul className="space-y-3">
          {students.map(student => (
            <li key={student.id}>
              <button
                onClick={() => onSelectStudent(student.id)}
                className="w-full text-left bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition duration-200"
              >
                <p className="text-lg font-semibold text-white">{student.name}</p>
                <p className="text-sm text-gray-400">
                  {student.assessments.length} {student.assessments.length === 1 ? 'avaliação' : 'avaliações'}
                </p>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-10 px-6 bg-gray-700/50 rounded-lg">
          <h3 className="text-xl font-semibold text-white">Nenhum aluno cadastrado</h3>
          <p className="text-gray-400 mt-2">Clique em "Novo Aluno" para começar.</p>
        </div>
      )}
    </div>
  );
};

export default StudentList;
