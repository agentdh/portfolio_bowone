'use client';

import { motion } from 'framer-motion';
import { ARTIST_PROFILE, ARTWORKS } from '@/data/portfolio';
import { ExternalLink, Sparkles, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function HeroSection() {
  const [copied, setCopied] = useState(false);

  const featuredIllust =
    ARTWORKS.find((a) => a.category === 'illust')?.thumbUrl || ARTIST_PROFILE.profileImg;
  const featured3D =
    ARTWORKS.find((a) => a.category === '3d' || a.category === 'live2d')?.thumbUrl ||
    ARTIST_PROFILE.profileImg;

  const copyEmail = () => {
    navigator.clipboard.writeText(ARTIST_PROFILE.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative overflow-hidden pt-28 pb-20 px-6 max-w-7xl mx-auto">
      <div className="pointer-events-none absolute top-10 left-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute top-20 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px]" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block lg:col-span-3"
        >
          <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-cyan-400/60 to-purple-500/20 shadow-[0_0_30px_rgba(34,211,238,0.15)]">
            <div className="aspect-[3/4] rounded-2xl bg-[#131722] overflow-hidden relative">
              <img
                src={featuredIllust}
                alt="대표 일러스트"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute bottom-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full bg-black/70 text-cyan-300 border border-cyan-500/30">
                2D ILLUST
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-6 text-center space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            {ARTIST_PROFILE.tagline}
          </div>

          <h1 className="text-6xl sm:text-7xl font-black tracking-tight bg-gradient-to-r from-cyan-300 via-sky-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(56,189,248,0.3)]">
            {ARTIST_PROFILE.brand}
          </h1>

          <p className="text-lg sm:text-xl font-medium text-slate-300 tracking-wide">
            {ARTIST_PROFILE.roles.join(' · ')}
          </p>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl mx-auto whitespace-pre-line">
            {ARTIST_PROFILE.bio}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href={ARTIST_PROFILE.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:opacity-90 transition"
            >
              Discord 의뢰하러 가기
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={copyEmail}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              {copied ? '이메일 복사 완료!' : ARTIST_PROFILE.email}
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {ARTIST_PROFILE.socials.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#131722] text-slate-400 hover:text-cyan-300 border border-white/5 hover:border-cyan-400/40 transition"
              >
                {social.name}
              </a>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block lg:col-span-3"
        >
          <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-purple-400/60 to-cyan-500/20 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
            <div className="aspect-[3/4] rounded-2xl bg-[#131722] overflow-hidden relative">
              <img
                src={featured3D}
                alt="대표 3D 모델링"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute bottom-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full bg-black/70 text-purple-300 border border-purple-500/30">
                3D & LIVE2D
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
