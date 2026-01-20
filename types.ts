export interface ViralClip {
  start: number;
  end: number;
  title: string;
  description: string;
  reason?: string;
}

export interface AnalysisResult {
  clips: ViralClip[];
  peakMoment?: string;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  DOWNLOADING = 'DOWNLOADING', // Simulating the download phase
  FETCHING_COMMENTS = 'FETCHING_COMMENTS', // Simulating comment fetch
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface VideoData {
  id: string;
  url: string;
}
