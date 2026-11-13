'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ARTWORKS, CATEGORIES, CategoryId, ArtworkItem } from '@/data/portfolio';
import { X, Play, ChevronDown } from 'lucide-react';

const PAGE_SIZE = 16;

export default function GallerySection() {
  const [selectedCat, setSelectedCat] = useState<CategoryId>('all');
  const [selectedSubTag, setSelectedSubTag] = useState<string>('ALL');
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [activeArtwork, setActiveArtwork] = useState<ArtworkItem | null>(null);

  const currentCategoryObj = CATEGORIES.find((c) => c.id === selectedCat);

  const filteredArtworks = useMemo(() => {
    return ARTWORKS.filter((item) => {
      const catMatch = selectedCat === 'all' || item.category === selectedCat;
      const subMatch = selectedSubTag === 'ALL' || item.subTag === selectedSubTag;
      return catMatch && subMatch;
    });
  }, [selectedCat, selectedSubTag]);

  const visibleArtworks = filteredArtworks.slice(0, visibleCount);

  const handleCategoryChange = (catId: CategoryId) => {
    setSelectedCat(catId);
    setSelectedSubTag('ALL');
    setVisibleCount(PAGE_SIZE);
  };

  const handleSubTagChange = (tag: string) => {
    setSelectedSubTag(tag);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <section id="works" className="py-16 px-6 max-w-7xl mx-auto">
      {/* 1차 대분류 탭: 형광 시안 대신 모노톤 화이트 강조 */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCat === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? 'bg-zinc-100 text-zinc-950 font-semibold'
                  : 'bg-[#191B20] text-zinc-400 hover:text-zinc-100 border border-white/[0.08]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 2차 세부 태그 필터: 형광 퍼플 대신 차분한 짙은 그레이 강조 */}
      {currentCategoryObj && currentCategoryObj.subTags.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-8">
          <button
            onClick={() => handleSubTagChange('ALL')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              selectedSubTag === 'ALL'
                ? 'bg-zinc-700/80 text-white border border-zinc-500/50'
                : 'bg-white/[0.03] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            전체보기 ({filteredArtworks.length})
          </button>
          {currentCategoryObj.subTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleSubTagChange(tag)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                selectedSubTag === tag
                  ? 'bg-zinc-700/80 text-white border border-zinc-500/50'
                  : 'bg-white/[0.03] text-zinc-400 hover:text-zinc-200'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* 갤러리 그리드: 카드 테두리/배지 채도를 죽여서 그림 색감만 돋보이게 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
        {visibleArtworks.map((art) => (
          <div
            key={art.id}
            onClick={() => setActiveArtwork(art)}
            className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-[#191B20] border border-white/[0.08] hover:border-zinc-400/50 cursor-pointer transition-all"
          >
            <img
              src={art.thumbUrl}
              alt={art.title || art.subTag}
              loading="lazy"
              onError={(e) => {
                if (art.youtubeId) {
                  e.currentTarget.src = `https://i.ytimg.com/vi/${art.youtubeId}/hqdefault.jpg`;
                }
              }}
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
            />

            <div className="absolute top-2.5 right-2.5">
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-black/70 backdrop-blur-md text-zinc-200 border border-white/10">
                {art.subTag}
              </span>
            </div>

            {(art.type === 'youtube' || art.type === 'video') && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/40 transition">
                <div className="w-11 h-11 rounded-full bg-white/90 text-zinc-950 flex items-center justify-center shadow-md">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
              </div>
            )}

            {art.showTitle && art.title && (
              <div className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                <h3 className="text-sm font-semibold text-white truncate">{art.title}</h3>
                {art.desc && <p className="text-xs text-zinc-300 truncate mt-0.5">{art.desc}</p>}
              </div>
            )}
          </div>
        ))}
      </div>

      {visibleCount < filteredArtworks.length && (
        <div className="mt-10 text-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-[#191B20] hover:bg-white/10 text-zinc-200 border border-white/10 transition"
          >
            작업물 더 보기 ({visibleCount} / {filteredArtworks.length})
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      )}

      {/* 확대 모달 */}
      <AnimatePresence>
        {activeArtwork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveArtwork(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-[#191B20] border border-white/15 rounded-2xl overflow-hidden shadow-2xl"
            >
              <button
                onClick={() => setActiveArtwork(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/70 text-zinc-200 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>

              {activeArtwork.type === 'youtube' && activeArtwork.youtubeId ? (
                <div className="aspect-video w-full bg-black">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${activeArtwork.youtubeId}`}
                    title={activeArtwork.title || activeArtwork.subTag}
                    allowFullScreen
                  />
                </div>
              ) : activeArtwork.type === 'video' ? (
                <div className="max-h-[75vh] bg-black flex justify-center">
                  <video src={activeArtwork.fullUrl} controls autoPlay className="max-h-[75vh] w-auto" />
                </div>
              ) : (
                <div className="max-h-[75vh] overflow-auto bg-black/50 flex justify-center">
                  <img
                    src={activeArtwork.fullUrl}
                    alt={activeArtwork.title || activeArtwork.subTag}
                    className="max-h-[75vh] w-auto object-contain"
                  />
                </div>
              )}

              <div className="p-5 border-t border-white/10">
                <span className="text-xs font-medium text-zinc-400">{activeArtwork.subTag}</span>
                {activeArtwork.showTitle && activeArtwork.title && (
                  <h3 className="text-lg font-bold text-white mt-1">{activeArtwork.title}</h3>
                )}
                {activeArtwork.desc && (
                  <p className="text-sm text-zinc-300 mt-1.5 leading-relaxed">{activeArtwork.desc}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}