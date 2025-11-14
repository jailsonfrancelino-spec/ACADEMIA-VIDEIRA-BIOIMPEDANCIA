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

const getNivelAtividadeText = (nivel: StudentData['nivelAtividade']): string => {
    if (!nivel) return '';
    switch(nivel) {
        case 'sedentario': return 'Sedentário (pouco ou nenhum exercício)';
        case 'leve': return 'Levemente ativo (exercício leve 1-3 dias/semana)';
        case 'moderado': return 'Moderadamente ativo (exercício moderado 3-5 dias/semana)';
        case 'ativo': return 'Ativo (exercício intenso 6-7 dias/semana)';
        case 'muito_ativo': return 'Muito Ativo (exercício muito intenso, trabalho físico)';
        default: return '';
    }
}

const getFormattedDateForPrompt = (dateString?: string): string => {
  if (!dateString) return 'hoje';
  
  // Input date string is expected to be in "YYYY-MM-DD" format.
  const dateParts = dateString.split('-').map(p => parseInt(p, 10));
  
  if (dateParts.length !== 3 || dateParts.some(isNaN)) {
    return 'hoje';
  }
  
  // new Date(year, monthIndex, day) treats arguments as local time.
  const dateObject = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
  
  return dateObject.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
};


const generateComparativePrompt = (studentData: StudentData, previousData: StudentData): string => {
  const objetivoText = getObjetivoText(studentData.objetivo);
  const nivelAtividadeText = getNivelAtividadeText(studentData.nivelAtividade);
  const assessmentDateText = getFormattedDateForPrompt(studentData.assessmentDate);

  return `
    Analise a EVOLUÇÃO de um aluno da academia comparando os dados de sua avaliação ATUAL com a ANTERIOR. Forneça uma avaliação HOLÍSTICA, ACIONÁVEL e COMPARATIVA, além de um plano de dieta de exemplo.

    **Perfil do Aluno:**
    - Nome: ${studentData.nome}
    - Idade: ${studentData.idade} anos
    - Sexo: ${studentData.sexo}
    - Altura: ${studentData.altura} cm
    - Objetivo Principal: ${objetivoText}
    ${studentData.instructorName ? `- Avaliador: ${studentData.instructorName}` : ''}
    ${nivelAtividadeText ? `- Nível de Atividade Física: ${nivelAtividadeText}` : ''}
    ${studentData.condicoesSaude ? `- Condições de Saúde: ${studentData.condicoesSaude}` : ''}
    ${studentData.restricoesMedicas ? `- Restrições Médicas: ${studentData.restricoesMedicas}` : ''}
    ${studentData.suplementos ? `- Suplementos Atuais: ${studentData.suplementos}` : ''}

    **Dados da Bioimpedância (Comparativo):**
    | Métrica                  | Avaliação Anterior          | Avaliação Atual             |
    |--------------------------|-----------------------------|-----------------------------|
    | Peso Corporal            | ${previousData.peso.toFixed(1)} kg                  | ${studentData.peso.toFixed(1)} kg                  |
    | Percentual de Gordura    | ${previousData.percentualGordura.toFixed(1)}%                 | ${studentData.percentualGordura.toFixed(1)}%                 |
    | Massa Muscular           | ${previousData.massaMuscular.toFixed(1)} kg               | ${studentData.massaMuscular.toFixed(1)} kg               |
    | Gordura Visceral         | Nível ${previousData.gorduraVisceral}             | Nível ${studentData.gorduraVisceral}             |
    | Água Corporal            | ${previousData.aguaCorporal.toFixed(1)}%                 | ${studentData.aguaCorporal.toFixed(1)}%                 |
    | Taxa Metabólica Basal    | ${previousData.taxaMetabolicaBasal} kcal          | ${studentData.taxaMetabolicaBasal} kcal          |

    **Instruções para a Análise:**
    1.  **Análise Principal (Dados Atuais):** Analise os dados da AVALIAÇÃO ATUAL. Calcule o IMC e, para cada métrica, forneça o valor, a faixa ideal, uma avaliação e o status ('bom', 'atencao', 'melhorar').
    2.  **Análise Comparativa (NOVA SEÇÃO OBRIGATÓRIA):** Crie a seção 'comparativeAnalysis'.
        - **Summary:** Escreva um parágrafo motivacional (2-4 frases) sobre o progresso geral desde a última avaliação. Destaque as vitórias e as áreas que ainda precisam de foco, sempre conectando com o objetivo do aluno.
        - **Changes:** Para cada uma das 6 métricas acima, crie um objeto detalhando: 'metric', 'previousValue', 'currentValue', 'change' (ex: "+1.2 kg" ou "-0.8%"), uma 'assessment' concisa sobre o que essa mudança significa, e um 'status' ('positive', 'negative', 'neutral') baseado na direção da mudança em relação ao objetivo do aluno.
    3.  **Resumo Geral, Pontos Fortes, Pontos a Melhorar, Recomendações:** Essas seções devem ser baseadas nos dados ATUAIS, mas INFLUENCIADAS PELA COMPARAÇÃO. Por exemplo, uma recomendação pode ser "Continue com o plano, pois resultou em um ganho de massa muscular", ou "Vamos ajustar o cardio, pois o percentual de gordura aumentou".
    4.  **Plano de Ação Personalizado (NOVA SEÇÃO OBRIGATÓRIA):** Crie a seção 'actionPlan'.
        - **nextAssessmentDate:** Calcule e forneça a data exata da próxima avaliação, que será em 60 dias a partir da data da avaliação atual (${assessmentDateText}). Formate como "DD de Mês de AAAA".
        - **focusAreas:** Crie de 2 a 3 áreas de foco (ex: "Nutrição", "Treino de Força", "Cardio", "Consistência e Hábitos"). Para cada área, liste 2-3 metas específicas, mensuráveis e acionáveis para os próximos 60 dias, baseadas nos 'Pontos a Melhorar'.
        - **motivationalMessage:** Escreva uma mensagem motivacional curta e personalizada para encorajar o aluno a seguir o plano nos próximos 60 dias.
    5.  **Plano de Dieta e Aviso Legal:** Mantenha como antes, alinhado ao objetivo e dados atuais.
    6.  **Formato:** Retorne estritamente no formato JSON especificado.
  `;
};

