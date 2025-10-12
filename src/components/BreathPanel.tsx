function BreathPanel() {
  // 4-7-8：4s 吸、2s 屏、8s 呼、2s 屏
  const PHASES = [
    { name: 'Inhale', ms: 4000 },
    { name: 'Hold',   ms: 2000 },
    { name: 'Exhale', ms: 8000 },
    { name: 'Hold',   ms: 2000 },
  ] as const;
  const TARGET_ROUNDS = 4;
  const CYCLE_MS = PHASES.reduce((s, p) => s + p.ms, 0);

  // 可视用 state
  const [running, setRunning]   = React.useState(false);
  const [phaseName, setPhase]   = React.useState<string>('Inhale');
  const [rounds, setRounds]     = React.useState(0);
  const [ringPct, setRingPct]   = React.useState(0);

  // 逻辑用 ref（避免闭包陈旧）
  const animRef    = React.useRef<number | null>(null);
  const runRef     = React.useRef(false);
  const phaseIdxRef= React.useRef(0);
  const inPhaseRef = React.useRef(0);   // 当前相位已流逝 ms
  const roundsRef  = React.useRef(0);
  const lastTsRef  = React.useRef<number | null>(null);

  const stop = React.useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = null;
    runRef.current = false;
    setRunning(false);
    lastTsRef.current = null;
  }, []);

  const start = React.useCallback(() => {
    // 重置
    stop();
    runRef.current = true;
    setRunning(true);
    phaseIdxRef.current = 0;
    inPhaseRef.current  = 0;
    roundsRef.current   = 0;
    setPhase(PHASES[0].name);
    setRounds(0);
    setRingPct(0);
    lastTsRef.current = null;

    const tick = (ts: number) => {
      if (!runRef.current) return;
      const last = lastTsRef.current;
      lastTsRef.current = ts;
      const dt = last == null ? 0 : Math.min(50, ts - last); // 限制最大步长，避免切 tab 跳动

      // 推进相位时间
      inPhaseRef.current += dt;
      const idx = phaseIdxRef.current;
      const curLen = PHASES[idx].ms;

      // 环形进度（当前相位内的用量 + 之前相位总用量）
      const usedBefore = PHASES.slice(0, idx).reduce((s, p) => s + p.ms, 0);
      const usedInPhase = Math.min(inPhaseRef.current, curLen);
      setRingPct((usedBefore + usedInPhase) / CYCLE_MS);

      // 相位切换
      if (inPhaseRef.current >= curLen) {
        inPhaseRef.current -= curLen;
        phaseIdxRef.current = (idx + 1) % PHASES.length;
        const newIdx = phaseIdxRef.current;
        setPhase(PHASES[newIdx].name);

        // 每完成一整圈（回到 Inhale）算一轮
        if (newIdx === 0) {
          roundsRef.current += 1;
          setRounds(Math.min(TARGET_ROUNDS, roundsRef.current));
          if (roundsRef.current >= TARGET_ROUNDS) {
            // 到 4 轮可以自动停，但 Next 不受限制，随时可点
            runRef.current = false;
            setRunning(false);
            return;
          }
        }
      }

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
  }, [PHASES, stop]);

  React.useEffect(() => () => stop(), [stop]);

  // 圆环可视
  const R = 88;
  const C = 2 * Math.PI * R;
  const dash = Math.max(0.0001, C * ringPct);

  return (
    <div>
      <p className="muted">
        Follow the pulse: inhale 4s · hold 2s · exhale 8s · hold 2s. Do 4 rounds, then press Next (Next is always available).
      </p>

      <div style={{ display:'grid', placeItems:'center' }}>
        <div style={{ position:'relative', width:220, height:220 }}>
          <svg width="220" height="220" style={{ position:'absolute', inset:0 }}>
            <circle cx="110" cy="110" r={R} stroke="rgba(255,255,255,.1)" strokeWidth="12" fill="none" />
            <circle
              cx="110" cy="110" r={R} fill="none" stroke="url(#grad1)" strokeWidth="12"
              strokeDasharray={`${dash} ${C}`} strokeLinecap="round" transform="rotate(-90 110 110)"
            />
            <defs>
              <linearGradient id="grad1" x1="0" x2="1">
                <stop offset="0%" stopColor="#7c8cff"/>
                <stop offset="100%" stopColor="#b36bff"/>
              </linearGradient>
            </defs>
          </svg>

          <div
            style={{
              position:'absolute', inset:28, borderRadius:'50%',
              background:'radial-gradient(100px 100px at 50% 45%, rgba(124,140,255,.35), transparent)',
              transform:
                phaseName === 'Inhale' ? 'scale(1.06)' :
                phaseName === 'Exhale' ? 'scale(0.92)' : 'scale(1.02)',
              transition:'transform .6s ease'
            }}
          />
          <div style={{ position:'absolute', inset:0, display:'grid', placeItems:'center', pointerEvents:'none' }}>
            <div className="badge">{phaseName} · round {Math.min(rounds,TARGET_ROUNDS)}/{TARGET_ROUNDS}</div>
          </div>
        </div>
      </div>

      <div className="row" style={{ justifyContent:'center', gap:10, marginTop:10 }}>
        {!running
          ? <button className="btn" onClick={start}>Start 4 rounds</button>
          : <button className="btn" onClick={stop}>Stop</button>}
      </div>
    </div>
  );
}