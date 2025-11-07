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
  suggestions: string[];
}

export interface DietPlan {
  title: string;
  meals: Meal[];
  disclaimer: string;
}

export interface AnalysisResult {
  summary: string;
  analysis: AnalysisMetric[];
  dietPlan: DietPlan;
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
  assessments: Assessment[];
}