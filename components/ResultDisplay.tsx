import React, { useState, useRef, useEffect } from 'react';
import { AnalysisResult, AnalysisMetric, DietPlan, StudentData, Assessment, ComparativeChange, ActionPlan } from '../types';
import { ArrowUturnLeftIcon, DocumentArrowDownIcon, SparklesIcon, ExclamationTriangleIcon, ClipboardDocumentListIcon, ArrowUpIcon, ArrowDownIcon, ArrowsRightLeftIcon, ScaleIcon, FlagIcon, CalendarDaysIcon } from './icons';
import Loader from './Loader';
import PrintableSingleReport from './PrintableSingleReport';

// Declara as bibliotecas globais carregadas via CDN no index.html
declare const html2canvas: any;
declare const jspdf: any;

interface ResultDisplayProps {
  result: AnalysisResult;
  onReset: () => void;
  studentName: string;
  studentData: StudentData; // Adicionado para personalização
  buttonText: string;
}

const getObjetivoText = (objetivo: StudentData['objetivo']): string => {
  switch(objetivo) {
    case 'perder_peso': return 'Perda de Peso';
    case 'ganhar_massa': return 'Ganho de Massa Muscular';
    case 'manter': return 'Manutenção de Peso';
    case 'definicao_muscular': return 'Definição Muscular';
    case 'melhorar_resistencia': return 'Melhorar Resistência';
    case 'saude_geral': return 'Saúde e Bem-estar Geral';
    default: return 'Não definido';
  }
};

const getStatusClasses = (status: string) => {
  switch (status) {
    case 'bom':
      return 'bg-green-500 text-green-900';
    case 'atencao':
      return 'bg-yellow-500 text-yellow-900';
    case 'melhorar':
      return 'bg-red-500 text-red-900';
    default:
      return 'bg-gray-500 text-gray-900';
  }
};