const generateInitialPrompt = (studentData: StudentData): string => {
  const objetivoText = getObjetivoText(studentData.objetivo);
  const nivelAtividadeText = getNivelAtividadeText(studentData.nivelAtividade);
  const assessmentDateText = getFormattedDateForPrompt(studentData.assessmentDate);

  return `
    Analise os seguintes dados de um aluno da academia e forneça uma avaliação HOLÍSTICA, ACIONÁVEL, completa, detalhada e um plano de dieta de exemplo com múltiplas opções. CONSIDERE TODAS AS INFORMAÇÕES DE PERFIL FORNECIDAS PARA PERSONALIZAR A ANÁLISE E AS RECOMENDAÇÕES.

    **Dados do Aluno:**
    - Nome: ${studentData.nome}
    - Idade: ${studentData.idade} anos
    - Sexo: ${studentData.sexo}
    - Altura: ${studentData.altura} cm
    - Peso: ${studentData.peso} kg
    - Objetivo: ${objetivoText}
    ${studentData.instructorName ? `- Avaliador: ${studentData.instructorName}` : ''}
    ${nivelAtividadeText ? `- Nível de Atividade Física: ${nivelAtividadeText}` : ''}
    ${studentData.condicoesSaude ? `- Condições de Saúde: ${studentData.condicoesSaude}` : ''}
    ${studentData.restricoesMedicas ? `- Restrições Médicas: ${studentData.restricoesMedicas}` : ''}
    ${studentData.suplementos ? `- Suplementos Atuais: ${studentData.suplementos}` : ''}

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
    4.  **Análise Aprofundada (SEÇÕES OBRIGATÓRIAS):**
        - **Pontos Fortes:** Liste 2-3 pontos positivos ou métricas que estão boas, com base nos dados fornecidos.
        - **Pontos a Melhorar:** Liste 2-3 áreas principais que precisam de atenção, explicando brevemente o porquê.
        - **Recomendações:** Forneça 3-4 recomendações práticas e acionáveis, além da dieta, como sugestões de treino, hidratação ou estilo de vida.
    5.  **Plano de Ação Personalizado (NOVA SEÇÃO OBRIGATÓRIA):** Crie a seção 'actionPlan'.
        - **nextAssessmentDate:** Calcule e forneça a data exata da próxima avaliação, que será em 60 dias a partir da data da avaliação atual (${assessmentDateText}). Formate como "DD de Mês de AAAA".
        - **focusAreas:** Crie de 2 a 3 áreas de foco (ex: "Nutrição", "Treino de Força", "Cardio", "Consistência e Hábitos"). Para cada área, liste 2-3 metas específicas, mensuráveis e acionáveis para os próximos 60 dias, baseadas nos 'Pontos a Melhorar'.
        - **motivationalMessage:** Escreva uma mensagem motivacional curta e personalizada para encorajar o aluno a seguir o plano nos próximos 60 dias.
    6.  **Plano de Dieta (Exemplo):** Elabore um plano de dieta de AMOSTRA com TRÊS SUGESTÕES SIMPLES E DIFERENTES para as refeições principais (café da manhã, almoço, jantar, lanches). Adicionalmente, inclua uma refeição chamada "Ceia (Opcional)" com 1 ou 2 sugestões leves. O plano deve ser alinhado com o objetivo do aluno. Para cada refeição, inclua uma sugestão de horário (ex: "07:00 - 08:00" ou "22:00 - 23:00" para a ceia).
    7.  **Aviso Legal:** Inclua um aviso importante sobre a necessidade de consultar um nutricionista.
    8.  **Formato:** Retorne os dados estritamente no formato JSON especificado.
  `;
}

