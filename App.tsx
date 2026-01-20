import React, { useState } from 'react';
import { Sparkles, Link as LinkIcon, Youtube, AlertCircle, Save, Scissors, Activity, Download, MessageCircle } from 'lucide-react';
import { analyzeVideoWithGemini } from './services/geminiService';
import { AnalysisResult, AnalysisStatus, VideoData, ViralClip } from './types';
import { VideoPlayer } from './components/VideoPlayer';
import { ClipCard } from './components/ClipCard';

// Using the key provided in the prompt
const PROVIDED_API_KEY = "AIzaSyCJjaxvbNmtPkVi-lQKS63rkWxBBDOp5D4";

const App: React.FC = () => {
  // State
  const [youtubeLink, setYoutubeLink] = useState<string>('');
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeClip, setActiveClip] = useState<ViralClip | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handlers
  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYoutubeLink(e.target.value);
    // Reset state on new link
    if (status !== AnalysisStatus.ANALYZING) {
      setResult(null);
      setActiveClip(null);
      setStatus(AnalysisStatus.IDLE);
    }
  };

  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleAnalyze = async () => {
    const videoId = extractVideoId(youtubeLink);
    if (!videoId) {
      setError("Geçersiz YouTube bağlantısı. Lütfen kontrol edin.");
      return;
    }

    setVideoData({ id: videoId, url: youtubeLink });
    setError(null);
    setActiveClip(null);
    
    // Step 1: Simulate Downloading Video (Browser cannot really download YT to file)
    setStatus(AnalysisStatus.DOWNLOADING);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 2: Simulate Fetching Comments
    setStatus(AnalysisStatus.FETCHING_COMMENTS);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: AI Analysis
    setStatus(AnalysisStatus.ANALYZING);

    try {
      const analysisData = await analyzeVideoWithGemini(PROVIDED_API_KEY, videoId, youtubeLink);
      setResult(analysisData);
      setStatus(AnalysisStatus.COMPLETED);
      
      // Auto-select first clip
      if (analysisData.clips.length > 0) {
        setActiveClip(analysisData.clips[0]);
      }
    } catch (err: any) {
      setError(err.message);
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const downloadMetadata = () => {
    if (!result) return;
    const text = result.clips.map((clip, i) => `
Clip #${i + 1}: ${clip.title}
Timestamp: ${clip.start}s - ${clip.end}s
Description: ${clip.description}
----------------------------------------
    `).join('\n');
    
    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "metadata_output.txt";
    document.body.appendChild(element);
    element.click();
  };

  // Helper to get status text
  const getStatusText = () => {
    switch(status) {
      case AnalysisStatus.DOWNLOADING: return "Video İndiriliyor...";
      case AnalysisStatus.FETCHING_COMMENTS: return "Yorumlar Analiz Ediliyor...";
      case AnalysisStatus.ANALYZING: return "Gemini AI ile Viral Anlar Taranıyor...";
      case AnalysisStatus.COMPLETED: return "Analiz Tamamlandı";
      case AnalysisStatus.ERROR: return "Hata Oluştu";
      default: return "Sistem Hazır";
    }
  };

  // Helper to get status icon
  const getStatusIcon = () => {
    switch(status) {
      case AnalysisStatus.DOWNLOADING: return <Download className="animate-bounce" size={16} />;
      case AnalysisStatus.FETCHING_COMMENTS: return <MessageCircle className="animate-pulse" size={16} />;
      case AnalysisStatus.ANALYZING: return <Sparkles className="animate-spin" size={16} />;
      default: return <Activity size={16} />;
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-[#0f172a]">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-6 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-red-600 to-red-500 p-2 rounded-lg">
              <Youtube className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">
                Viral Kesit Analizörü
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">YouTube & Gemini 2.0 Entegrasyonu</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            <div className={`text-slate-400 ${status !== AnalysisStatus.IDLE && status !== AnalysisStatus.COMPLETED ? 'text-yellow-400' : ''}`}>
              {getStatusIcon()}
            </div>
            <span className="text-xs font-mono text-slate-300">
              {getStatusText()}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        
        {/* Step 1: Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            
            {/* Input Section */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-xl">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-4">
                <LinkIcon size={16} />
                YouTube Video Bağlantısı
              </label>
              
              <div className="space-y-4">
                <input 
                  type="text" 
                  value={youtubeLink}
                  onChange={handleLinkChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none transition text-white placeholder-slate-600"
                />

                {/* Status Steps Visualization */}
                {(status === AnalysisStatus.DOWNLOADING || status === AnalysisStatus.FETCHING_COMMENTS || status === AnalysisStatus.ANALYZING) && (
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <div className={`w-2 h-2 rounded-full ${status === AnalysisStatus.DOWNLOADING ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                      <span>Video İndiriliyor...</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <div className={`w-2 h-2 rounded-full ${status === AnalysisStatus.FETCHING_COMMENTS ? 'bg-yellow-500 animate-pulse' : status === AnalysisStatus.ANALYZING || status === AnalysisStatus.COMPLETED ? 'bg-green-500' : 'bg-slate-700'}`} />
                      <span>Yorumlar Çekiliyor...</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <div className={`w-2 h-2 rounded-full ${status === AnalysisStatus.ANALYZING ? 'bg-yellow-500 animate-pulse' : status === AnalysisStatus.COMPLETED ? 'bg-green-500' : 'bg-slate-700'}`} />
                      <span>Gemini Analizi Yapılıyor...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleAnalyze}
              disabled={!youtubeLink || status !== AnalysisStatus.IDLE && status !== AnalysisStatus.COMPLETED && status !== AnalysisStatus.ERROR}
              className={`
                w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg
                ${!youtubeLink 
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                  : status !== AnalysisStatus.IDLE && status !== AnalysisStatus.COMPLETED && status !== AnalysisStatus.ERROR
                    ? 'bg-slate-800 text-slate-400 cursor-wait border border-slate-700'
                    : 'bg-red-600 hover:bg-red-700 text-white hover:shadow-red-500/25'}
              `}
            >
              {status !== AnalysisStatus.IDLE && status !== AnalysisStatus.COMPLETED && status !== AnalysisStatus.ERROR ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  İşleniyor...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Analizi Başlat
                </>
              )}
            </button>
            
            {error && (
              <div className="bg-red-900/50 border border-red-500/50 p-4 rounded-xl flex items-start gap-3 text-sm text-red-200">
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Step 2: Visualization & Results */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Main Video Player */}
            <div className="relative">
               {videoData ? (
                 <VideoPlayer 
                    videoId={videoData.id}
                    activeClip={activeClip}
                 />
               ) : (
                 <div className="w-full aspect-video bg-slate-900 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-slate-600 shadow-inner">
                    <Youtube size={64} className="mb-4 opacity-20" />
                    <p>YouTube Linki Giriniz</p>
                 </div>
               )}
            </div>

            {/* Analysis Results */}
            {result && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="text-yellow-400" size={20} />
                    Tespit Edilen Viral Anlar
                  </h2>
                  <button 
                    onClick={downloadMetadata}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition border border-slate-700"
                  >
                    <Save size={16} />
                    Raporu İndir
                  </button>
                </div>

                {/* Clips Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.clips.map((clip, idx) => (
                    <ClipCard 
                      key={idx}
                      clip={clip}
                      index={idx}
                      isActive={activeClip === clip}
                      onClick={() => setActiveClip(clip)}
                    />
                  ))}
                </div>

                {/* Peak Moment Insight */}
                {result.peakMoment && (
                  <div className="mt-6 bg-gradient-to-r from-red-900/40 to-orange-900/40 p-5 rounded-xl border border-red-500/30">
                    <h4 className="text-red-300 font-semibold mb-2 text-sm flex items-center gap-2">
                        <Activity size={16} />
                        AI İçgörüsü: En Yüksek Etkileşim Anı
                    </h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{result.peakMoment}</p>
                  </div>
                )}
              </div>
            )}
            
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;