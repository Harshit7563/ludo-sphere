import GamePlayerProfile from './GamePlayerProfile';

const BOARD_CORNERS = ['green', 'yellow', 'red', 'blue'];

export default function GamePlayerProfiles({ gameState, user }) {
  const players = gameState?.players || [];
  if (!players.length) return null;

  const currentId = players[gameState.currentTurn]?.id;
  const byColor = Object.fromEntries(players.map(p => [p.color, p]));

  return (
    <div className="game-player-profiles game-player-profiles--board" aria-label="Players">
      {BOARD_CORNERS.map(color => {
        const player = byColor[color];
        if (!player) return null;
        return (
          <GamePlayerProfile
            key={player.id}
            player={player}
            user={user}
            isActive={player.id === currentId}
            isMe={String(player.id) === String(user?.id)}
          />
        );
      })}
    </div>
  );
}
