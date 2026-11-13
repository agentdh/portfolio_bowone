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
    <section id="works" className="py-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-center gap-2.5 mb-5">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCat === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.5)]'
                  : 'bg-[#131722] text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {currentCategoryObj && currentCategoryObj.subTags.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <button
            onClick={() => handleSubTagChange('ALL')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              selectedSubTag === 'ALL'
                ? 'bg-purple-500/30 text-purple-200 border border-purple-400/50'
                : 'bg-white/5 text-slate-400 hover:text-slate-200'
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
                  ? 'bg-purple-500/30 text-purple-200 border border-purple-400/50'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {visibleArtworks.map((art) => (
          <div
            key={art.id}
            onClick={() => setActiveArtwork(art)}
            className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#131722] border border-white/10 hover:border-cyan-400/60 cursor-pointer transition-all hover:shadow-[0_0_25px_rgba(34,211,238,0.2)]"
          >
            <img
              src={art.thumbUrl}
              alt={art.title || art.subTag}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            <div className="absolute top-3 right-3">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-black/75 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
                {art.subTag}
              </span>
            </div>

            {(art.type === 'youtube' || art.type === 'video') && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition">
                <div className="w-12 h-12 rounded-full bg-cyan-400/90 text-slate-950 flex items-center justify-center shadow-lg">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {visibleCount < filteredArtworks.length && (
        <div className="mt-10 text-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-[#131722] hover:bg-white/10 text-cyan-300 border border-cyan-500/30 transition"
          >
            작업물 더 보기 ({visibleCount} / {filteredArtworks.length})
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}

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
              className="relative w-full max-w-4xl bg-[#131722] border border-cyan-500/30 rounded-2xl overflow-hidden shadow-2xl"
            >
              <button
                onClick={() => setActiveArtwork(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/70 text-white hover:text-cyan-400 transition"
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

              <div className="p-6 border-t border-white/10">
                <span className="text-xs font-semibold text-cyan-400">{activeArtwork.subTag}</span>
                {activeArtwork.title && (
                  <h3 className="text-xl font-bold text-white mt-1">{activeArtwork.title}</h3>
                )}
                {activeArtwork.desc && (
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">{activeArtwork.desc}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
