import React from 'react';
import { Student } from '../types';
import StudentHistory from './StudentHistory';

interface ClientDashboardProps {
  student: Student;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ student }) => {
  // A visão do cliente é o seu histórico.
  // As ações de adicionar avaliação ou voltar para a lista de todos os alunos são desabilitadas
  // pela propriedade 'isClientView' passada para StudentHistory.
  return (
    <StudentHistory 
      student={student} 
      onAddAssessment={() => {}} 
      onEdit={() => {}} // Adicionado para consistência, mesmo que o botão não apareça.
      onBack={() => {}} 
      isClientView={true} 
    />
  );
};

export default ClientDashboard;