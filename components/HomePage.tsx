import React from 'react';
import { RocketLaunchIcon } from './icons';
import LogoVideira from './LogoVideira';

interface HomePageProps {
    onStart: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onStart }) => {
    return (
        <div className="relative min-h-[80vh] flex flex-col items-center justify-center text-center overflow-hidden animate-fade-in p-4">
            {/* Background shapes */}
            <div className="absolute top-0 -left-1/4 w-full h-full bg-yellow-400/10 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
            <div className="absolute bottom-0 -right-1/4 w-full h-full bg-green-400/10 rounded-full filter blur-3xl opacity-50 animation-delay-2000 animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-800 rounded-full"></div>
            
            <div className="relative z-10 flex flex-col items-center">
                <LogoVideira />

                <h1 className="mt-8 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tighter text-white">
                    Transforme Seus <span className="text-yellow-400">Resultados</span>.
                </h1>

                <p className="mt-4 max-w-xl text-lg text-gray-400">
                    Sua jornada para o próximo nível começa aqui. Análise corporal inteligente para otimizar seus treinos e nutrição.
                </p>

                <button
                    onClick={onStart}
                    className="mt-10 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-4 px-8 rounded-lg flex items-center justify-center transition duration-300 transform hover:scale-105 shadow-lg shadow-yellow-400/20"
                >
                    <RocketLaunchIcon className="w-6 h-6 mr-3" />
                    Acessar Painel
                </button>
            </div>
            <footer className="absolute bottom-4 text-center text-gray-500 text-sm z-10">
                <p>&copy; {new Date().getFullYear()} Academia Videira. Análise de Bioimpedância com IA.</p>
            </footer>
        </div>
    );
};

export default HomePage;
