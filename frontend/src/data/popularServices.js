export const POPULAR_SERVICES = [
  // 동영상
  { id: 'netflix',         name: 'Netflix',          category: '동영상', color: '#E50914', website: 'https://www.netflix.com' },
  { id: 'youtube-premium', name: 'YouTube Premium',  category: '동영상', color: '#FF0000', website: 'https://www.youtube.com/premium' },
  { id: 'disney-plus',     name: 'Disney+',          category: '동영상', color: '#113CCF', website: 'https://www.disneyplus.com' },
  { id: 'tving',           name: '티빙',              category: '동영상', color: '#FF153C', website: 'https://www.tving.com' },
  { id: 'watcha',          name: '왓챠',              category: '동영상', color: '#FF0558', website: 'https://watcha.com' },
  { id: 'wavve',           name: '웨이브',             category: '동영상', color: '#003699', website: 'https://www.wavve.com' },
  { id: 'apple-tv',        name: 'Apple TV+',        category: '동영상', color: '#555555', website: 'https://tv.apple.com' },
  // 음악
  { id: 'spotify',         name: 'Spotify',          category: '음악',   color: '#1DB954', website: 'https://www.spotify.com' },
  { id: 'apple-music',     name: 'Apple Music',      category: '음악',   color: '#FC3C44', website: 'https://music.apple.com' },
  { id: 'melon',           name: '멜론',              category: '음악',   color: '#00CD3C', website: 'https://www.melon.com' },
  { id: 'genie',           name: '지니뮤직',           category: '음악',   color: '#006DDB', website: 'https://www.genie.co.kr' },
  { id: 'youtube-music',   name: 'YouTube Music',    category: '음악',   color: '#FF0000', website: 'https://music.youtube.com' },
  // 게임
  { id: 'nintendo',        name: '닌텐도 온라인',      category: '게임',   color: '#E60012', website: 'https://www.nintendo.com' },
  { id: 'playstation',     name: 'PlayStation Plus', category: '게임',   color: '#003791', website: 'https://www.playstation.com' },
  { id: 'xbox',            name: 'Xbox Game Pass',   category: '게임',   color: '#107C10', website: 'https://www.xbox.com/xbox-game-pass' },
  // 클라우드
  { id: 'icloud',          name: 'iCloud+',          category: '클라우드', color: '#3693F3', website: 'https://www.icloud.com' },
  { id: 'google-one',      name: 'Google One',       category: '클라우드', color: '#4285F4', website: 'https://one.google.com' },
  { id: 'naver-cloud',     name: '네이버 클라우드',    category: '클라우드', color: '#03C75A', website: 'https://mybox.naver.com' },
  // 업무
  { id: 'microsoft-365',  name: 'Microsoft 365',    category: '업무',   color: '#D83B01', website: 'https://www.microsoft.com/microsoft-365' },
  { id: 'notion',          name: 'Notion',           category: '업무',   color: '#000000', website: 'https://www.notion.so' },
  { id: 'adobe-cc',        name: 'Adobe CC',         category: '업무',   color: '#FF0000', website: 'https://www.adobe.com/creativecloud.html' },
  { id: 'slack',           name: 'Slack',            category: '업무',   color: '#4A154B', website: 'https://slack.com' },
  // 쇼핑
  { id: 'coupang-wow',     name: '쿠팡 로켓와우',     category: '쇼핑',   color: '#FFCD00', website: 'https://www.coupang.com' },
]

export const SERVICE_WEBSITE_MAP = Object.fromEntries(
  POPULAR_SERVICES.map((s) => [s.name, s.website])
)
