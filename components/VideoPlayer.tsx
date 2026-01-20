import React, { useEffect, useRef } from 'react';
import { RotateCcw, Youtube } from 'lucide-react';
import { ViralClip } from '../types';

interface VideoPlayerProps {
  videoId: string;
  activeClip: ViralClip | null;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, activeClip }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Construct Embed URL
  // If activeClip exists, we start at that time and loop
  // Note: YouTube IFrame API is limited in React without external heavy libs, 
  // so we use direct URL manipulation for the lightweight approach.
  const getEmbedUrl = () => {
    const baseUrl = `https://www.youtube.com/embed/${videoId}`;
    const params = new URLSearchParams({
      autoplay: '1',
      rel: '0',
      modestbranding: '1',
    });

    if (activeClip) {
      params.set('start', Math.floor(activeClip.start).toString());
      params.set('end', Math.floor(activeClip.end).toString());
      // loops are tricky with simple embeds, usually requires playlist param with same ID
      params.set('loop', '1');
      params.set('playlist', videoId);
    }

    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <div className="relative group bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800">
      <div className="w-full aspect-video relative">
        <iframe
          ref={iframeRef}
          src={getEmbedUrl()}
          title="YouTube video player"
          className="absolute top-0 left-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      
      {/* Overlay for clip info */}
      {activeClip && (
        <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
           <div className="inline-flex items-center gap-2 bg-slate-900/90 text-yellow-400 px-3 py-1.5 rounded-lg border border-yellow-500/30 text-xs font-mono shadow-lg backdrop-blur-sm">
              <RotateCcw size={14} />
              <span>Viral Döngü: {activeClip.start}s - {activeClip.end}s</span>
            </div>
        </div>
      )}

      {/* Watermark/Icon */}
      {!activeClip && (
        <div className="absolute top-4 right-4 pointer-events-none opacity-50">
          <Youtube className="text-red-600" size={32} />
        </div>
      )}
    </div>
  );
};