const MetricCard: React.FC<{ metric: AnalysisMetric }> = ({ metric }) => (
  <div className="bg-gray-700/50 p-4 rounded-lg">
    <div className="flex justify-between items-start">
      <h4 className="font-bold text-white">{metric.metric}</h4>
      <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase ${getStatusClasses(metric.status)}`}>
        {metric.status}
      </span>
    </div>
    <p className="text-2xl font-semibold text-green-400 mt-1">{metric.value}</p>
    <p className="text-sm text-gray-400 mt-2">
      <strong>Ideal:</strong> {metric.idealRange}
    </p>
    <p className="text-sm text-gray-300 mt-2">{metric.assessment}</p>
  </div>
);

const AnalysisSection: React.FC<{ title: string; items: string[]; icon: React.ReactNode; iconBgColor: string }> = ({ title, items, icon, iconBgColor }) => (
  <div className="bg-gray-700/50 p-5 rounded-lg">
    <h4 className="font-bold text-white flex items-center mb-3">
      <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${iconBgColor}`}>
        {icon}
      </span>
      {title}
    </h4>
    <ul className="space-y-2 text-gray-300 list-inside pl-2">
      {items.map((item, index) => (
        <li key={index} className="flex items-start">
            <span className="text-green-400 mr-2 mt-1">&#8227;</span>
            <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

const DietPlanDisplay: React.FC<{ plan: DietPlan }> = ({ plan }) => (
  <div className="bg-gray-800 rounded-xl p-6 md:p-8 shadow-2xl border border-green-500/20">
    <h3 className="text-2xl font-bold text-green-400 mb-6">{plan.title}</h3>
    <div className="space-y-6">
      {plan.meals.map((meal) => {
        const isOptional = meal.name.toLowerCase().includes('opcional');
        const mealName = meal.name.replace(/\(opcional\)/i, '').trim();

        return (
          <div key={meal.name} className="border-t border-gray-700/50 pt-6 first:border-t-0 first:pt-0">
            <h4 className="text-lg font-semibold text-white flex justify-between items-center">
              <span className="flex items-center gap-2 flex-wrap">
                <span>{mealName}</span>
                {isOptional && <span className="text-xs font-medium bg-gray-600 text-gray-300 px-2 py-0.5 rounded-full">Opcional</span>}
              </span>
              {meal.time && <span className="text-sm font-normal text-gray-400">{meal.time}</span>}
            </h4>
            <div className="mt-4 space-y-3 text-gray-300">
              {meal.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start">
                  <span className="bg-green-900/70 text-green-300 text-xs font-bold mr-3 px-2 py-1 rounded-full whitespace-nowrap">{`Opção ${index + 1}`}</span>
                  <span className="flex-1">{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
    <p className="mt-8 text-xs text-center text-gray-500 italic">{plan.disclaimer}</p>
  </div>
);

const ComparativeChangeCard: React.FC<{ change: ComparativeChange }> = ({ change }) => {
    const statusInfo = {
        positive: { icon: <ArrowUpIcon className="w-5 h-5"/>, color: 'text-green-400', ring: 'ring-green-500/50' },
        negative: { icon: <ArrowDownIcon className="w-5 h-5"/>, color: 'text-red-400', ring: 'ring-red-500/50' },
        neutral: { icon: <ArrowsRightLeftIcon className="w-5 h-5"/>, color: 'text-gray-400', ring: 'ring-gray-500/50' },
    }[change.status];

    return (
        <div className="bg-gray-700/50 p-4 rounded-lg ring-1 ring-gray-600/50">
            <h4 className="font-bold text-white">{change.metric}</h4>
            <div className="flex items-end gap-4 mt-2">
                <div className="flex-1">
                    <p className="text-xs text-gray-400">Anterior</p>
                    <p className="text-lg font-medium text-gray-300">{change.previousValue}</p>
                </div>
                <div className="flex-1">
                    <p className="text-xs text-gray-400">Atual</p>
                    <p className="text-xl font-semibold text-white">{change.currentValue}</p>
                </div>
                <div className={`flex items-center gap-2 font-bold text-lg ${statusInfo.color}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-800 ring-2 ${statusInfo.ring}`}>
                        {statusInfo.icon}
                    </div>
                    <span>{change.change}</span>
                </div>
            </div>
            <p className="text-sm text-gray-300 mt-3 pt-3 border-t border-gray-600/50">{change.assessment}</p>
        </div>
    );
};

const ActionPlanDisplay: React.FC<{ plan: ActionPlan }> = ({ plan }) => (
    <div className="bg-gray-800 rounded-xl p-6 md:p-8 shadow-2xl border border-yellow-500/20">
        <h3 className="text-2xl font-bold text-yellow-400 mb-2 flex items-center">
            <FlagIcon className="w-6 h-6 mr-3" />
            Seu Plano de Ação - Próximos 60 Dias
        </h3>
        <div className="text-center bg-gray-700/50 p-4 rounded-lg mb-6">
            <p className="text-gray-300">Próxima Avaliação Recomendada:</p>
            <p className="text-xl font-bold text-white flex items-center justify-center gap-2 mt-1">
                <CalendarDaysIcon className="w-5 h-5" />
                {plan.nextAssessmentDate}
            </p>
        </div>
        
        <div className="space-y-4">
            {plan.focusAreas.map((area, index) => (
                <div key={index} className="bg-gray-700/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-white text-lg">{area.title}</h4>
                    <ul className="mt-2 space-y-2 text-gray-300 list-inside pl-2">
                        {area.goals.map((goal, goalIndex) => (
                             <li key={goalIndex} className="flex items-start">
                                <span className="text-yellow-400 mr-3 mt-1">&#10148;</span>
                                <span>{goal}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>

        <p className="mt-6 text-center text-gray-300 italic bg-gray-900/30 p-4 rounded-lg">
            "{plan.motivationalMessage}"
        </p>
    </div>
);


const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onReset, studentName, studentData, buttonText }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showPrintableReport, setShowPrintableReport] = useState(false);
  const printableRef = useRef<HTMLDivElement>(null);

  const currentAssessmentForPdf: Assessment = {
    id: `pdf_${new Date().getTime()}`,
    date: new Date().toISOString(),
    data: studentData,
    result: result,
  };
  
  const generatePdf = async () => {
    if (!printableRef.current) return;

    try {
      const { jsPDF } = jspdf;
      const reportElement = printableRef.current;
      
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#111827',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      
      const imgHeightInPdf = pdfWidth / ratio;
      let heightLeft = imgHeightInPdf;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
      heightLeft -= pdfPageHeight;

      while (heightLeft > 0) {
        position -= pdfPageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
        heightLeft -= pdfPageHeight;
      }
      
      pdf.save(`Analise-${studentName.replace(/ /g, '_')}.pdf`);

    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Ocorreu um erro ao gerar o PDF. Tente novamente.");
    } finally {
        setIsGeneratingPdf(false);
        setShowPrintableReport(false);
    }
  };
  
  useEffect(() => {
    if (showPrintableReport && printableRef.current) {
      setTimeout(() => {
        generatePdf();
      }, 500);
    }
  }, [showPrintableReport]);

  const handleSavePdf = () => {
    if (!isGeneratingPdf) {
      setIsGeneratingPdf(true);
      setShowPrintableReport(true);
    }
  };

  return (
    <>
      {showPrintableReport && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -1 }}>
          <PrintableSingleReport ref={printableRef} assessment={currentAssessmentForPdf} />
        </div>
      )}

      <div className="animate-fade-in space-y-8">
        <div className="bg-gray-800 rounded-xl p-6 md:p-8 shadow-2xl border border-green-500/20">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-bold text-green-400">Relatório de Bioimpedância</h2>
               <div className="text-sm text-gray-400 mt-1 flex items-center gap-x-4 flex-wrap">
                  {studentData.assessmentDate && (
                      <span>Data: <span className="font-semibold text-gray-300">{new Date(studentData.assessmentDate).toLocaleDateString('pt-BR')}</span></span>
                  )}
                  {studentData.instructorName && (
                      <span className="sm:border-l border-gray-600 sm:pl-4">Avaliador: <span className="font-semibold text-gray-300">{studentData.instructorName}</span></span>
                  )}
              </div>
              <p className="text-gray-400 mt-4 max-w-2xl">
                Olá, <span className="font-semibold text-white">{studentName}</span>. Este relatório é uma fotografia do seu estado atual, 
                uma ferramenta poderosa para guiar sua jornada, <strong className="text-yellow-400">e não um julgamento</strong>. 
                A análise da IA considerou seu perfil completo — sua idade, altura, objetivo de <strong className="text-white">"{getObjetivoText(studentData.objetivo)}"</strong> e dados de bioimpedância — para criar uma visão detalhada e personalizada. 
                Use estas informações como um mapa para alcançar seus melhores resultados.
              </p>
            </div>
            <div className="no-pdf flex items-center gap-2 flex-wrap justify-start sm:justify-end">
              <button
                  onClick={handleSavePdf}
                  disabled={isGeneratingPdf}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-wait text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition duration-300"
                >
                  {isGeneratingPdf ? <Loader /> : (
                    <>
                      <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                      Salvar PDF
                    </>
                  )}
              </button>
              <button
                onClick={onReset}
                className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition duration-300"
              >
                <ArrowUturnLeftIcon className="w-5 h-5 mr-2" />
                {buttonText}
              </button>
            </div>
          </div>
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <p className="text-gray-300">{result.summary}</p>
          </div>
        </div>
        
        {result.comparativeAnalysis && (
            <div className="bg-gray-800 rounded-xl p-6 md:p-8 shadow-2xl border border-blue-500/20">
                <h3 className="text-2xl font-bold text-blue-400 mb-4 flex items-center">
                    <ScaleIcon className="w-6 h-6 mr-3" />
                    Análise Comparativa de Progresso
                </h3>
                <p className="text-gray-300 bg-gray-700/50 p-4 rounded-lg mb-6">{result.comparativeAnalysis.summary}</p>
                <div className="space-y-4">
                    {result.comparativeAnalysis.changes.map((change, index) => (
                        <ComparativeChangeCard key={index} change={change} />
                    ))}
                </div>
            </div>
        )}

        <div className="bg-gray-800 rounded-xl p-6 md:p-8 shadow-2xl border border-green-500/20">
          <h3 className="text-2xl font-bold text-green-400 mb-4">Métricas Detalhadas (Avaliação Atual)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.analysis.map((metric, index) => (
              <MetricCard key={index} metric={metric} />
            ))}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 md:p-8 shadow-2xl border border-green-500/20">
          <h3 className="text-2xl font-bold text-green-400 mb-4">Análise Completa da IA</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AnalysisSection 
              title="Pontos Fortes"
              items={result.strengths}
              icon={<SparklesIcon className="w-5 h-5 text-yellow-300" />}
              iconBgColor="bg-yellow-500/30"
            />
            <AnalysisSection 
              title="Pontos a Melhorar"
              items={result.areasForImprovement}
              icon={<ExclamationTriangleIcon className="w-5 h-5 text-orange-300" />}
              iconBgColor="bg-orange-500/30"
            />
            <AnalysisSection 
              title="Recomendações da IA"
              items={result.recommendations}
              icon={<ClipboardDocumentListIcon className="w-5 h-5 text-sky-300" />}
              iconBgColor="bg-sky-500/30"
            />
          </div>
        </div>

        {result.actionPlan && <ActionPlanDisplay plan={result.actionPlan} />}

        <DietPlanDisplay plan={result.dietPlan} />
      </div>
    </>
  );
};

export default ResultDisplay;