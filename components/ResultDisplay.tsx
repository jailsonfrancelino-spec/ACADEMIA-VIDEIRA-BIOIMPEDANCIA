import React, { useRef, useState } from 'react';
import { AnalysisResult, AnalysisStatus } from '../types';
import { ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, ArrowUturnLeftIcon, ArrowDownTrayIcon } from './icons';
import Loader from './Loader';

// Declaração para o TypeScript reconhecer as bibliotecas globais
declare const html2canvas: any;
declare const jspdf: any;

interface ResultDisplayProps {
  result: AnalysisResult;
  onReset: () => void;
  studentName: string;
  buttonText?: string;
}

const statusStyles: { [key in AnalysisStatus]: { bg: string; text: string; icon: React.ReactNode } } = {
  bom: { bg: 'bg-gradient-to-br from-green-900/60 to-gray-800/20 border-green-500/60', text: 'text-green-300', icon: <CheckCircleIcon className="w-6 h-6" /> },
  atencao: { bg: 'bg-gradient-to-br from-yellow-900/60 to-gray-800/20 border-yellow-500/60', text: 'text-yellow-300', icon: <ExclamationTriangleIcon className="w-6 h-6" /> },
  melhorar: { bg: 'bg-gradient-to-br from-red-900/60 to-gray-800/20 border-red-500/60', text: 'text-red-300', icon: <InformationCircleIcon className="w-6 h-6" /> },
};

const StatusLegend: React.FC = () => (
  <div className="bg-gray-800 rounded-xl p-4 mb-8 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 border border-gray-700">
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-green-500 to-green-400"></div>
      <span className="text-sm text-gray-300">Bom</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-400"></div>
      <span className="text-sm text-gray-300">Atenção</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-500 to-red-400"></div>
      <span className="text-sm text-gray-300">Melhorar</span>
    </div>
  </div>
);


const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onReset, studentName, buttonText = "Analisar Outro Aluno" }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isSavingPdf, setIsSavingPdf] = useState(false);

  const handleSavePdf = () => {
    if (!reportRef.current) return;
    setIsSavingPdf(true);

    const { jsPDF } = jspdf;

    html2canvas(reportRef.current, { 
      backgroundColor: '#111827', // bg-gray-900
      scale: 2, // Aumenta a resolução
      useCORS: true 
    }).then((canvas: any) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      
      let imgHeight = pdfWidth / ratio;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`analise-${studentName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    }).catch((err: any) => {
      console.error("Error generating PDF:", err);
      alert("Ocorreu um erro ao gerar o PDF. Tente novamente.");
    }).finally(() => {
      setIsSavingPdf(false);
    });
  };

  return (
    <div className="animate-fade-in">
      <div ref={reportRef} className="space-y-8 p-1">
        <div className="bg-gray-800 rounded-xl p-6 md:p-8 shadow-2xl border border-green-500/20">
          <h2 className="text-3xl font-bold text-green-400 mb-4">Análise Completa para {studentName || 'o Aluno'}</h2>
          <p className="text-gray-300 text-lg">{result.summary}</p>
        </div>

        <StatusLegend />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {result.analysis.map((item, index) => {
            const style = statusStyles[item.status] || statusStyles.atencao;
            return (
              <div key={index} className={`rounded-xl p-5 shadow-lg border ${style.bg} flex flex-col`}>
                <div className={`flex items-center gap-3 mb-3 ${style.text}`}>
                  {style.icon}
                  <h3 className="text-lg font-semibold">{item.metric}</h3>
                </div>
                <p className="text-3xl font-bold text-white">{item.value}</p>
                <p className="text-sm text-gray-400 mt-1">Ideal: {item.idealRange}</p>
                <p className="mt-4 text-gray-300 flex-grow">{item.assessment}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-gray-800 rounded-xl p-6 md:p-8 shadow-2xl border border-green-500/20">
          <h3 className="text-2xl font-bold text-green-400 mb-5">{result.dietPlan.title}</h3>
          <div className="space-y-4">
            {result.dietPlan.meals.map((meal, index) => (
              <div key={index} className="border-b border-gray-700 pb-3 last:border-b-0">
                <p className="font-semibold text-white">{meal.name}</p>
                <ul className="list-inside text-gray-400 mt-1 space-y-1">
                  {meal.suggestions.map((suggestion, sIndex) => (
                    <li key={sIndex}><strong className="text-gray-300">Opção {sIndex + 1}:</strong> {suggestion}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-yellow-400 bg-yellow-900/50 p-3 rounded-lg">{result.dietPlan.disclaimer}</p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
        <button
          onClick={onReset}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center transition duration-300 transform hover:scale-105 w-full sm:w-auto"
        >
          <ArrowUturnLeftIcon className="w-5 h-5 mr-2" />
          {buttonText}
        </button>
        <button
          onClick={handleSavePdf}
          disabled={isSavingPdf}
          className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center transition duration-300 transform hover:scale-105 w-full sm:w-auto"
        >
          {isSavingPdf ? <Loader /> : <ArrowDownTrayIcon className="w-5 h-5 mr-2" />}
          {isSavingPdf ? 'Gerando PDF...' : 'Salvar em PDF'}
        </button>
      </div>
    </div>
  );
};

export default ResultDisplay;