// src/lib/topics.ts
export type TopicKey =
  | 'data-privacy-city'
  | 'server-hall-neon'
  | 'bio-ethics-lab'
  | 'ocean-climate'
  | 'neon-forest'
  | 'ai-classroom'
  | 'free-speech-agora'
  | 'tech-labor-factory'
  | 'healthcare-ai-clinic'
  | 'urban-mobility';

export const TOPICS: Record<TopicKey, { title: { en: string; zh: string }, img: string }> = {
  'data-privacy-city':   { title:{ en:'Data Privacy City',   zh:'数据隐私之城' }, img:'/scenes/data-privacy-city.png' },
  'server-hall-neon':    { title:{ en:'Server Hall Neon',    zh:'霓虹机房' },     img:'/scenes/server-hall-neon.png' },
  'bio-ethics-lab':      { title:{ en:'Bio Ethics Lab',      zh:'生物伦理实验室' }, img:'/scenes/bio-ethics-lab.png' },
  'ocean-climate':       { title:{ en:'Ocean & Climate',     zh:'海洋与气候' },     img:'/scenes/ocean-climate.png' },
  'neon-forest':         { title:{ en:'Neon Forest',         zh:'霓虹森林' },       img:'/scenes/neon-forest.png' },
  'ai-classroom':        { title:{ en:'AI Classroom',        zh:'AI 教室' },       img:'/scenes/ai-classroom.png' },
  'free-speech-agora':   { title:{ en:'Free Speech Agora',   zh:'言论广场' },       img:'/scenes/free-speech-agora.png' },
  'tech-labor-factory':  { title:{ en:'Tech & Labor Factory',zh:'未来工厂' },       img:'/scenes/tech-labor-factory.png' },
  'healthcare-ai-clinic':{ title:{ en:'Healthcare AI Clinic',zh:'AI 医疗诊所' },     img:'/scenes/healthcare-ai-clinic.png' },
  'urban-mobility':      { title:{ en:'Urban Mobility',      zh:'未来出行' },       img:'/scenes/urban-mobility.png' },
};