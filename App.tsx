import React, { useState, useEffect } from 'react';
import { Student, CurrentUser } from './types';
import { getStudentsFromStorage, saveStudentsToStorage } from './utils/storage';
import Header from './components/Header';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [started, setStarted] = useState(false);

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
  
  if (!started) {
    return <HomePage onStart={() => setStarted(true)} />;
  }

  if (!currentUser) {
    return <LoginPage onLogin={setCurrentUser} />;
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <Header user={currentUser} onLogout={handleLogout} />
        <AdminDashboard user={currentUser} students={students} onStudentsChange={handleStudentsChange} />
      </div>
       <footer className="text-center text-gray-500 mt-12 text-sm">
          <p>&copy; {new Date().getFullYear()} Academia Videira. Todos os direitos reservados.</p>
          <p>Análise gerada por IA. Consulte sempre um profissional.</p>
      </footer>
    </div>
  );
};

export default App;