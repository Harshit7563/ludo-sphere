/** Global Head & Tail round clock — same countdown on every device. */

const ROUND_MS = 15_000;
const TICK_MS = 250;

let io = null;
let tickTimer = null;

export function getCurrentRoundState(overrides = {}) {
  const betSeconds = overrides.betSeconds ?? 15;
  const betCloseSeconds = Math.min(
    betSeconds - 1,
    Math.max(0, overrides.betCloseSeconds ?? 5),
  );
  const now = Date.now();
  const roundIndex = Math.floor(now / ROUND_MS);
  const roundStart = roundIndex * ROUND_MS;
  const roundEndsAt = roundStart + ROUND_MS;
  const msLeft = Math.max(0, roundEndsAt - now);
  // floor so the countdown reaches 0 in the last second (ceil skips 0 at round boundary)
  const secondsLeft = Math.max(0, Math.floor(msLeft / 1000));
  const betsOpen = secondsLeft > betCloseSeconds;

  return {
    roundId: roundIndex,
    serverTime: now,
    roundStart,
    roundEndsAt,
    secondsLeft,
    betSeconds,
    betCloseSeconds,
    betsOpen,
  };
}

export function startHeadTailRoundClock(socketIo) {
  if (tickTimer) return;
  io = socketIo;

  const broadcast = () => {
    if (!io) return;
    const state = getCurrentRoundState();
    io.emit('headtail:tick', state);
  };

  broadcast();
  tickTimer = setInterval(broadcast, TICK_MS);
}

export function stopHeadTailRoundClock() {
  if (tickTimer) clearInterval(tickTimer);
  tickTimer = null;
  io = null;
}

export function emitRoundStateToSocket(socket) {
  socket.emit('headtail:tick', getCurrentRoundState());
}
