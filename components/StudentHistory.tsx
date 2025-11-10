import React, { useState, useRef, useEffect } from 'react';
import { Student, Assessment } from '../types';
import { ArrowUturnLeftIcon, ChartBarIcon, DocumentTextIcon, DocumentArrowDownIcon, ExclamationTriangleIcon, CalendarDaysIcon, PencilIcon } from './icons';
import ProgressChart from './ProgressChart';
import ResultDisplay from './ResultDisplay';
import Loader from './Loader';
import PrintableReport from './PrintableReport';

// Declara as bibliotecas globais carregadas via CDN no index.html
declare const html2canvas: any;
declare const jspdf: any;


interface StudentHistoryProps {
  student: Student;
  onAddAssessment: (studentId: string) => void;
  onEdit: (studentId: string) => void;
  onBack: () => void;
  isClientView?: boolean;
}

const StudentHistory: React.FC<StudentHistoryProps> = ({ student, onAddAssessment, onEdit, onBack, isClientView = false }) => {
  const [viewingAssessment, setViewingAssessment] = useState<Assessment | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showPrintableReport, setShowPrintableReport] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleGenerateFullReport = async () => {
    if (!reportRef.current) return;
    
    // A geração já começou, então o estado já é true.
    // O botão fica desabilitado.

    try {
      const { jsPDF } = jspdf;
      const reportElement = reportRef.current;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pdfWidth - margin * 2;
      let yPos = margin;

      // Seleciona todos os 'cards' de conteúdo direto do elemento de referência
      const elementsToPrint = Array.from(reportElement.children) as HTMLElement[];

      for (const element of elementsToPrint) {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#111827',
        });

        const imgData = canvas.toDataURL('image/png');
        const imgHeight = (canvas.height * contentWidth) / canvas.width;

        if (yPos + imgHeight > pdfHeight - margin && yPos > margin) {
          pdf.addPage();
          yPos = margin;
        }

        pdf.addImage(imgData, 'PNG', margin, yPos, contentWidth, imgHeight);
        yPos += imgHeight + 10;
      }
      
      pdf.save(`Relatorio_Completo-${student.name.replace(/ /g, '_')}.pdf`);

    } catch (error) {
        console.error("Error generating full report PDF:", error);
        alert("Ocorreu um erro ao gerar o relatório completo. Tente novamente.");
    } finally {
        setIsGeneratingReport(false);
        setShowPrintableReport(false);
    }
  };

  useEffect(() => {
    if (showPrintableReport && reportRef.current) {
      setIsGeneratingReport(true);
      // Use um timeout para garantir que o componente off-screen tenha tempo de renderizar com todos os estilos.
      setTimeout(() => {
        handleGenerateFullReport();
      }, 500);
    }
  }, [showPrintableReport]);

  const ReassessmentNotification = () => {
    if (!student.assessments || student.assessments.length === 0) {
      return null;
    }

    const latestAssessment = student.assessments[0];
    const lastDate = new Date(latestAssessment.date);
    const today = new Date();
    const timeDiff = today.getTime() - lastDate.getTime();
    const daysSinceLast = Math.floor(timeDiff / (1000 * 3600 * 24));

    if (daysSinceLast > 60) {
      return (
        <div className="bg-yellow-800/50 border border-yellow-600 text-yellow-300 p-4 rounded-lg flex items-start gap-4">
          <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-bold">Atenção: Acompanhamento Desatualizado</h4>
            <p className="text-sm mt-1">
              A última avaliação foi realizada há <strong>{daysSinceLast} dias</strong>. Para um controle eficaz do progresso, recomendamos realizar uma nova avaliação a cada 60 dias.
              {!isClientView && " Utilize o botão 'Nova Avaliação' para atualizar os dados do aluno."}
              {isClientView && " Peça ao seu instrutor para agendar uma nova análise."}
            </p>
          </div>
        </div>
      );
    }

    const daysUntilNext = 60 - daysSinceLast;
    return (
        <div className="bg-sky-900/50 border border-sky-700 text-sky-300 p-4 rounded-lg flex items-start gap-4">
            <CalendarDaysIcon className="w-6 h-6 text-sky-400 mt-1 flex-shrink-0" />
            <div>
                 <h4 className="font-bold">Tudo Certo com o Acompanhamento!</h4>
                 <p className="text-sm mt-1">
                    A última avaliação foi há <strong>{daysSinceLast}</strong> {daysSinceLast === 1 ? 'dia' : 'dias'}. Próxima reavaliação recomendada em <strong>{daysUntilNext}</strong> {daysUntilNext === 1 ? 'dia' : 'dias'}.
                 </p>
            </div>
        </div>
    );
  }

  if (viewingAssessment) {
    return (
      <ResultDisplay
        result={viewingAssessment.result}
        onReset={() => setViewingAssessment(null)}
        studentName={viewingAssessment.data.nome}
        studentData={viewingAssessment.data}
        buttonText="Voltar para o Histórico"
      />
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
       {/* Componente de renderização off-screen para o relatório completo */}
      {showPrintableReport && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -1 }}>
          <PrintableReport ref={reportRef} student={student} />
        </div>
      )}

      <div className="bg-gray-800 rounded-xl p-6 md:p-8 shadow-2xl border border-green-500/20">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            {!isClientView && (
              <button onClick={onBack} className="text-sm text-gray-400 hover:text-white transition flex items-center mb-2">
                <ArrowUturnLeftIcon className="w-4 h-4 mr-2" />
                Voltar para a Lista
              </button>
            )}
            <h2 className="text-3xl font-bold text-green-400">{student.name}</h2>
            <p className="text-gray-400">Histórico de Progresso</p>
          </div>
          {!isClientView && (
             <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setShowPrintableReport(true)}
                  disabled={isGeneratingReport}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-wait text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition duration-300 w-full sm:w-auto"
                >
                  {isGeneratingReport ? <Loader /> : (
                    <>
                      <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                      Exportar Relatório
                    </>
                  )}
                </button>
                <button
                  onClick={() => onEdit(student.id)}
                  className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition duration-300 w-full sm:w-auto"
                >
                  <PencilIcon className="w-5 h-5 mr-2" />
                  Editar Perfil
                </button>
                <button
                  onClick={() => onAddAssessment(student.id)}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition duration-300 w-full sm:w-auto"
                >
                  <DocumentTextIcon className="w-5 h-5 mr-2" />
                  Nova Avaliação
                </button>
            </div>
          )}
        </div>
      </div>
      
      <ReassessmentNotification />

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
        {student.assessments.length > 0 ? (
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
        ) : (
           <div className="text-center py-10 px-6 bg-gray-700/50 rounded-lg">
              <h3 className="text-xl font-semibold text-white">Nenhuma avaliação encontrada</h3>
              {isClientView ? (
                <p className="text-gray-400 mt-2">Peça ao seu instrutor para adicionar uma nova avaliação.</p>
              ) : (
                <p className="text-gray-400 mt-2">Clique em "Nova Avaliação" para começar.</p>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentHistory;