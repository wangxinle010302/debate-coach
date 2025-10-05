'use client';
import * as React from 'react';

type Props = {
  onFinal: (text: string) => void;
  onInterim?: (text: string) => void;
  lang?: string;             // 'en-US' | 'zh-CN'...
  labelIdle?: string;
  labelRec?: string;
  className?: string;
  disabled?: boolean;
};

declare global { interface Window { webkitSpeechRecognition?: any } }

/** 语音识别按钮（基于 Web Speech API，Chrome/Edge 稳定） */
export default function VoiceInput({
  onFinal,
  onInterim,
  lang = 'en-US',
  labelIdle = '🎤 Speak',
  labelRec = 'Stop',
  className,
  disabled
}: Props) {
  const [supported, setSupported] = React.useState(false);
  const [recording, setRecording] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const recRef = React.useRef<any>(null);

  React.useEffect(() => {
    setSupported(typeof window !== 'undefined' && !!window.webkitSpeechRecognition);
  }, []);

  const start = React.useCallback(() => {
    if (!supported || recording || disabled) return;
    const SR = window.webkitSpeechRecognition!;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = lang;

    rec.onresult = (e: any) => {
      let finalText = '';
      let interimText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interimText += t;
      }
      if (interimText && onInterim) onInterim(interimText);
      if (finalText) onFinal(finalText);
    };
    rec.onerror = (ev: any) => { setError(ev?.error || 'recognition-error'); setRecording(false); };
    rec.onend   = () => { setRecording(false); onInterim?.(''); };

    try { rec.start(); recRef.current = rec; setRecording(true); setError(null); }
    catch { setError('cannot-start'); }
  }, [supported, recording, disabled, lang, onFinal, onInterim]);

  const stop = React.useCallback(() => {
    recRef.current?.stop?.();
    setRecording(false);
  }, []);

  if (!supported) return null;

  return (
    <div className={className}>
      <button
        type="button"
        onClick={recording ? stop : start}
        disabled={disabled}
        className={`btn ${recording ? 'btn-danger' : 'btn-primary'}`}
        aria-pressed={recording}
      >
        {recording ? labelRec : labelIdle}
      </button>
      {error && <div className="hint error">Voice error: {error}</div>}
    </div>
  );
}
