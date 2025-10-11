'use client';

import { useState } from 'react';
import P5Host from '@/components/P5Host';
import flowField from '@/lib/calm/flowField';
import bubblesDrift from '@/lib/calm/bubblesDrift';
import nebulaParticles from '@/lib/calm/nebulaParticles';

type Game = 'flow' | 'bubbles' | 'nebula';

export default function CalmGamesPanel() {
  const [game, setGame] = useState<Game>('flow');

  return (
    <div className="glass" style={{ padding: 16 }}>
      {/* tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <button
          onClick={() => setGame('flow')}
          className={game === 'flow' ? 'btn-primary' : 'btn'}
          aria-pressed={game === 'flow'}
        >
          流场舒缓线
        </button>
        <button
          onClick={() => setGame('bubbles')}
          className={game === 'bubbles' ? 'btn-primary' : 'btn'}
          aria-pressed={game === 'bubbles'}
        >
          泡泡漂流
        </button>
        <button
          onClick={() => setGame('nebula')}
          className={game === 'nebula' ? 'btn-primary' : 'btn'}
          aria-pressed={game === 'nebula'}
        >
          星云粒子
        </button>
      </div>

      {/* 只渲染当前选中的一个，切换时卸载旧实例再挂载新实例 */}
      {game === 'flow' && <P5Host key="flow" sketch={flowField} height={420} />}
      {game === 'bubbles' && <P5Host key="bubbles" sketch={bubblesDrift} height={420} />}
      {game === 'nebula' && <P5Host key="nebula" sketch={nebulaParticles} height={420} />}
    </div>
  );
}