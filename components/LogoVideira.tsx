import React from 'react';
import { VideiraLogoIcon } from './icons';

const LogoVideira: React.FC = () => {
  return (
    <div className="flex flex-col items-center select-none">
      <VideiraLogoIcon className="w-24 h-24 text-yellow-400" />
      <div className="mt-2 text-center">
          <h2 className="text-5xl font-extrabold text-yellow-400 tracking-tighter" style={{ fontFamily: "'Teko', sans-serif", fontStyle: 'italic', WebkitTextStroke: '1px #111827' }}>
              VIDEIRA
          </h2>
          <p className="text-sm font-medium text-white tracking-[0.2em] -mt-2" style={{ fontFamily: "'Teko', sans-serif" }}>
              ACADEMIA
          </p>
      </div>
    </div>
  );
};

export default LogoVideira;