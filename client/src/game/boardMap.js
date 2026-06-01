/** 15×15 layout — corners match board.png: Red TL, Green TR, Blue BL, Yellow BR */
export function createBoardMap() {
  const g = Array.from({ length: 15 }, () => Array(15).fill('W'));

  const fill = (r0, c0, r1, c1, t) => {
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) g[r][c] = t;
    }
  };

  fill(0, 0, 5, 5, 'B');
  fill(1, 1, 4, 4, 'BY');
  fill(0, 9, 5, 14, 'Y');
  fill(1, 10, 4, 13, 'YY');
  fill(9, 0, 14, 5, 'R');
  fill(10, 1, 13, 4, 'RY');
  fill(9, 9, 14, 14, 'G');
  fill(10, 10, 13, 13, 'GY');

  for (let r = 0; r < 6; r++) {
    g[r][6] = 'W';
    g[r][8] = 'W';
    g[r][7] = r === 0 ? 'YS' : 'YP';
  }
  g[1][8] = 'SF';

  for (let r = 9; r < 15; r++) {
    g[r][6] = 'W';
    g[r][8] = 'W';
    g[r][7] = r === 14 ? 'RS' : 'RP';
  }
  g[13][6] = 'SF';

  for (let c = 0; c < 6; c++) {
    g[6][c] = 'W';
    g[8][c] = 'W';
    g[7][c] = c === 0 ? 'BS' : 'BP';
  }
  g[6][1] = 'SF';

  for (let c = 9; c < 15; c++) {
    g[6][c] = 'W';
    g[8][c] = 'W';
    g[7][c] = c === 14 ? 'GS' : 'GP';
  }
  g[8][13] = 'SF';

  // Cross-arm connectors — keep a single connected 52-cell loop
  g[6][6] = 'W';
  g[6][7] = 'W';
  g[6][8] = 'W';
  g[7][6] = 'W';
  g[7][8] = 'W';
  g[8][6] = 'W';
  g[8][7] = 'W';
  g[8][8] = 'W';

  g[7][7] = 'CX';

  return g;
}

export const BOARD_MAP = createBoardMap();
