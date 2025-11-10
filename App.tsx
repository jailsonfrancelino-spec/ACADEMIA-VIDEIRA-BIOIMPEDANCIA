import React, { useState, useEffect } from 'react';
import { Student, CurrentUser } from './types';
import { getStudentsFromStorage, saveStudentsToStorage } from './utils/storage';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import ClientDashboard from './components/ClientDashboard';

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    setStudents(getStudentsFromStorage());
  }, []);

  const handleStudentsChange = (updatedStudents: Student[]) => {
      setStudents(updatedStudents);
      saveStudentsToStorage(updatedStudents);
  }

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginPage 
              onLogin={setCurrentUser} 
              students={students} 
              onStudentsChange={handleStudentsChange} 
            />;
  }
  
  const loggedInStudent = currentUser.role === 'client' 
    ? students.find(s => s.id === currentUser.id) 
    : undefined;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <Header user={currentUser} onLogout={handleLogout} />
        {currentUser.role === 'admin' ? (
          <AdminDashboard students={students} onStudentsChange={handleStudentsChange} />
        ) : (
          loggedInStudent ? 
          <ClientDashboard student={loggedInStudent} /> :
          <div className="text-center text-red-400 p-8 bg-gray-800 rounded-lg">
            <p>Erro: Dados do aluno não encontrados. Por favor, saia e tente novamente.</p>
          </div>
        )}
      </div>
       <footer className="text-center text-gray-500 mt-12 text-sm">
          <p>&copy; {new Date().getFullYear()} Academia Videira. Todos os direitos reservados.</p>
          <p>Análise gerada por IA. Consulte sempre um profissional.</p>
      </footer>
    </div>
  );
};

export default App;