import rawData from './portfolio.json';

export type CategoryId = 'all' | 'illust' | '3d' | 'live2d' | 'video' | 'mc_pixel' | 'design';

export interface ArtworkItem {
  id: string;
  title: string;
  desc: string;
  showTitle: boolean;
  category: Exclude<CategoryId, 'all'>;
  subTag: string;
  thumbUrl: string;
  fullUrl: string;
  type: 'image' | 'video' | 'youtube';
  youtubeId?: string;
}

interface RawPortfolioEntry {
  title?: string;
  desc?: string;
  showTitle?: boolean;
  src?: string;
  thumbnailPath?: string;
  type?: string;
  youtubeId?: string;
  youtubeUrl?: string;
}

interface RawPortfolioJson {
  profile?: {
    bio?: string;
    email?: string;
    commissionLinkUrl?: string;
    profileImgUrl?: string;
  };
  portfolio?: Record<string, RawPortfolioEntry[]>;
}

const typedData = rawData as RawPortfolioJson;

const normalizePath = (p?: string) => {
  if (!p) return '';
  if (p.startsWith('http')) return p;
  return '/' + p.replace(/^\.\//, '');
};

const KEY_MAP: Record<string, { category: Exclude<CategoryId, 'all'>; subTag: string }> = {
  'thumbnail-ld': { category: 'illust', subTag: 'LD 썸네일' },
  'thumbnail-sd': { category: 'illust', subTag: 'SD 썸네일' },
  'thumbnail-composite': { category: 'illust', subTag: '합성 썸네일' },
  'illust-simple': { category: 'illust', subTag: '심플' },
  'illust-line': { category: 'illust', subTag: '선화' },
  'illust-semi-painted': { category: 'illust', subTag: '반무테' },
  'illust-cover': { category: 'illust', subTag: '커버일러스트' },
  'illust-rough': { category: 'illust', subTag: '러프퀄' },
  'illust-conceptart': { category: 'illust', subTag: '컨셉아트' },
  'work3d-character': { category: '3d', subTag: '캐릭터' },
  'work3d-item': { category: '3d', subTag: '아이템' },
  'work3d-bg': { category: '3d', subTag: '배경' },
  'live2d-work': { category: 'live2d', subTag: 'Live2D' },
  'pixel-illust': { category: 'mc_pixel', subTag: '픽셀아트' },
  'pixel-game': { category: 'mc_pixel', subTag: '게임소스' },
  'pixel-cursor': { category: 'mc_pixel', subTag: '마우스 커서' },
  'mc-skin': { category: 'mc_pixel', subTag: 'MC 스킨' },
  'mc-model': { category: 'mc_pixel', subTag: 'MC 모델링' },
  'mc-animation': { category: 'mc_pixel', subTag: 'MC 애니메이션' },
  'mc-resource': { category: 'mc_pixel', subTag: '리소스팩' },
  'mvAnimationGrid': { category: 'video', subTag: 'MV' },
  'animation2DGrid': { category: 'video', subTag: '2D Animation' },
  'animation3DGrid': { category: 'video', subTag: '3D Animation' },
  'brand-wait': { category: 'design', subTag: '방송 대기화면' },
  'brand-symbol': { category: 'design', subTag: '심볼 디자인' },
  'brand-emote': { category: 'design', subTag: '이모티콘' },
  'brand-poster': { category: 'design', subTag: '포스터' },
  'brand-etc': { category: 'design', subTag: '기타' },
};

const profileRaw = typedData.profile || {};

export const ARTIST_PROFILE = {
  brand: 'BOWONE',
  tagline: 'Multimedia Artist · Commission Open',
  roles: ['Illustrator', 'Animator', '3D Modeler'],
  bio:
    profileRaw.bio ||
    '일러스트, 애니메이션, 3D 모델링을 중심으로 다양한 디지털 콘텐츠를 제작하고 있는 멀티미디어 아티스트 보원입니다. 캐릭터 디자인부터 MV 제작, 게임용 픽셀아트 및 마인크래프트 리소스 제작까지 폭넓은 작업을 진행하고 있습니다.',
  email: profileRaw.email || 'agentdh@naver.com',
  discordUrl: profileRaw.commissionLinkUrl || 'https://discord.gg/QGsfqz9HPC',
  profileImg: normalizePath(profileRaw.profileImgUrl) || '/opimage/1782689883234-무제22_20241013202118.png',
  commissionOpen: true,
  socials: [
    { name: 'X (Twitter)', handle: '@bowone_agentdh', url: 'https://x.com/bowone_agentdh' },
    { name: '크레페', handle: 'Crepe', url: 'https://crepe.cm/@agentdh' },
    { name: '아트머그', handle: 'Artmug', url: 'https://artmug.kr/index.php?channel=list&field=brand&search=YWdlbnRkaA==' },
    { name: '커미', handle: 'Commi', url: 'https://commi.kr/agentdh' },
    { name: 'YouTube', handle: '@agentdh', url: 'https://www.youtube.com/@agentdh' },
    { name: 'Instagram', handle: '@agentdhone', url: 'https://www.instagram.com/agentdhone/' },
  ],
  education: '한국영상대학교 게임콘텐츠전공',
  awards: ['2026 한국게임학회 × 넥슨게임즈 입선'],
  tools: {
    ILLUST: ['Clip Studio Paint', 'Photoshop', 'Aseprite', 'ibis Paint X', 'Paint Tool SAI'],
    ANIM: ['Live2D Cubism', 'Spine', 'Clip Studio Paint'],
    VIDEO: ['After Effects', 'Premiere Pro'],
    '3D': ['Maya', 'Blender', 'ZBrush', 'Marvelous Designer', 'Substance Painter'],
    ETC: ['Blockbench', 'MC Skin Editor', 'Mine-imator', 'Cubik Studio'],
  },
  outsourcing: [
    { period: '2022.12.01 ~ 2023.07.31', client: '벌스워크 주식회사', desc: '마인크래프트 스킨 · 모델 · 애니메이션' },
    { period: '2021.01.02 ~ 2021.01.10', client: '우마공', desc: '10주년 기념 타이틀 배너 디자인' },
    { period: '2020.10.31 ~ 2020.12.31', client: '샌드박스네트워크', desc: '마인크래프트 스킨 모델 및 애니메이션' },
    { period: '2020.09.04 ~ 2020.10.10', client: '샌드박스네트워크', desc: '마인크래프트 모델링 및 애니메이션' },
  ],
  crewActive: [
    { period: '2026.01.13 ~', name: '김루야', status: '동부 활동' },
    { period: '2025.11.19 ~', name: '조아햄', status: '동부 활동' },
    { period: '2023.11.17 ~ 2024.05.19 / 2025.11.19 ~', name: '배비꼬', status: '동부 활동' },
  ],
  crewArchived: [
    { period: '2025.12.08 ~ 2026.03.13', name: '다비', status: '작업 중단' },
    { period: '2025.11.19 ~', name: '이보늬', status: '보류' },
    { period: '2021.11.22 ~ 2024.05.19', name: '쵸봄', status: '작업 중단' },
  ],
};

const extractYoutubeId = (url?: string) => {
  if (!url) return undefined;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/\s]+)/);
  return match ? match[1] : undefined;
};

