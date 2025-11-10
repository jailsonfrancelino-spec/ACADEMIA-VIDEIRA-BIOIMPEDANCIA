import React from 'react';
import { VideiraLogoIcon, ArrowRightOnRectangleIcon } from './icons';
import { CurrentUser } from '../types';

interface HeaderProps {
  user: CurrentUser;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="w-full flex flex-col sm:flex-row justify-between items-center mb-8 md:mb-12 gap-4">
      <div className="flex items-center justify-center">
        <VideiraLogoIcon className="w-10 h-10 text-yellow-400 mr-3" />
        <div>
           <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Academia <span className="text-yellow-400">Videira</span>
          </h1>
          <p className="text-sm text-gray-400 -mt-1">Painel de Bioimpedância com IA</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 bg-gray-800 p-2 rounded-lg">
        <span className="text-gray-300 text-sm sm:text-base">Olá, <span className="font-semibold text-white">{user.name}</span></span>
        <button 
          onClick={onLogout} 
          className="bg-gray-700 hover:bg-red-600 text-white font-bold p-2 rounded-md flex items-center justify-center transition-colors duration-300"
          aria-label="Sair"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
