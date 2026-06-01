/** 50 Indian boy + 50 Indian girl names for AI opponents */
export const INDIAN_BOY_NAMES = [
  'Aarav', 'Vihaan', 'Arjun', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya',
  'Atharv', 'Advait', 'Dhruv', 'Kabir', 'Ritvik', 'Aarush', 'Anirudh', 'Vivaan',
  'Aditya', 'Sai', 'Rudra', 'Parth', 'Dev', 'Neil', 'Yash', 'Rohan', 'Karan',
  'Harsh', 'Manav', 'Kunal', 'Nikhil', 'Rahul', 'Amit', 'Raj', 'Vikram', 'Suresh',
  'Ravi', 'Deepak', 'Manish', 'Sandeep', 'Varun', 'Gaurav', 'Pranav', 'Shubham',
  'Akash', 'Mohit', 'Tarun', 'Naveen', 'Ashwin', 'Bharat', 'Chetan', 'Dinesh',
];

export const INDIAN_GIRL_NAMES = [
  'Aadhya', 'Ananya', 'Diya', 'Myra', 'Kiara', 'Pari', 'Anika', 'Navya',
  'Aanya', 'Riya', 'Saanvi', 'Ishita', 'Prisha', 'Avni', 'Kavya', 'Sara',
  'Zara', 'Nisha', 'Priya', 'Sneha', 'Pooja', 'Anjali', 'Neha', 'Shruti',
  'Divya', 'Meera', 'Lakshmi', 'Sunita', 'Kavita', 'Rekha', 'Geeta', 'Sita',
  'Tara', 'Mira', 'Nandini', 'Ishani', 'Aishwarya', 'Deepika', 'Kiran', 'Jasleen',
  'Harleen', 'Simran', 'Manpreet', 'Gurpreet', 'Bhavna', 'Swati', 'Shilpa', 'Tanvi',
  'Ishika', 'Muskan',
];

const KFP_AVATAR_IDS = [
  'po', 'shifu', 'tigress', 'crane', 'mantis', 'viper', 'monkey', 'oogway',
  'tai-lung', 'mr-ping', 'zeng', 'vachir', 'shen', 'wolf-boss', 'storming-ox',
  'master-croc', 'thunder-rhino', 'kai', 'li-shan', 'bao', 'mei-mei', 'jindiao',
  'zhen', 'han',
];

export function pickRandomIndianName() {
  const pool = Math.random() < 0.5 ? INDIAN_BOY_NAMES : INDIAN_GIRL_NAMES;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function pickRandomAiAvatar() {
  const id = KFP_AVATAR_IDS[Math.floor(Math.random() * KFP_AVATAR_IDS.length)];
  return `kfp:${id}`;
}

export async function buildPlayerProfiles(pool, playerIds, botOverrides = null) {
  const result = await pool.query(
    `SELECT id, username, display_name, avatar_url FROM users WHERE id = ANY($1::uuid[])`,
    [playerIds]
  );

  const profiles = {};
  for (const row of result.rows) {
    const isBot = botOverrides && String(row.id) === String(botOverrides.botId);
    profiles[row.id] = {
      displayName: isBot
        ? botOverrides.displayName
        : (row.display_name || row.username || 'Player'),
      avatarUrl: isBot ? botOverrides.avatarUrl : (row.avatar_url || 'kfp:po'),
      isBot: Boolean(isBot),
    };
  }

  if (botOverrides?.botId && !profiles[botOverrides.botId]) {
    profiles[botOverrides.botId] = {
      displayName: botOverrides.displayName,
      avatarUrl: botOverrides.avatarUrl,
      isBot: true,
    };
  }

  return profiles;
}