export const analyzeBioimpedance = async (studentData: StudentData, previousData?: StudentData): Promise<AnalysisResult> => {
  const model = "gemini-2.5-flash"; 
  const prompt = previousData 
    ? generateComparativePrompt(studentData, previousData) 
    : generateInitialPrompt(studentData);

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
      strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de 2 a 3 pontos fortes." },
      areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de 2 a 3 pontos a melhorar." },
      recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de 3 a 4 recomendações práticas." },
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
                time: { type: Type.STRING, description: "Horário sugerido para a refeição, ex: '07:00 - 08:00'" },
                suggestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ['name', 'time', 'suggestions']
            }
          },
          disclaimer: { type: Type.STRING }
        },
        required: ['title', 'meals', 'disclaimer']
      },
      comparativeAnalysis: {
        type: Type.OBJECT,
        nullable: true,
        properties: {
            summary: { type: Type.STRING, description: "Resumo do progresso comparativo."},
            changes: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        metric: { type: Type.STRING },
                        previousValue: { type: Type.STRING },
                        currentValue: { type: Type.STRING },
                        change: { type: Type.STRING },
                        assessment: { type: Type.STRING },
                        status: { type: Type.STRING, enum: ['positive', 'negative', 'neutral']}
                    },
                    required: ['metric', 'previousValue', 'currentValue', 'change', 'assessment', 'status']
                }
            }
        },
        required: ['summary', 'changes']
      },
      actionPlan: {
        type: Type.OBJECT,
        description: "Plano de ação personalizado com metas para os próximos 60 dias.",
        properties: {
          nextAssessmentDate: { type: Type.STRING, description: "Data da próxima avaliação em 60 dias." },
          focusAreas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Área de foco, ex: Nutrição." },
                goals: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de metas para esta área." }
              },
              required: ['title', 'goals']
            }
          },
          motivationalMessage: { type: Type.STRING, description: "Mensagem motivacional." }
        },
        required: ['nextAssessmentDate', 'focusAreas', 'motivationalMessage']
      }
    },
    required: ['summary', 'analysis', 'strengths', 'areasForImprovement', 'recommendations', 'dietPlan', 'actionPlan']
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