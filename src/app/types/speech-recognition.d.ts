// Minimal typings for Web Speech API
interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: (ev: any) => void;
  onend: () => void;
  onerror: (ev: any) => void;
  start: () => void;
  stop: () => void;
}

interface Window {
  webkitSpeechRecognition?: { new (): SpeechRecognition };
  SpeechRecognition?: { new (): SpeechRecognition };
}
