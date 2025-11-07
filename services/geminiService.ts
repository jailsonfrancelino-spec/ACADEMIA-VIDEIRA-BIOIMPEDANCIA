import { GoogleGenAI, Type } from "@google/genai";
import { StudentData, AnalysisResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getObjetivoText = (objetivo: StudentData['objetivo']): string => {
  switch(objetivo) {
    case 'perder_peso': return 'Perda de Peso';
    case 'ganhar_massa': return 'Ganho de Massa Muscular';
    case 'manter': return 'Manutenção de Peso';
    case 'definicao_muscular': return 'Definição Muscular';
    case 'melhorar_resistencia': return 'Melhorar Resistência';
    case 'saude_geral': return 'Saúde e Bem-estar Geral';
  }
};

export const analyzeBioimpedance = async (studentData: StudentData): Promise<AnalysisResult> => {
  const model = "gemini-2.5-flash"; 
  const objetivoText = getObjetivoText(studentData.objetivo);

  const prompt = `
    Analise os seguintes dados de um aluno da academia e forneça uma avaliação completa, detalhada e um plano de dieta de exemplo com múltiplas opções.

    **Dados do Aluno:**
    - Nome: ${studentData.nome}
    - Idade: ${studentData.idade} anos
    - Sexo: ${studentData.sexo}
    - Altura: ${studentData.altura} cm
    - Peso: ${studentData.peso} kg
    - Objetivo: ${objetivoText}

    **Dados da Bioimpedância:**
    - Percentual de Gordura Corporal: ${studentData.percentualGordura}%
    - Massa Muscular: ${studentData.massaMuscular} kg
    - Gordura Visceral: Nível ${studentData.gorduraVisceral}
    - Água Corporal: ${studentData.aguaCorporal}%
    - Taxa Metabólica Basal: ${studentData.taxaMetabolicaBasal} kcal

    **Instruções para a Análise:**
    1.  **Calcule o IMC:** Use a fórmula: peso (kg) / (altura (m))^2.
    2.  **Análise Detalhada de Métricas:** Para cada métrica (IMC, Gordura Corporal, Massa Muscular, Gordura Visceral, Água Corporal, TMB), forneça o valor, uma faixa ideal ESPECÍFICA para o perfil do aluno (considerando idade, altura, peso e sexo), e uma avaliação concisa e detalhada. O status deve ser 'bom' (dentro do ideal), 'atencao' (ligeiramente fora), ou 'melhorar' (significativamente fora).
    3.  **Resumo:** Crie um resumo geral e motivacional da avaliação em 2-3 frases.
    4.  **Plano de Dieta (Exemplo):** Elabore um plano de dieta de AMOSTRA com TRÊS SUGESTÕES SIMPLES E DIFERENTES para cada refeição (café da manhã, almoço, jantar e lanches), alinhado com o objetivo do aluno.
    5.  **Aviso Legal:** Inclua um aviso importante sobre a necessidade de consultar um nutricionista.
    6.  **Formato:** Retorne os dados estritamente no formato JSON especificado.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING, description: "Resumo geral da avaliação do aluno em 2-3 frases." },
      analysis: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            metric: { type: Type.STRING },
            value: { type: Type.STRING },
            idealRange: { type: Type.STRING },
            assessment: { type: Type.STRING },
            status: { type: Type.STRING, enum: ['bom', 'atencao', 'melhorar'] }
          },
          required: ['metric', 'value', 'idealRange', 'assessment', 'status']
        }
      },
      dietPlan: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          meals: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                suggestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ['name', 'suggestions']
            }
          },
          disclaimer: { type: Type.STRING }
        },
        required: ['title', 'meals', 'disclaimer']
      }
    },
    required: ['summary', 'analysis', 'dietPlan']
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.5,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as AnalysisResult;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get analysis from Gemini API.");
  }
};