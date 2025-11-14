import React, { useState } from 'react';
import { Student, StudentData, Assessment, AnalysisResult, CurrentUser } from '../types';
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
  user: CurrentUser;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ students, onStudentsChange, user }) => {
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

  const handleSaveAssessment = async (assessmentData: StudentData) => {
    const studentForUpdate = students.find(s => s.name.toLowerCase() === assessmentData.nome.toLowerCase());
    const isNewStudent = !studentForUpdate;
    
    // Pega os dados da avaliação anterior, se existir, para enviar para a IA.
    const previousAssessmentData = studentForUpdate?.assessments?.[0]?.data;
    const analysisResult = await analyzeBioimpedance(assessmentData, previousAssessmentData);

    const dateParts = assessmentData.assessmentDate?.split('-').map(p => parseInt(p, 10));
    // Fallback to current date if date is invalid or not present
    const assessmentDateObject = dateParts && dateParts.length === 3 && dateParts.every(p => !isNaN(p)) 
      ? new Date(dateParts[0], dateParts[1] - 1, dateParts[2]) 
      : new Date();

    const newAssessment: Assessment = {
      id: `ass_${new Date().getTime()}`,
      date: assessmentDateObject.toISOString(),
      data: assessmentData,
      result: analysisResult,
    };

    let updatedStudents;

    if (isNewStudent) {
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
                idade: assessmentData.idade,
                altura: assessmentData.altura,
                sexo: assessmentData.sexo,
                objetivo: assessmentData.objetivo,
                nivelAtividade: assessmentData.nivelAtividade,
                condicoesSaude: assessmentData.condicoesSaude,
                restricoesMedicas: assessmentData.restricoesMedicas,
                suplementos: assessmentData.suplementos,
                assessments: [newAssessment, ...s.assessments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) 
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
        return <AssessmentForm 
                  user={user}
                  onSave={handleSaveAssessment}
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