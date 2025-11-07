import React from 'react';
import { PersonRunningIcon } from './icons';

const LogoVideira: React.FC = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center">
        <PersonRunningIcon className="w-12 h-12 text-yellow-400" />
        <div className="ml-2">
            <h2 className="text-5xl font-extrabold text-yellow-400 tracking-tighter" style={{ fontStyle: 'italic' }}>
                VIDEIRA
            </h2>
            <p className="text-sm font-medium text-white tracking-widest text-right -mt-1">
                ACADEMIA
            </p>
        </div>
      </div>
    </div>
  );
};

export default LogoVideira;
