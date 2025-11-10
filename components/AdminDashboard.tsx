import React, { useState } from 'react';
import { Student, StudentData, Assessment, AnalysisResult } from '../types';
import { analyzeBioimpedance } from '../services/geminiService';
import StudentList from './StudentList';
import AssessmentForm from './AssessmentForm';
import StudentHistory from './StudentHistory';
import ResultDisplay from './ResultDisplay';
import EditStudentForm from './EditStudentForm';

type View = 'list' | 'form' | 'history' | 'result' | 'edit_student';

interface AdminDashboardProps {
  students: Student[];
  onStudentsChange: (updatedStudents: Student[]) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ students, onStudentsChange }) => {
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [latestAssessment, setLatestAssessment] = useState<Assessment | null>(null);
  
  const handleSelectStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setSelectedStudent(student);
      setCurrentView('history');
    }
  };

  const handleAddNewStudent = () => {
    setSelectedStudent(null);
    setCurrentView('form');
  };
  
  const handleAddAssessmentForStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
     if (student) {
      setSelectedStudent(student);
      setCurrentView('form');
    }
  }

  const handleEditStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setSelectedStudent(student);
      setCurrentView('edit_student');
    }
  };

  const handleUpdateStudent = (studentId: string, updatedData: Partial<Student>) => {
    const updatedStudents = students.map(s =>
      s.id === studentId ? { ...s, ...updatedData } : s
    );
    onStudentsChange(updatedStudents);
    const reselectedStudent = updatedStudents.find(s => s.id === studentId);
    if (reselectedStudent) {
        setSelectedStudent(reselectedStudent);
    }
    setCurrentView('history');
  };

  const handleSaveAssessment = async (assessmentData: StudentData, analysisResult: AnalysisResult) => {
    const newAssessment: Assessment = {
      id: `ass_${new Date().getTime()}`,
      date: new Date().toISOString(),
      data: assessmentData,
      result: analysisResult,
    };

    let updatedStudents;
    const studentForUpdate = students.find(s => s.name.toLowerCase() === assessmentData.nome.toLowerCase());
    const isNewStudent = !studentForUpdate;
    
    // Passar a avaliação anterior para a análise da IA, se existir
    const previousAssessmentData = studentForUpdate?.assessments?.[0]?.data;
    const result = await analyzeBioimpedance(assessmentData, previousAssessmentData);
    newAssessment.result = result;

    if (isNewStudent) {
        // Esta lógica é principalmente para o caso de admin criar um aluno diretamente pelo form de avaliação
        const newStudent: Student = {
            id: `stu_${new Date().getTime()}`,
            name: assessmentData.nome,
            assessments: [newAssessment],
            idade: assessmentData.idade,
            altura: assessmentData.altura,
            sexo: assessmentData.sexo,
            objetivo: assessmentData.objetivo,
            nivelAtividade: assessmentData.nivelAtividade,
            condicoesSaude: assessmentData.condicoesSaude,
            restricoesMedicas: assessmentData.restricoesMedicas,
            suplementos: assessmentData.suplementos,
        };
        updatedStudents = [...students, newStudent];
    } else {
        updatedStudents = students.map(s => 
            s.id === studentForUpdate.id
            ? { 
                ...s, 
                // Atualiza o perfil principal do aluno com os dados do formulário
                idade: assessmentData.idade,
                altura: assessmentData.altura,
                sexo: assessmentData.sexo,
                objetivo: assessmentData.objetivo,
                nivelAtividade: assessmentData.nivelAtividade,
                condicoesSaude: assessmentData.condicoesSaude,
                restricoesMedicas: assessmentData.restricoesMedicas,
                suplementos: assessmentData.suplementos,
                assessments: [...s.assessments, newAssessment].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) 
              }
            : s
        );
    }
    
    onStudentsChange(updatedStudents);
    setLatestAssessment(newAssessment);
    
    const updatedStudent = updatedStudents.find(s => s.name.toLowerCase() === assessmentData.nome.toLowerCase());

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
      case 'form':
        // A função onSave agora está quebrada. Ela espera 2 argumentos, mas a lógica de chamada da IA foi movida para dentro do handleSaveAssessment.
        // Vamos simplificar e passar apenas os dados do formulário. A IA será chamada dentro do handleSaveAssessment.
        const simplifiedOnSave = (data: StudentData) => {
            // A chamada de `analyzeBioimpedance` e a criação do `AnalysisResult` agora acontecem dentro do `handleSaveAssessment`
            handleSaveAssessment(data, {} as AnalysisResult); // Passa um objeto vazio, pois será regerado
        };

        return <AssessmentForm 
                  onSave={(studentData) => handleSaveAssessment(studentData, {} as AnalysisResult)} // Correção aqui
                  student={selectedStudent}
                  onBack={selectedStudent ? handleBackToHistory : handleBackToList}
                />;
      case 'history':
        return selectedStudent && <StudentHistory 
                                      student={selectedStudent} 
                                      onAddAssessment={handleAddAssessmentForStudent}
                                      onEdit={handleEditStudent}
                                      onBack={handleBackToList}
                                    />;
      case 'result':
        return latestAssessment && <ResultDisplay 
                                      result={latestAssessment.result} 
                                      onReset={handleBackToHistory}
                                      studentName={latestAssessment.data.nome}
                                      studentData={latestAssessment.data}
                                      buttonText="Voltar para o Histórico"
                                    />
      case 'edit_student':
        return selectedStudent && <EditStudentForm 
                                      student={selectedStudent} 
                                      onSave={handleUpdateStudent}
                                      onCancel={handleBackToHistory}
                                      students={students}
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

  return <>{renderContent()}</>;
};

export default AdminDashboard;