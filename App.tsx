import React, { useState, useEffect, useCallback } from 'react';
import { Student, StudentData, Assessment, AnalysisResult } from './types';
import { analyzeBioimpedance } from './services/geminiService';
import { getStudentsFromStorage, saveStudentsToStorage } from './utils/storage';
import Header from './components/Header';
import StudentList from './components/StudentList';
import AssessmentForm from './components/AssessmentForm';
import StudentHistory from './components/StudentHistory';
import ResultDisplay from './components/ResultDisplay';
import HomePage from './components/HomePage';

type View = 'home' | 'list' | 'form' | 'history' | 'result';

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [latestAssessment, setLatestAssessment] = useState<Assessment | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setStudents(getStudentsFromStorage());
  }, []);

  const handleSelectStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setSelectedStudent(student);
      setCurrentView('history');
    }
  };

  const handleAddNewStudent = () => {
    setSelectedStudent(null);
    setIsEditing(false);
    setCurrentView('form');
  };
  
  const handleAddAssessmentForStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
     if (student) {
      setSelectedStudent(student);
      setIsEditing(true);
      setCurrentView('form');
    }
  }

  const handleSaveAssessment = async (assessmentData: StudentData, analysisResult: AnalysisResult) => {
    const newAssessment: Assessment = {
      id: `ass_${new Date().getTime()}`,
      date: new Date().toISOString(),
      data: assessmentData,
      result: analysisResult,
    };

    let updatedStudents;
    if (isEditing && selectedStudent) { // Adding assessment to existing student
      updatedStudents = students.map(s => 
        s.id === selectedStudent.id 
          ? { ...s, assessments: [...s.assessments, newAssessment].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) }
          : s
      );
    } else { // Adding a new student
      const newStudent: Student = {
        id: `stu_${new Date().getTime()}`,
        name: assessmentData.nome,
        assessments: [newAssessment],
      };
      updatedStudents = [...students, newStudent];
    }
    
    setStudents(updatedStudents);
    saveStudentsToStorage(updatedStudents);
    setLatestAssessment(newAssessment);
    const updatedStudent = updatedStudents.find(s => s.id === (selectedStudent?.id || updatedStudents[updatedStudents.length-1].id))
    if (updatedStudent) {
      setSelectedStudent(updatedStudent);
    }
    setCurrentView('result');
  };
  
  const handleBackToList = () => {
    setSelectedStudent(null);
    setLatestAssessment(null);
    setCurrentView('list');
  };
  
  const handleBackToHistory = () => {
    setLatestAssessment(null);
    setCurrentView('history');
  }

  const renderContent = () => {
    switch(currentView) {
      case 'home':
        return <HomePage onStart={() => setCurrentView('list')} />;
      case 'form':
        return <AssessmentForm 
                  onSave={handleSaveAssessment} 
                  existingStudentName={selectedStudent?.name}
                  onBack={selectedStudent ? handleBackToHistory : handleBackToList}
                />;
      case 'history':
        return selectedStudent && <StudentHistory 
                                      student={selectedStudent} 
                                      onAddAssessment={handleAddAssessmentForStudent}
                                      onBack={handleBackToList}
                                    />;
      case 'result':
        return latestAssessment && <ResultDisplay 
                                      result={latestAssessment.result} 
                                      onReset={handleBackToHistory}
                                      studentName={latestAssessment.data.nome}
                                      buttonText="Voltar para o Histórico"
                                    />
      case 'list':
      default:
        return <StudentList 
                  students={students} 
                  onSelectStudent={handleSelectStudent} 
                  onAddStudent={handleAddNewStudent} 
                />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        {currentView !== 'home' && <Header />}
        {renderContent()}
      </div>
       {currentView !== 'home' && (
         <footer className="text-center text-gray-500 mt-12 text-sm">
            <p>&copy; {new Date().getFullYear()} Academia Videira. Todos os direitos reservados.</p>
            <p>Análise gerada por IA. Consulte sempre um profissional.</p>
        </footer>
      )}
    </div>
  );
};

export default App;