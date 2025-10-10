// src/types/speech.d.ts
export {}; // 让本文件成为模块，避免被当成脚本

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}