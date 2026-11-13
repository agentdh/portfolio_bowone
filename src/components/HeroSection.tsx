'use client';

import { useState } from 'react';
import { ARTIST_PROFILE, ARTWORKS } from '@/data/portfolio';
import { Copy, Check, ExternalLink } from 'lucide-react';

export default function HeroSection() {
  const [copied, setCopied] = useState(false);

  // 실제 존재하는 첫 번째 일러스트와 3D 작업물을 자동으로 대표 이미지로 사용
  const featuredIllust =
    ARTWORKS.find((a) => a.category === 'illust' && a.thumbUrl)?.thumbUrl || ARTIST_PROFILE.profileImg;
  const featured3D =
    ARTWORKS.find((a) => a.category === '3d' && a.thumbUrl)?.thumbUrl || ARTIST_PROFILE.profileImg;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(ARTIST_PROFILE.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative pt-28 pb-16 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* 좌측 대표 아트워크 */}
        <div className="lg:col-span-3 hidden lg:block">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-[#191B20]">
            <img
              src={featuredIllust}
              alt="Featured Illustration"
              className="w-full h-full object-cover opacity-90 hover:opacity-100 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121316] via-transparent to-transparent" />
            <span className="absolute bottom-3 left-3 text-[11px] font-medium tracking-wider text-zinc-300 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded">
              2D ILLUST
            </span>
          </div>
        </div>

        {/* 중앙 프로필 & 액션 */}
        <div className="lg:col-span-6 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-zinc-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{ARTIST_PROFILE.tagline}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            {ARTIST_PROFILE.brand}
          </h1>

          <p className="text-sm font-medium tracking-wide text-zinc-400">
            {ARTIST_PROFILE.roles.join(' · ')}
          </p>

          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            {ARTIST_PROFILE.bio}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href={ARTIST_PROFILE.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-zinc-100 hover:bg-white text-zinc-950 transition"
            >
              <span>Discord 의뢰하기</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={handleCopyEmail}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-[#191B20] hover:bg-white/10 text-zinc-200 border border-white/10 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              <span>{copied ? '이메일 복사됨' : ARTIST_PROFILE.email}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
            {ARTIST_PROFILE.socials.map((soc) => (
              <a
                key={soc.name}
                href={soc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-100 border border-white/[0.07] transition"
              >
                {soc.name}
              </a>
            ))}
          </div>
        </div>

        {/* 우측 대표 3D/Live2D */}
        <div className="lg:col-span-3 hidden lg:block">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-[#191B20]">
            <img
              src={featured3D}
              alt="Featured 3D Work"
              className="w-full h-full object-cover opacity-90 hover:opacity-100 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121316] via-transparent to-transparent" />
            <span className="absolute bottom-3 left-3 text-[11px] font-medium tracking-wider text-zinc-300 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded">
              3D & LIVE2D
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}