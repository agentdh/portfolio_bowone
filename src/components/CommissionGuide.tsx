'use client';

import { useState } from 'react';
import { Copy, Check, ShieldAlert, FileText, AlertTriangle } from 'lucide-react';

const PROCESS_STEPS = [
  '문의',
  '확인 및 수락',
  '작업 시작',
  '중간 점검',
  '작업 완료',
  '후불 입금',
  '원본 파일 전달',
];

const COMMISSION_TEMPLATE = `[BOWONE 커미션 신청 양식]
1. 신청 타입 (일러스트 / Live2D / 3D / MV / 마인크래프트 등): 
2. 사용 용도 (비상업용 / 방송용 / 상업용): 
3. 캐릭터 및 작업 상세 설명 (레퍼런스 이미지 첨부): 
4. 희망 마감일: 
5. 기타 요청사항: `;

export default function CommissionGuide() {
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(COMMISSION_TEMPLATE);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  return (
    <section id="commissions" className="py-20 px-6 max-w-6xl mx-auto space-y-12">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-white">Commission Guide & Policy</h2>
        <p className="text-sm text-slate-400">
          원활한 작업 진행을 위해 신청 전 작업 순서와 이용 방침을 확인해 주세요.
        </p>
      </div>

      {/* 1. 작업 진행 순서 */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#131722] border border-white/10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-cyan-300">작업 진행 순서 (후불제 기본)</h3>
          <span className="text-xs text-slate-400">
            수정 및 컨펌 횟수 제한 없음 (단, 캐릭터 디자인 대폭 변경 시 추가금 발생)
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {PROCESS_STEPS.map((step, idx) => (
            <div
              key={step}
              className="relative p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-center"
            >
              <span className="block text-[11px] font-bold text-purple-400 mb-1">
                STEP 0{idx + 1}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-200">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. 작업물 이용 방침 안내 */}
      <div className="rounded-2xl bg-[#131722] border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">작업물 이용 방침 안내</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead className="bg-white/[0.04] text-slate-300 text-xs">
              <tr>
                <th className="py-4 px-4 text-left">구분</th>
                <th className="py-4 px-4">개인 소장 / SNS 프로필</th>
                <th className="py-4 px-4">방송용 커버 / 방송화면</th>
                <th className="py-4 px-4">굿즈 / 이모티콘 제작</th>
                <th className="py-4 px-4">2차 수정 및 사용</th>
                <th className="py-4 px-4">저작권 소유자</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              <tr>
                <td className="py-4 px-4 text-left font-bold text-cyan-300">비상업용</td>
                <td className="text-emerald-400 font-bold">✓</td>
                <td className="text-rose-400">✗</td>
                <td className="text-rose-400">✗</td>
                <td className="text-rose-400">✗</td>
                <td>보원</td>
              </tr>
              <tr>
                <td className="py-4 px-4 text-left font-bold text-purple-300">방송용</td>
                <td className="text-emerald-400 font-bold">✓</td>
                <td className="text-emerald-400 font-bold">✓</td>
                <td className="text-amber-300">협의</td>
                <td className="text-rose-400">✗</td>
                <td>보원</td>
              </tr>
              <tr>
                <td className="py-4 px-4 text-left font-bold text-amber-300">상업용</td>
                <td className="text-emerald-400 font-bold">✓</td>
                <td className="text-emerald-400 font-bold">✓</td>
                <td className="text-emerald-400 font-bold">✓</td>
                <td className="text-emerald-400 font-bold">✓</td>
                <td>보원</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. 저작권 안내 & 취소/환불 정책 + 양식 복사기 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#131722] border border-white/10 space-y-5 text-sm text-slate-300">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-bold">
              <ShieldAlert className="w-4 h-4" />
              저작권 및 이용 규정
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              모든 커미션 작업물의 저작권은 별도 계약서를 작성하지 않는 이상 모두 <strong className="text-slate-200">보원</strong>에게 있습니다.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-1">
                <p className="font-bold text-rose-300">금지 사항</p>
                <p className="text-slate-400">· 샘플 캡처 후 타 커미션 참고자료 사용 금지</p>
                <p className="text-slate-400">· 모든 작업물의 트레이싱 금지</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                <p className="font-bold text-emerald-300">허용 사항</p>
                <p className="text-slate-400">· 수익성 목적이 아닌 연습/공부 등의 목적 이용 자유</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-white/10">
            <p className="font-bold text-purple-300">취소 및 환불 정책</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              대부분 <strong className="text-slate-200">후불</strong>로 진행되며, 도중 취소 시 취소금을 지불하셔야 하고 취소한 작업물은 사용이 불가능합니다.
            </p>

            {/* 취소 시 비용 표 */}
            <table className="w-full text-xs text-left rounded-lg overflow-hidden border border-white/10">
              <thead className="bg-white/5 text-slate-300">
                <tr>
                  <th className="py-2 px-3">시점</th>
                  <th className="py-2 px-3">취소금</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-400">
                <tr>
                  <td className="py-2 px-3">첫 번째 중간 점검 도중</td>
                  <td className="py-2 px-3 text-emerald-400 font-semibold">0% (취소금 없음)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">첫 번째 중간 점검 이후</td>
                  <td className="py-2 px-3 text-rose-300 font-semibold">의뢰비용의 30%</td>
                </tr>
              </tbody>
            </table>

            <p className="text-xs text-slate-400 leading-relaxed">
              · 원본 파일 전달 이후에는 기본적으로 환불이 불가능합니다.<br />
              · 단, <strong className="text-slate-200">상업용 작업물</strong>의 경우 원본 전달 후 1달 내 방송 중단 등의 사유로 사용할 수 없게 된 경우 폐기 및 재사용 불가 조건으로 최대 <strong className="text-slate-200">80%</strong>까지 환불 가능합니다.
            </p>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>
                <strong>특수 상황:</strong> 어떠한 경우에도 사전에 아무런 얘기 없이 마감기한을 지키지 못한 경우에는 취소 비용을 부담하실 필요 없습니다.
              </span>
            </div>
          </div>
        </div>

        {/* 빠른 의뢰 신청 양식 복사 박스 */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-purple-950/40 border border-cyan-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm mb-2">
              <FileText className="w-4 h-4" />
              빠른 의뢰 신청 양식
            </div>
            <p className="text-xs text-slate-400 mb-3">
              양식을 복사한 뒤 Discord 채널에 붙여넣어 문의하시면 더 빠르게 견적 안내를 받으실 수 있습니다.
            </p>
            <pre className="p-3 rounded-xl bg-black/50 text-[11px] text-slate-300 whitespace-pre-wrap font-sans border border-white/5">
              {COMMISSION_TEMPLATE}
            </pre>
          </div>
          <button
            onClick={handleCopyTemplate}
            className="mt-4 w-full py-2.5 rounded-xl font-semibold text-xs bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition flex items-center justify-center gap-1.5"
          >
            {copiedTemplate ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedTemplate ? '신청 양식 복사 완료!' : '신청 양식 복사하기'}
          </button>
        </div>
      </div>
    </section>
  );
}
