export const WHEEL_PRIZES = [10, 15, 20, 25, 30, 40, 50, 100];

export function prizeToSegmentIndex(amount) {
  const idx = WHEEL_PRIZES.indexOf(Number(amount));
  if (idx >= 0) return idx;
  let closest = 0;
  let diff = Infinity;
  WHEEL_PRIZES.forEach((p, i) => {
    const d = Math.abs(p - Number(amount));
    if (d < diff) {
      diff = d;
      closest = i;
    }
  });
  return closest;
}

export function calcSpinRotation(segmentIndex, extraSpins = 7) {
  const count = WHEEL_PRIZES.length;
  const segAngle = 360 / count;
  return extraSpins * 360 + (count - segmentIndex) * segAngle;
}

export const WHEEL_SEGMENTS = [
  { base: '#ff5722', light: '#ff8a65', dark: '#c62828' },
  { base: '#ffc107', light: '#ffe082', dark: '#f57f17' },
  { base: '#66bb6a', light: '#a5d6a7', dark: '#2e7d32' },
  { base: '#42a5f5', light: '#90caf9', dark: '#1565c0' },
  { base: '#ab47bc', light: '#ce93d8', dark: '#6a1b9a' },
  { base: '#26c6da', light: '#80deea', dark: '#00838f' },
  { base: '#ff9800', light: '#ffcc80', dark: '#e65100' },
  { base: '#ec407a', light: '#f48fb1', dark: '#ad1457' },
];

export function wedgePath(index, total, r = 9.2, cx = 12, cy = 12) {
  const start = (index / total) * Math.PI * 2 - Math.PI / 2;
  const end = ((index + 1) / total) * Math.PI * 2 - Math.PI / 2;
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
}

export function wedgeLabelPos(index, total, r = 6.2, cx = 12, cy = 12) {
  const mid = ((index + 0.5) / total) * Math.PI * 2 - Math.PI / 2;
  return {
    x: cx + r * Math.cos(mid),
    y: cy + r * Math.sin(mid),
    rotate: (index + 0.5) * (360 / total),
  };
}
