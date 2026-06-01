import { getAvatarSrc, getKfpAvatar } from '../data/kungFuPandaAvatars';

const COLOR_RING = {
  red: '#e53935',
  green: '#43a047',
  yellow: '#ffb300',
  blue: '#1e88e5',
};

function resolveAvatar(player, user) {
  if (String(player.id) === String(user?.id)) {
    return getAvatarSrc(user);
  }
  if (player.avatarUrl) {
    const kfp = getKfpAvatar(player.avatarUrl);
    if (kfp) return kfp.src;
    if (!player.avatarUrl.startsWith('kfp:')) return player.avatarUrl;
  }
  return getAvatarSrc({ avatar_url: 'kfp:po' });
}

export default function GamePlayerProfile({ player, user, isActive, isMe, className = '' }) {
  const ring = COLOR_RING[player.color] || '#fff';
  const name = player.displayName || player.username || 'Player';
  const avatarSrc = resolveAvatar(player, user);
  const isBot = Boolean(player.isBot);

  return (
    <div
      className={`game-player-profile game-player-profile--${player.color} game-player-profile--card ${isActive ? 'is-active' : ''} ${isMe ? 'is-me' : ''} ${isBot ? 'is-bot' : ''} ${className}`.trim()}
      title={isMe ? `You (${name})` : name}
    >
      <div className="game-player-profile-avatar-wrap" style={{ '--player-color': ring }}>
        <img src={avatarSrc} alt="" className="game-player-profile-avatar" />
        {isActive && <span className="game-player-profile-turn" aria-hidden />}
      </div>
      <div className="game-player-profile-meta">
        <span className="game-player-profile-name">{name}</span>
        <span className="game-player-profile-sub">
          {isMe ? 'You' : isBot ? 'Opponent' : 'Player'}
        </span>
      </div>
    </div>
  );
}
