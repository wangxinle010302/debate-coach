'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type Lang = 'zh' | 'en';

interface Props {
  lang?: Lang;
  onFinish?: () => void;
  /** 每个部位进行的轮数（默认 3） */
  cyclesPerZone?: number;
  /** 每轮秒数（默认 8） */
  secondsPerCycle?: number;
}

const ZONES: Record<Lang, string[]> = {
  zh: [
    '前额/眉心', '眼周', '下巴/口腔', '颈部', '肩膀', '胸腔',
    '上臂/前臂', '腹部/胃', '下背/腰', '大腿', '小腿/脚背', '脚趾'
  ],
  en: [
    'Forehead/Brow', 'Around Eyes', 'Jaw/Mouth', 'Neck', 'Shoulders', 'Chest',
    'Upper & Forearms', 'Abdomen/Stomach', 'Lower Back/Waist', 'Thighs', 'Calves/Feet', 'Toes'
  ],
};

const COPY = {
  zh: {
    title: '身体扫描（可视化）',
    tip: '依次把注意力移动到下方列表的部位：觉察紧张 → 轻柔放松，随呼吸停留 2~3 个循环。',
    start: '开始',
    pause: '暂停',
    reset: '重置',
    back: '上一步',
    next: '下一步',
    done: '全部完成',
    cycles: (c: number, t: number) => `本部位轮次：${c}/${t}`,
    secs: (s: number) => `本轮剩余：${s}s`,
  },
  en: {
    title: 'Body Scan (Visual)',
    tip: 'Move attention through each zone below: notice tension → gently soften, and stay for 2–3 breathing cycles.',
    start: 'Start',
    pause: 'Pause',
    reset: 'Reset',
    back: 'Back',
    next: 'Next',
    done: 'Completed',
    cycles: (c: number, t: number) => `Cycles in zone: ${c}/${t}`,
    secs: (s: number) => `Time left: ${s}s`,
  },
} as const;

export default function BodyScanPanel({
  lang = 'zh',
  onFinish,
  cyclesPerZone = 3,
  secondsPerCycle = 8,
}: Props) {
  const t = COPY[lang];
  const zones = ZONES[lang];
  const totalZones = zones.length;

  const [running, setRunning] = useState(false);
  const [zoneIdx, setZoneIdx] = useState(0);        // 当前部位索引
  const [cycle, setCycle] = useState(0);            // 当前部位已完成轮数（0..cyclesPerZone-1）
  const [secLeft, setSecLeft] = useState(secondsPerCycle);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const progress = useMemo(() => {
    // 0..1 之间：本轮的进度
    return 1 - secLeft / secondsPerCycle;
  }, [secLeft, secondsPerCycle]);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stop = () => {
    setRunning(false);
    clearTimer();
  };

  const start = () => setRunning(true);

  const reset = () => {
    stop();
    setZoneIdx(0);
    setCycle(0);
    setSecLeft(secondsPerCycle);
  };

  const jumpZone = (i: number) => {
    stop();
    setZoneIdx(i);
    setCycle(0);
    setSecLeft(secondsPerCycle);
  };

  // 定时器：稳定的状态推进（保证每个分支都有返回值，避免 TS2345）
  useEffect(() => {
    clearTimer();
    if (!running) return;

    timerRef.current = setInterval(() => {
      setSecLeft((s) => {
        if (s > 1) return s - 1;

        // s === 1，本轮结束：先尝试推进轮数
        let advanced = false;

        setCycle((prev) => {
          if (prev + 1 < cyclesPerZone) {
            advanced = true;
            return prev + 1; // 进入同一部位下一轮
          }
          return prev; // 暂不变，在外层判断切到下一个部位
        });

        if (advanced) {
          return secondsPerCycle; // 重置本轮秒数
        }

        // 轮数已经用完 → 切下一个部位，或结束
        setZoneIdx((z) => {
          if (z + 1 < totalZones) {
            setCycle(0);
            return z + 1; // 下一个部位
          } else {
            // 全部完成
            stop();
            onFinish?.();
            return z; // 返回当前即可
          }
        });

        return secondsPerCycle; // 重置倒计时
      });
    }, 1000);

    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, cyclesPerZone, secondsPerCycle, totalZones]);

  // UI：顶部信息
  const header = (
    <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>{t.title}</div>
        <div className="muted" style={{ marginTop: 6 }}>{t.tip}</div>
      </div>

      <div className="row" style={{ gap: 8 }}>
        {!running ? (
          <button className="btn" onClick={start}>{t.start}</button>
        ) : (
          <button className="btn" onClick={stop}>{t.pause}</button>
        )}
        <button className="btn" onClick={reset} style={{ background: 'rgba(255,255,255,.12)', color: 'var(--ink)' }}>
          {t.reset}
        </button>
      </div>
    </div>
  );

  // UI：部位标签列表（当前高亮，可点击跳转）
  const chips = (
    <div className="row" style={{ flexWrap: 'wrap', gap: 8, margin: '10px 0 16px' }}>
      {zones.map((z, i) => (
        <button
          key={z + i}
          className="badge"
          onClick={() => jumpZone(i)}
          style={{
            cursor: 'pointer',
            borderColor: i === zoneIdx ? 'rgba(140,120,255,.9)' : 'var(--border)',
            background: i === zoneIdx ? 'rgba(140,120,255,.18)' : 'rgba(255,255,255,.08)',
          }}
        >
          {i + 1}. {z}
        </button>
      ))}
    </div>
  );

  // UI：圆环 + 数据
  const circle = (
    <div style={{ display: 'grid', placeItems: 'center', padding: '22px 0' }}>
      <div
        aria-label="progress ring"
        style={{
          width: 220,
          height: 220,
          borderRadius: '50%',
          position: 'relative',
          background: `conic-gradient(#8c7bff ${progress * 360}deg, rgba(255,255,255,.12) 0)`,
          boxShadow: '0 0 0 1px rgba(255,255,255,.08) inset, 0 10px 30px rgba(0,0,0,.4)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 10,
            borderRadius: '50%',
            background: 'radial-gradient(80px 80px at 50% 40%, rgba(255,255,255,.9), rgba(255,255,255,.04))',
            boxShadow: '0 0 0 1px rgba(255,255,255,.15) inset, 0 12px 40px rgba(124,140,255,.25)',
          }}
        />
      </div>

      <div className="row" style={{ gap: 12, marginTop: 12 }}>
        <span className="badge">{zones[zoneIdx]}</span>
        <span className="badge">{t.cycles(cycle, cyclesPerZone)}</span>
        <span className="badge">{t.secs(secLeft)}</span>
      </div>
    </div>
  );

  // UI：底部控制（上一/下一）
  const nav = (
    <div className="row" style={{ justifyContent: 'space-between', marginTop: 14 }}>
      <button
        className="btn"
        onClick={() => {
          const next = Math.max(0, zoneIdx - 1);
          jumpZone(next);
        }}
        style={{ background: 'rgba(255,255,255,.12)', color: 'var(--ink)' }}
      >
        ← {t.back}
      </button>

      <button
        className="btn"
        onClick={() => {
          if (zoneIdx + 1 < totalZones) jumpZone(zoneIdx + 1);
          else {
            stop();
            onFinish?.();
          }
        }}
      >
        {zoneIdx + 1 < totalZones ? t.next + ' →' : t.done + ' ✓'}
      </button>
    </div>
  );

  return (
    <section className="panel glass">
      {header}
      {chips}
      {circle}
      {nav}
    </section>
  );
}