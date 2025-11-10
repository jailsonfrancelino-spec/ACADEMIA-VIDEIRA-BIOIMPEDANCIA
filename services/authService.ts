import { Student, CurrentUser, StudentData } from '../types';

/**
 * Simula uma chamada de API de login.
 * Para o protótipo:
 * - Admin: usuário 'admin', senha 'admin123'
 * - Cliente: usuário é o nome exato do aluno, senha é a cadastrada ou '123456' como padrão.
 */
export const login = async (
  username: string,
  password: string,
  role: 'admin' | 'client',
  students: Student[]
): Promise<CurrentUser> => {
  // Simula um atraso de rede
  await new Promise(res => setTimeout(res, 500));

  if (role === 'admin') {
    if (username.toLowerCase() === 'admin' && password === 'admin123') {
      return { name: 'Admin', role: 'admin' };
    }
  } else { // role === 'client'
    const student = students.find(s => s.name.toLowerCase() === username.toLowerCase());
    // Usa a senha do aluno se existir, senão, o padrão '123456'
    if (student && password === (student.password || '123456')) {
      return { name: student.name, role: 'client', id: student.id };
    }
  }

  throw new Error('Credenciais inválidas. Verifique os dados e tente novamente.');
};

/**
 * Simula o cadastro de um novo aluno.
 */
export const register = async (
  name: string,
  password: string,
  idade: number | undefined,
  altura: number | undefined,
  sexo: 'masculino' | 'feminino',
  objetivo: StudentData['objetivo'],
  nivelAtividade: 'sedentario' | 'leve' | 'moderado' | 'ativo' | 'muito_ativo',
  condicoesSaude: string,
  restricoesMedicas: string,
  suplementos: string,
  students: Student[]
): Promise<Student> => {
  // Simula um atraso de rede
  await new Promise(res => setTimeout(res, 500));
  
  const existingStudent = students.find(s => s.name.trim().toLowerCase() === name.trim().toLowerCase());

  if (existingStudent) {
    throw new Error('Já existe um aluno com este nome. Por favor, escolha outro ou faça login.');
  }

  const newStudent: Student = {
    id: `stu_${new Date().getTime()}`,
    name: name.trim(),
    password: password,
    idade,
    altura,
    sexo,
    objetivo,
    nivelAtividade,
    condicoesSaude: condicoesSaude || undefined,
    restricoesMedicas: restricoesMedicas || undefined,
    suplementos: suplementos || undefined,
    assessments: [],
  };
  
  return newStudent;
};