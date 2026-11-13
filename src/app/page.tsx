import HeroSection from '@/components/HeroSection';
import GallerySection from '@/components/GallerySection';
import CommissionGuide from '@/components/CommissionGuide';
import { ARTIST_PROFILE } from '@/data/portfolio';

const WORK_FIELDS = [
  { tag: 'ILLUST', title: '일러스트', desc: '2D 일러스트 · 썸네일 · 방송소스 · 컨셉아트 · 디자인' },
  { tag: 'VIDEO', title: '영상', desc: 'MV 제작 · 2D 애니메이션 · 3D 애니메이션' },
  { tag: '3D', title: '모델링', desc: '캐릭터 · 배경 소품 · 방송 배경' },
  { tag: 'MC', title: '마인크래프트', desc: '스킨 · 리소스팩 · 마인크래프트 애니메이션' },
  { tag: 'ETC', title: '기타', desc: 'Live2D · 픽셀아트' },
];

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-[#0B0D12] text-slate-100 selection:bg-cyan-400 selection:text-slate-950">
      <nav className="fixed top-0 inset-x-0 z-40 bg-[#0B0D12]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" className="text-xl font-black tracking-wider text-cyan-400">
            BOWONE
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#works" className="hover:text-white transition">Works</a>
            <a href="#about" className="hover:text-white transition">About & Career</a>
            <a href="#commissions" className="hover:text-white transition">Commissions</a>
          </div>
          <a
            href={ARTIST_PROFILE.discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg text-xs font-bold bg-purple-600/20 text-purple-300 border border-purple-500/40 hover:bg-purple-600/30 transition"
          >
            Discord 의뢰하기
          </a>
        </div>
      </nav>

      <HeroSection />
      <GallerySection />

      {/* 프로필 & 이력 섹션 */}
      <section id="about" className="py-20 px-6 max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 좌측: 학력 + 작업 영역 + 사용 프로그램 */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#131722] border border-white/10">
              <h3 className="text-sm font-bold text-slate-400 mb-2">학력</h3>
              <p className="text-base font-bold text-white">{ARTIST_PROFILE.education}</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#131722] border border-white/10 space-y-4">
              <h3 className="text-lg font-bold text-cyan-300">작업 분야</h3>
              <div className="space-y-3">
                {WORK_FIELDS.map((field) => (
                  <div key={field.tag} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shrink-0 mt-0.5">
                      {field.tag}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-200">{field.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{field.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#131722] border border-white/10 space-y-4">
              <h3 className="text-lg font-bold text-cyan-300">사용하는 프로그램</h3>
              {Object.entries(ARTIST_PROFILE.tools).map(([group, list]) => (
                <div key={group} className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-400">{group}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {list.map((tool) => (
                      <span key={tool} className="px-2.5 py-1 rounded-md text-xs bg-white/5 text-slate-200 border border-white/5">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 우측: 수상/외주 이력 + 동부 활동(진행/중단·보류) */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#131722] border border-white/10 space-y-4">
              <h3 className="text-lg font-bold text-purple-300">수상 및 외주 이력</h3>
              <ul className="space-y-3 text-sm">
                {ARTIST_PROFILE.awards.map((award) => (
                  <li key={award} className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-200 font-semibold">
                    🏆 {award}
                  </li>
                ))}
                {ARTIST_PROFILE.outsourcing.map((item, i) => (
                  <li key={i} className="flex flex-col sm:flex-row sm:justify-between border-b border-white/5 pb-2.5 last:border-none">
                    <div>
                      <span className="font-bold text-slate-200">{item.client}</span>
                      <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                    <span className="text-xs text-slate-500 mt-1 sm:mt-0 shrink-0">{item.period}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-[#131722] border border-white/10 space-y-5">
              <h3 className="text-lg font-bold text-cyan-300">동부 활동</h3>
              <div className="space-y-2.5">
                {ARTIST_PROFILE.crewActive.map((c) => (
                  <div key={c.name} className="flex items-center justify-between p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                    <div>
                      <span className="font-bold text-sm text-white">{c.name}</span>
                      <span className="ml-2 text-xs text-cyan-300">{c.status}</span>
                    </div>
                    <span className="text-xs text-slate-400 text-right">{c.period}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-white/10">
                <p className="text-xs font-semibold text-slate-500 mb-3 text-center">
                  작업 중단 및 보류
                </p>
                <div className="space-y-2">
                  {ARTIST_PROFILE.crewArchived.map((c) => (
                    <div key={c.name} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] text-xs text-slate-400">
                      <div>
                        <span className="font-semibold text-slate-300">{c.name}</span>
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-white/5 text-[11px] text-slate-400">
                          {c.status}
                        </span>
                      </div>
                      <span className="text-slate-500">{c.period}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CommissionGuide />

      <footer className="py-10 text-center text-xs text-slate-500 border-t border-white/5">
        © 2026 BOWONE. All rights reserved.
      </footer>
    </main>
  );
}