export const ARTWORKS: ArtworkItem[] = Object.entries(typedData.portfolio || {}).flatMap(
  ([key, items]) => {
    const mapped = KEY_MAP[key] || { category: 'design', subTag: key };
    if (!Array.isArray(items)) return [];

    return items.map((item, idx) => {
      const fullUrl = normalizePath(item.src);
      const ytId = item.youtubeId || extractYoutubeId(item.src) || extractYoutubeId(item.youtubeUrl);
      const ytThumb = ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : '';
      const thumbUrl = normalizePath(item.thumbnailPath) || ytThumb || fullUrl;

      return {
        id: `${key}-${idx}`,
        title: item.title?.trim() || '',
        desc: item.desc?.trim() || '',
        showTitle: Boolean(item.showTitle),
        category: mapped.category,
        subTag: mapped.subTag,
        thumbUrl,
        fullUrl,
        type: ytId ? 'youtube' : item.type === 'video' ? 'video' : 'image',
        youtubeId: ytId,
      };
    });
  }
);

export const CATEGORIES: { id: CategoryId; label: string; subTags: string[] }[] = [
  { id: 'all', label: 'All', subTags: [] },
  {
    id: 'illust',
    label: '일러스트',
    subTags: Array.from(new Set(ARTWORKS.filter((a) => a.category === 'illust').map((a) => a.subTag))),
  },
  {
    id: '3d',
    label: '3D 모델링',
    subTags: Array.from(new Set(ARTWORKS.filter((a) => a.category === '3d').map((a) => a.subTag))),
  },
  {
    id: 'live2d',
    label: 'Live2D',
    subTags: Array.from(new Set(ARTWORKS.filter((a) => a.category === 'live2d').map((a) => a.subTag))),
  },
  {
    id: 'video',
    label: '영상 / MV',
    subTags: Array.from(new Set(ARTWORKS.filter((a) => a.category === 'video').map((a) => a.subTag))),
  },
  {
    id: 'mc_pixel',
    label: '픽셀 / 마인크래프트',
    subTags: Array.from(new Set(ARTWORKS.filter((a) => a.category === 'mc_pixel').map((a) => a.subTag))),
  },
  {
    id: 'design',
    label: '디자인 / 기타',
    subTags: Array.from(new Set(ARTWORKS.filter((a) => a.category === 'design').map((a) => a.subTag))),
  },
];