export interface StudentData {
  nome: string;
  idade: number;
  altura: number;
  peso: number;
  sexo: 'masculino' | 'feminino';
  percentualGordura: number;
  massaMuscular: number;
  gorduraVisceral: number;
  aguaCorporal: number;
  taxaMetabolicaBasal: number;
  objetivo: 'perder_peso' | 'ganhar_massa' | 'manter' | 'definicao_muscular' | 'melhorar_resistencia' | 'saude_geral';
  nivelAtividade?: 'sedentario' | 'leve' | 'moderado' | 'ativo' | 'muito_ativo';
  condicoesSaude?: string;
  restricoesMedicas?: string;
  suplementos?: string;
}

export type AnalysisStatus = 'bom' | 'atencao' | 'melhorar';

export interface AnalysisMetric {
  metric: string;
  value: string;
  idealRange: string;
  assessment: string;
  status: AnalysisStatus;
}

export interface Meal {
  name: string;
  time: string;
  suggestions: string[];
}

export interface DietPlan {
  title: string;
  meals: Meal[];
  disclaimer: string;
}

export interface ComparativeChange {
  metric: string;
  previousValue: string;
  currentValue: string;
  change: string;
  assessment: string;
  status: 'positive' | 'negative' | 'neutral';
}

export interface ComparativeAnalysis {
  summary: string;
  changes: ComparativeChange[];
}


export interface AnalysisResult {
  summary: string;
  analysis: AnalysisMetric[];
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  dietPlan: DietPlan;
  comparativeAnalysis?: ComparativeAnalysis;
}

export interface Assessment {
  id: string;
  date: string;
  data: StudentData;
  result: AnalysisResult;
}

export interface Student {
  id: string;
  name: string;
  password?: string;
  idade?: number;
  altura?: number;
  sexo?: 'masculino' | 'feminino';
  objetivo: StudentData['objetivo'];
  nivelAtividade?: 'sedentario' | 'leve' | 'moderado' | 'ativo' | 'muito_ativo';
  condicoesSaude?: string;
  restricoesMedicas?: string;
  suplementos?: string;
  assessments: Assessment[];
}

export interface CurrentUser {
  id?: string; // Opcional, apenas para alunos
  name: string;
  role: 'admin' | 'client';
}