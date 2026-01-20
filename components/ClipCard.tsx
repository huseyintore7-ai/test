import React from 'react';
import { PlayCircle, Clock, Hash } from 'lucide-react';
import { ViralClip } from '../types';

interface ClipCardProps {
  clip: ViralClip;
  isActive: boolean;
  index: number;
  onClick: () => void;
}

export const ClipCard: React.FC<ClipCardProps> = ({ clip, isActive, index, onClick }) => {
  const duration = (clip.end - clip.start).toFixed(1);

  return (
    <div 
      onClick={onClick}
      className={`
        relative p-4 rounded-lg border cursor-pointer transition-all duration-300 hover:scale-[1.02]
        ${isActive 
          ? 'bg-blue-900/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
          : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className={`font-bold text-lg leading-tight ${isActive ? 'text-blue-400' : 'text-white'}`}>
          {clip.title}
        </h3>
        <span className="bg-slate-700 text-xs font-mono px-2 py-1 rounded text-slate-300">
          #{index + 1}
        </span>
      </div>

      <p className="text-sm text-slate-400 mb-4 line-clamp-2">
        {clip.description}
      </p>

      <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>{duration} sn</span>
        </div>
        <div className="flex items-center gap-1">
          <PlayCircle size={14} />
          <span>{clip.start}s - {clip.end}s</span>
        </div>
      </div>

      {isActive && (
        <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none animate-pulse" />
      )}
    </div>
  );
};
