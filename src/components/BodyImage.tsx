// src/components/BodyImage.tsx
'use client';
import React from 'react';

type Region =
  | 'forehead_jaw'
  | 'neck_shoulders'
  | 'chest_back'
  | 'arms_hands'
  | 'hips_thighs'
  | 'calves_feet';

const IMG: Record<Region, string> = {
  forehead_jaw:   '/body/forehead-jaw.png',
  neck_shoulders: '/body/neck-shoulders.png',
  chest_back:     '/body/chest-back.png',
  arms_hands:     '/body/arms-hands.png',
  hips_thighs:    '/body/hips-thighs.png',
  calves_feet:    '/body/calves-feet.png',
};

export default function BodyImage({
  region,
  height = 360,
}: { region: Region; height?: number }) {
  const src = IMG[region];
  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', background: 'rgba(255,255,255,.03)' }}>
      <img
        src={src}
        alt={region}
        style={{ width: '100%', height, objectFit: 'contain', display: 'block' }}
      />
    </div>
  );
}