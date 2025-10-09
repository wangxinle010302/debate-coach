// src/lib/i18n.ts
export type Lang = 'en' | 'zh';
export const t = (lang:Lang) => ({
  title: lang==='en' ? 'Speak. Rewrite. Compare.' : '表达、改写、对比',
  subtitle: lang==='en' ? 'Pick a mode to practice debate with an AI coach.' : '选择模式，与 AI 教练练辩论',
  textCard: lang==='en' ? 'Text Chat · Scoring + Rewrite' : '文本聊天 · 评分 + 改写',
  voiceCard: lang==='en' ? 'Voice Chat · Scoring + Prosody' : '语音聊天 · 评分 + 声调分析',
  chooseTopic: lang==='en' ? 'Choose a topic' : '选择一个话题',
  chooseLang: lang==='en' ? 'Language' : '语言',
  toText: lang==='en' ? 'Enter Text Mode' : '进入文本模式',
  toVoice: lang==='en' ? 'Enter Voice Mode' : '进入语音模式',
  back: lang==='en' ? '← Back' : '← 返回',
  textTitle: lang==='en' ? 'Text Chat · Single User' : '文本聊天 · 单用户',
  voiceTitle: lang==='en' ? 'Voice Chat · Single User' : '语音聊天 · 单用户',
  textHint: lang==='en'
    ? 'Type your statement, click “Score & Rewrite”, then choose rewrite strength and send.'
    : '先输入内容，点“评分与改写”，选好改写强度后再发送。',
  voiceHint: lang==='en'
    ? 'Click 🎤 to speak. We transcribe & score your prosody. Edit the text then send.'
    : '点击 🎤 说话，系统会转写并评分；你可编辑文本再发送。',
  scoreRewrite: lang==='en' ? 'Score & Rewrite' : '评分与改写',
  applyAndSend: lang==='en' ? 'Apply & Send' : '应用并发送',
  sending: lang==='en' ? 'Sending…' : '发送中…',
  send: lang==='en' ? 'Send' : '发送',
  rewriteLight: lang==='en' ? 'Light' : '轻微',
  rewriteMed: lang==='en' ? 'Medium' : '中等',
  rewriteHeavy: lang==='en' ? 'Heavy' : '重写',
});