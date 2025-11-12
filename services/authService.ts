import { CurrentUser } from '../types';

/**
 * Simula uma chamada de API de login de administrador.
 * Para o protótipo:
 * - Admin: usuário 'admin', senha 'admin123'
 */
export const login = async (
  username: string,
  password: string,
): Promise<CurrentUser> => {
  // Simula um atraso de rede
  await new Promise(res => setTimeout(res, 500));

  if (username.toLowerCase() === 'admin' && password === 'admin123') {
    return { name: 'Admin', role: 'admin' };
  }
  
  throw new Error('Credenciais inválidas. Verifique os dados e tente novamente.');
};
