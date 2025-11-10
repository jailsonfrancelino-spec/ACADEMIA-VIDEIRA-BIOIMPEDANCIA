import React, { forwardRef } from 'react';
import { Student, AnalysisMetric, DietPlan, ComparativeChange } from '../types';
import { SparklesIcon, ExclamationTriangleIcon, ClipboardDocumentListIcon, ArrowUpIcon, ArrowDownIcon, ArrowsRightLeftIcon } from './icons';

// --- Sub-componentes reutilizados de ResultDisplay ---

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

const ComparativeChangeCard: React.FC<{ change: ComparativeChange }> = ({ change }) => {
    const statusInfo = {
        positive: { icon: <ArrowUpIcon className="w-5 h-5"/>, color: 'text-green-400', ring: 'ring-green-500/50' },
        negative: { icon: <ArrowDownIcon className="w-5 h-5"/>, color: 'text-red-400', ring: 'ring-red-500/50' },
        neutral: { icon: <ArrowsRightLeftIcon className="w-5 h-5"/>, color: 'text-gray-400', ring: 'ring-gray-500/50' },
    }[change.status];

    return (
        <div className="bg-gray-700/50 p-4 rounded-lg ring-1 ring-gray-600/50 break-inside-avoid">
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
  <div className="mt-6">
    <h3 className="text-2xl font-bold text-white mb-6">{plan.title}</h3>
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

// --- Componente Principal do Relatório ---

interface PrintableReportProps {
  student: Student;
}

const PrintableReport = forwardRef<HTMLDivElement, PrintableReportProps>(({ student }, ref) => {
  // Ordena as avaliações da mais antiga para a mais recente para o relatório
  const sortedAssessments = [...student.assessments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div ref={ref} className="bg-gray-900 text-gray-300" style={{ width: '1124px', padding: '40px' }}>
      
      {/* Página de Título */}
      <div className="printable-card-wrapper mb-8 p-8 bg-gray-800 rounded-xl" style={{ border: '1px solid #4ade80' }}>
        <h1 className="text-5xl font-extrabold text-green-400">Relatório de Progresso Completo</h1>
        <h2 className="text-4xl font-bold text-white mt-4">{student.name}</h2>
        <p className="text-lg text-gray-400 mt-6">
          Este relatório contém um histórico detalhado de todas as avaliações de bioimpedância realizadas.
        </p>
        <p className="text-md text-gray-500 mt-2">Data de Geração: {new Date().toLocaleDateString('pt-BR')}</p>
      </div>

      {/* Páginas de Avaliação */}
      {sortedAssessments.map(assessment => (
        <div key={assessment.id} className="printable-card-wrapper mb-8 p-8 bg-gray-800 rounded-xl break-inside-avoid">
          <div className="mb-6 border-b border-gray-700 pb-6">
            <h2 className="text-3xl font-bold text-green-400">
              Avaliação de {new Date(assessment.date).toLocaleDateString('pt-BR')}
            </h2>
            <div className="bg-gray-700/50 p-4 rounded-lg mt-4">
                <p className="text-gray-300">{assessment.result.summary}</p>
            </div>
          </div>

          {assessment.result.comparativeAnalysis && (
            <div className="mb-8">
                <h3 className="text-2xl font-bold text-blue-400 mb-4">Análise Comparativa de Progresso</h3>
                <p className="text-gray-300 bg-gray-700/50 p-4 rounded-lg mb-6">{assessment.result.comparativeAnalysis.summary}</p>
                <div className="space-y-4">
                    {assessment.result.comparativeAnalysis.changes.map((change, index) => (
                        <ComparativeChangeCard key={index} change={change} />
                    ))}
                </div>
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Métricas Detalhadas (Avaliação Atual)</h3>
            <div className="grid grid-cols-3 gap-4">
              {assessment.result.analysis.map((metric, index) => (
                <MetricCard key={index} metric={metric} />
              ))}
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Análise Completa da IA</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AnalysisSection 
                title="Pontos Fortes"
                items={assessment.result.strengths}
                icon={<SparklesIcon className="w-5 h-5 text-yellow-300" />}
                iconBgColor="bg-yellow-500/30"
              />
              <AnalysisSection 
                title="Pontos a Melhorar"
                items={assessment.result.areasForImprovement}
                icon={<ExclamationTriangleIcon className="w-5 h-5 text-orange-300" />}
                iconBgColor="bg-orange-500/30"
              />
              <AnalysisSection 
                title="Recomendações da IA"
                items={assessment.result.recommendations}
                icon={<ClipboardDocumentListIcon className="w-5 h-5 text-sky-300" />}
                iconBgColor="bg-sky-500/30"
              />
            </div>
          </div>

          <DietPlanDisplay plan={assessment.result.dietPlan} />
        </div>
      ))}
    </div>
  );
});

export default PrintableReport;