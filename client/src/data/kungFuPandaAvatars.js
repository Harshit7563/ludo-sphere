import manifest from './kfp-manifest.json';

const BASE = '/avatars/kfp';

export const KFP_AVATARS = [
  { id: 'po', name: 'Po', movie: 'KFP 1' },
  { id: 'shifu', name: 'Master Shifu', movie: 'KFP 1' },
  { id: 'tigress', name: 'Tigress', movie: 'KFP 1' },
  { id: 'crane', name: 'Crane', movie: 'KFP 1' },
  { id: 'mantis', name: 'Mantis', movie: 'KFP 1' },
  { id: 'viper', name: 'Viper', movie: 'KFP 1' },
  { id: 'monkey', name: 'Monkey', movie: 'KFP 1' },
  { id: 'oogway', name: 'Master Oogway', movie: 'KFP 1' },
  { id: 'tai-lung', name: 'Tai Lung', movie: 'KFP 1' },
  { id: 'mr-ping', name: 'Mr. Ping', movie: 'KFP 1' },
  { id: 'zeng', name: 'Zeng', movie: 'KFP 1' },
  { id: 'vachir', name: 'Commander Vachir', movie: 'KFP 1' },
  { id: 'shen', name: 'Lord Shen', movie: 'KFP 2' },
  { id: 'wolf-boss', name: 'Wolf Boss', movie: 'KFP 2' },
  { id: 'storming-ox', name: 'Storming Ox', movie: 'KFP 2' },
  { id: 'master-croc', name: 'Master Croc', movie: 'KFP 2' },
  { id: 'thunder-rhino', name: 'Thundering Rhino', movie: 'KFP 2' },
  { id: 'kai', name: 'Kai', movie: 'KFP 3' },
  { id: 'li-shan', name: 'Li Shan', movie: 'KFP 3' },
  { id: 'bao', name: 'Bao', movie: 'KFP 3' },
  { id: 'mei-mei', name: 'Mei Mei', movie: 'KFP 3' },
  { id: 'jindiao', name: 'Jindiao', movie: 'KFP 3' },
  { id: 'zhen', name: 'Zhen', movie: 'KFP 4' },
  { id: 'han', name: 'Han', movie: 'KFP 4' },
].map((char) => ({
  ...char,
  src: `${BASE}/${manifest[char.id]}`,
}));

export const DEFAULT_KFP_AVATAR = KFP_AVATARS[0];

export function parseAvatarId(avatarUrl) {
  if (!avatarUrl?.startsWith('kfp:')) return null;
  return avatarUrl.slice(4);
}

export function getKfpAvatar(avatarUrl) {
  const id = parseAvatarId(avatarUrl);
  if (!id) return null;
  return KFP_AVATARS.find((a) => a.id === id) || null;
}

export function getAvatarSrc(user) {
  const url = user?.avatar_url ?? user?.avatarUrl;
  const kfp = getKfpAvatar(url);
  if (kfp) return kfp.src;
  if (url) return url;
  return DEFAULT_KFP_AVATAR.src;
}

export function getAvatarName(user) {
  const url = user?.avatar_url ?? user?.avatarUrl;
  const kfp = getKfpAvatar(url);
  if (kfp) return kfp.name;
  if (url && !url.startsWith('kfp:')) return 'Gallery Photo';
  return user?.display_name || user?.username || 'Player';
}
