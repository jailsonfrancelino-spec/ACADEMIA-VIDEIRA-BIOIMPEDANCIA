
import React from 'react';
import { PersonRunningIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="text-center mb-8 md:mb-12">
      <div className="flex items-center justify-center mb-2">
        <PersonRunningIcon className="w-10 h-10 text-yellow-400 mr-3" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          Academia <span className="text-yellow-400">Videira</span>
        </h1>
      </div>
      <p className="text-lg text-gray-400">Seu Analisador de Bioimpedância com IA</p>
    </header>
  );
};

export default Header;